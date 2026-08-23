# Despliegue en Clouding.io con dominio en IONOS

La web son páginas estáticas más **un único endpoint** (`/api/reserva`) que
envía el correo del formulario. Por eso hace falta un proceso Node vivo, con
Nginx delante atendiendo Internet y sirviendo los archivos estáticos.

```
Internet ──► Nginx (443, TLS)
               ├── /            archivos de dist/client  (HTML, CSS, fotos)
               └── /api/reserva ──► Node en 127.0.0.1:4321 ──► SMTP de IONOS
```

---

## 1. DNS en IONOS

En el panel de IONOS, en la zona DNS de `almadraba08.com`:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| `A` | `@` | la IP del servidor de Clouding |
| `A` | `www` | la IP del servidor de Clouding |

Los registros de correo (`MX`, y el `TXT` de SPF) **no se tocan**: los pone
IONOS y son los que hacen que el buzón funcione.

Comprobar que ha propagado antes de seguir:

```sh
dig +short almadraba08.com
```

## 2. Preparar el servidor

En una Ubuntu recién creada en Clouding, como root:

```sh
apt update && apt upgrade -y
apt install -y nginx git curl ufw

# Node 22 desde el repositorio oficial de NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Cortafuegos: solo SSH y web
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

Un usuario sin privilegios para la aplicación — el servicio no debe correr
como root:

```sh
adduser --system --group --home /var/www/almadraba8 almadraba8
```

## 3. Clonar y compilar

```sh
cd /var/www/almadraba8
sudo -u almadraba8 git clone <URL-del-repositorio> app
cd app
sudo -u almadraba8 npm ci
sudo -u almadraba8 npm run build
```

## 4. Credenciales del correo

```sh
cp .env.example /etc/almadraba8.env
nano /etc/almadraba8.env     # rellenar SMTP_PASS y comprobar el resto
chown root:almadraba8 /etc/almadraba8.env
chmod 640 /etc/almadraba8.env
```

El archivo queda fuera del repositorio y solo lo puede leer el servicio.

## 5. Servicio de systemd

`/etc/systemd/system/almadraba8.service`:

```ini
[Unit]
Description=Almadraba 8 — web y formulario de reserva
After=network.target

[Service]
Type=simple
User=almadraba8
Group=almadraba8
WorkingDirectory=/var/www/almadraba8/app
EnvironmentFile=/etc/almadraba8.env
ExecStart=/usr/bin/node ./dist/server/entry.mjs
Restart=always
RestartSec=5

# Endurecimiento: el proceso solo necesita leer su propio directorio.
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/almadraba8/app

[Install]
WantedBy=multi-user.target
```

```sh
systemctl daemon-reload
systemctl enable --now almadraba8
systemctl status almadraba8
```

## 6. Nginx

`/etc/nginx/sites-available/almadraba8`:

```nginx
server {
    listen 80;
    server_name almadraba08.com www.almadraba08.com;
    root /var/www/almadraba8/app/dist/client;

    # Solo el endpoint pasa por Node; el resto lo sirve Nginx directamente,
    # que para eso es un servidor de archivos y es mucho más rápido.
    location /api/ {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Un formulario legítimo no llega a 16 KB.
        client_max_body_size 32k;
    }

    # Las fotos y tipografías llevan huella en el nombre: se pueden cachear
    # para siempre. El HTML no, o no se vería un cambio hasta pasado un año.
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location /fonts/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # La disponibilidad se edita a mano en el servidor: no debe cachearse.
    location = /availability.json {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/index.html $uri.html =404;
    }
}
```

```sh
ln -s /etc/nginx/sites-available/almadraba8 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 7. Certificado TLS

```sh
apt install -y certbot python3-certbot-nginx
certbot --nginx -d almadraba08.com -d www.almadraba08.com
```

Certbot reescribe la configuración para servir por HTTPS y renueva solo.
Comprobar la renovación automática:

```sh
systemctl list-timers | grep certbot
```

## 8. Comprobar que el formulario envía

Desde el propio servidor:

```sh
curl -s -X POST https://almadraba08.com/api/reserva \
  -H 'Accept: application/json' \
  -H 'Origin: https://almadraba08.com' \
  -F 'nombre=Prueba' -F 'email=tu@correo.com' \
  -F 'llegada=2027-07-03' -F 'salida=2027-07-10' \
  -F 'personas=2' -F 'consentimiento=on' -F '_lang=es' \
  -F "_ts=$(( ($(date +%s) - 30) * 1000 ))"
```

Debe responder `{"ok":true}` y llegar el correo. Si algo falla:

```sh
journalctl -u almadraba8 -n 50 --no-pager
```

La cabecera `Origin` es obligatoria: Astro rechaza los envíos POST de otro
origen como medida contra CSRF. El navegador la manda sola.

---

## Publicar cambios

```sh
cd /var/www/almadraba8/app
sudo -u almadraba8 git pull
sudo -u almadraba8 npm ci
sudo -u almadraba8 npm run build
systemctl restart almadraba8
```

**Cambiar solo la disponibilidad** no exige compilar: se edita
`dist/client/availability.json` en el servidor y el navegador lo recoge al
cargar, porque la página vuelve a pedir el archivo. Conviene reflejar el
mismo cambio en `public/availability.json` del repositorio, o la siguiente
compilación lo revertirá.

---

## Detalles que conviene recordar

**El correo sale del dominio, no del visitante.** El remitente es siempre
una dirección de `almadraba08.com`, y la del visitante va en `Reply-To`.
Puesto al revés, el correo fallaría SPF y DKIM y acabaría en spam. Para
contestar basta con dar a «Responder».

**El servidor no envía correo por su cuenta.** Todo pasa por el SMTP
autenticado de IONOS, que ya tiene reputación y registros SPF y DKIM. Enviar
directamente desde la IP de Clouding acabaría en la carpeta de spam: es una
IP nueva, sin historial, y muchos proveedores bloquean el puerto 25 de
salida.

**El límite de frecuencia vive en memoria** y se reinicia con el servicio.
Son cinco envíos por hora e IP, más un tope de treinta peticiones. Si algún
día hicieran falta varios procesos, habría que sacarlo a un almacén común.

**Copia de seguridad.** Lo único que no está en el repositorio es
`/etc/almadraba8.env` y, si se ha editado a mano en el servidor,
`dist/client/availability.json`.
