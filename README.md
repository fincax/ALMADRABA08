# Almadraba 8 — almadraba08.com

Web de **Almadraba 8**, vivienda privada en Avenida de la Almadraba 8, Atlanterra, Zahara de los Atunes (Cádiz). Nuestra casa junto al mar; se comparte algunas semanas al año. Sin motor de reservas ni pagos: las solicitudes se responden personalmente.

One-page estática construida con [Astro](https://astro.build), en español (`/`) e inglés (`/en/`).

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # genera dist/ (estático)
npm run preview   # sirve dist/ en local
```

Desplegable en cualquier hosting estático (Netlify, Vercel, Cloudflare Pages, GitHub Pages…): comando `npm run build`, carpeta de salida `dist/`.

## Lo que hay que configurar antes de publicar

1. **Formulario de solicitud de reserva** — en `src/data/site.ts`, rellenar `formEndpoint` con un endpoint que acepte POST de FormData (Formspree, Basin, Getform o endpoint propio). Mientras esté vacío, el formulario muestra un aviso al enviar. Ahí mismo se configura el perfil de `instagram`.
2. **Fotografías** — colocar las fotos reales en `public/photos/` y pasar `src="/photos/…"` a cada `<Photo …>` en los componentes (hero, la casa y las tres de Zahara). Mientras no haya foto se muestra un placeholder sobrio con la etiqueta del hueco.

## Actualizar la disponibilidad

La disponibilidad vive en **`public/availability.json`** y se puede editar sin tocar código (también directamente desde GitHub). Cada periodo:

```json
{ "id": "jul-2027-s1", "start": "2027-07-03", "end": "2027-07-10",
  "label": { "es": "Julio · semana 1", "en": "July · week 1" },
  "status": "libre" }
```

- `status`: `libre` · `reservada` · `consultar`.
- Actualizar también el campo `updated` (fecha ISO) al editar.
- Los periodos ya pasados se ocultan solos; los `libre` y `consultar` muestran el botón **Solicitar**, que rellena las fechas del formulario.
- La web vuelve a pedir el JSON al cargar, de modo que si el archivo se edita en el hosting el cambio se ve sin reconstruir. Si se edita en el repo, el redeploy lo publica.

## Estructura

```
src/
  components/    Nav, Hero, Casa, Vivienda, Zahara, Disponibilidad, Contacto, Footer, Photo
  data/site.ts   Configuración (endpoint del formulario, Instagram, dirección)
  i18n/ui.ts     Todo el copy ES/EN
  layouts/       Base.astro (head, SEO, OG, fuentes)
  pages/         index.astro (ES) · en/index.astro (EN)
  styles/        global.css (tokens del manual de identidad)
public/
  availability.json   Disponibilidad editable
  fonts/              Jost y Cormorant Garamond autohospedadas (woff2, subset latino)
  favicon.svg · favicon-32.png · apple-touch-icon.png · og.png
design/
  Manual de identidad, diseño de la web y exploraciones de logo (.dc.html),
  más el handoff completo (README-handoff.md). Referencia, no producción.
```

## ⚠️ Pendiente de confirmar antes de publicar

La sección **«Antes de escribir»** (`condiciones` en `src/i18n/ui.ts`) se ha
redactado con valores **provisionales y plausibles**, no con datos reales.
Antes de que la web sea pública hay que confirmar uno por uno:

| Campo | Valor provisional |
| --- | --- |
| Capacidad | Hasta cuatro personas |
| Estancia mínima | 7 noches en julio y agosto (sábado a sábado); 3 en puentes |
| Entrada y salida | Entrada 17:00 · salida 11:00 |
| Incluido | Ropa de cama y toallas, limpieza final, wifi, garaje y consumos |
| Mascotas | «Lo hablamos» |
| Convivencia | Sin fiestas ni eventos; no se fuma dentro |
| Reserva | Señal por transferencia; resto un mes antes |

Están marcados en el código con un comentario `⚠️ PROVISIONAL`. Se editan
todos en `src/i18n/ui.ts`, en las claves `es.condiciones` y `en.condiciones`.


## Subir contenido sin tocar código

**Fotos.** Deja el archivo en `src/assets/photos/` con el nombre del hueco
(`hero.jpg`, `salon.jpg`, `playa.jpg`…). La compilación genera AVIF, WebP y
JPEG en cuatro anchos, con `srcset` y `width`/`height` para que no salte el
layout. Un hueco sin archivo mantiene su placeholder, así que se pueden
subir de una en una. La tabla completa de huecos está en
`src/assets/photos/README.md`.

**Secciones en espera.** «Cómo llegar» (`entorno`) y «Nuestro Zahara»
(`nuestroZahara`) están montadas pero **no se renderizan** mientras su lista
`items` esté vacía: no dejan hueco ni rastro en el HTML. Para publicarlas
basta con rellenar la lista en `src/i18n/ui.ts`, en ES y EN. No están en el
nav a propósito — son contenido de la zona de Zahara, y seis entradas de
menú serían demasiadas.


## Poner la web en marcha

Todo lo imprescindible está en `src/data/site.ts`. La compilación avisa por
consola mientras falte cualquiera de estas dos cosas.

### 1. Formulario y correo

El formulario **no usa ningún servicio externo**: envía a `/api/reserva`, un
endpoint propio que manda el correo por el SMTP del buzón de IONOS. Nadie más
llega a ver las solicitudes.

Las credenciales van en variables de entorno del servidor, nunca en el
repositorio: copiar `.env.example` y rellenar `SMTP_PASS`. Toda la puesta en
marcha —Nginx, systemd, certificado, DNS— está en
[`docs/despliegue.md`](docs/despliegue.md).

Lo que trae el endpoint de serie:

- Validación en servidor de todos los campos, además de la del navegador.
- Rechazo de saltos de línea en nombre y correo, que serían inyección de
  cabeceras SMTP.
- Honeypot y trampa temporal: un envío instantáneo es un bot. A los bots se
  les responde «enviado» para que no reintenten, pero no se manda nada.
- Cinco envíos por hora e IP, y treinta peticiones. Los dos contadores están
  separados a propósito: si los intentos fallidos gastaran el cupo de envíos,
  a quien se le resistiera el formulario se le cerraría la puerta una hora.
  La IP real se saca del último valor de `X-Forwarded-For`, el que añade
  Nginx: sin eso, detrás del proxy todas las visitas compartirían un cupo.
- TLS obligatorio: en el puerto 587 se niega a enviar si el servidor no
  ofrece STARTTLS, en lugar de mandar las credenciales en claro.
- Protección CSRF de Astro, que rechaza los POST venidos de otro origen.
- Funciona sin JavaScript: el envío normal redirige a la portada del idioma
  correcto con el aviso puesto.

### 2. Datos del titular (obligatorio por ley)

Rellenar `site.legal` con `holder`, `taxId`, `email` y `postal`. Mientras
falten, la página `/legal/` los muestra marcados en rojo como
**PENDIENTE DE COMPLETAR** — a propósito: es preferible que cante en
pantalla a que la web se publique con el aviso legal a medias.

### Cumplimiento: qué hay y qué no

| Pieza | Estado |
| --- | --- |
| Aviso legal (LSSI art. 10) | `/legal/` y `/en/legal/` — faltan los datos del titular |
| Política de privacidad (RGPD art. 13) | En la misma página, con anclaje `#privacidad` |
| Consentimiento en el formulario | Casilla obligatoria, enlazada a la política |
| Constancia del consentimiento (RGPD art. 7.1) | El correo registra fecha, hora y versión de la política aceptada |
| Información básica junto al formulario | Modelo por capas de la AEPD; aparece al rellenar `site.legal` |
| Banner de cookies | **No hace falta** — ver abajo |

### Sobre el cumplimiento

La web **no instala cookies**, no usa analítica y no carga recursos de
terceros (las tipografías se sirven desde el propio dominio), así que **no
necesita banner de cookies**. No es un descuido: es la consecuencia de no
haber metido nada que las ponga, y conviene no perderlo. Añadir Google
Analytics, un mapa incrustado, un vídeo de YouTube o una fuente servida
desde Google obligaría a poner banner y a rehacer la política.

Lo único que trata datos personales es el formulario, con casilla de
consentimiento obligatoria y constancia de cuándo se prestó.

Como el formulario se procesa en servidor propio y el correo sale por IONOS
—ambos en la Unión Europea—, **no hay transferencias internacionales** que
declarar. Si algún día cambia el alojamiento o el proveedor de correo, hay
que actualizar el apartado «Quién más los ve» en `src/i18n/legal.ts`.

> Los textos legales están redactados a partir de la LSSI-CE (art. 10) y del
> RGPD (art. 13) para este caso concreto, pero **no son asesoramiento
> jurídico**. Conviene que los revise un profesional antes de publicar,
> sobre todo los plazos de conservación y el régimen fiscal del alquiler.


## Comprobaciones

Cada push las pasa solas en GitHub Actions (`.github/workflows/ci.yml`):
auditoría de seguridad, compilación, cobertura del sitemap, las pruebas del
endpoint contra un SMTP de mentira y la revisión visual. A mano:

```sh
npm run probar                      # 15 pruebas del endpoint (no envían correo)
./scripts/probar-reserva.sh https://almadraba08.com --con-envio
node scripts/capturas.mjs           # capturas en móvil, tablet y escritorio
npm run vista-previa                # portada en un solo HTML autocontenido
npm run contraste                   # legibilidad del hero sobre la foto
```

Con `--con-envio` son 21 e incluyen el envío real, las cabeceras del correo
y el limitador. Cada ejecución usa una IP distinta, así que se puede repetir
sin agotar el cupo.

`npm run contraste` mide el contraste real del wordmark, el claim y el
descriptor **sobre los píxeles de la fotografía**, no sobre un color plano:
recorta la zona de cada texto, calcula la luminancia media y la del 10 % de
píxeles más claros —el peor caso, que el promedio disimula— y comprueba el
resultado contra WCAG AA. Conviene pasarlo cada vez que cambie la foto del
hero; el flujo de integración continua ya lo hace.

`npm run vista-previa` empaqueta la portada en un único archivo HTML con el
CSS y las tipografías empotrados: se abre con doble clic o se sube a
cualquier sitio, sin servidor. Sirve para enseñar la web antes de
desplegarla. El JavaScript es el mismo que el de producción; lo único
añadido es una capa que suple lo que allí no existe — el envío del
formulario, que valida de verdad pero no manda correo, y las otras páginas
del sitio, que no viajan en el archivo.

`scripts/capturas.mjs` recorre las cuatro páginas en tres tamaños y avisa si
alguna se desborda horizontalmente — el fallo responsive más fácil de pasar
por alto, porque solo se nota al deslizar de lado. Usa un viewport real, no
una ventana gigante: el hero se mide en `vh` y una ventana de 12 000 px lo
haría ocupar 9 360.


## Identidad

La paleta de la web es la revisión «mar, cielo y arena» documentada en `CLAUDE.md`, con todos los pares de texto verificados a WCAG AA.

Resumen operativo en `CLAUDE.md`; manual completo en `design/Almadraba 8 - Identidad.dc.html` y handoff en `design/README-handoff.md`. Reglas clave: arena de fondo, mar profundo `#15747F` como tinta única de marca, con el turquesa mar `#3AA79F` y el azul cielo `#7FB4D4` como acentos de superficie; wordmark Jost 200 en caja alta con su tracking intacto y `white-space: nowrap`; sin border-radius, sin sombras decorativas, sin iconografía de playa; la marca se escribe siempre «Almadraba 8».
