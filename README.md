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


## Identidad

La paleta de la web es la revisión «mar, cielo y arena» documentada en `CLAUDE.md`, con todos los pares de texto verificados a WCAG AA.

Resumen operativo en `CLAUDE.md`; manual completo en `design/Almadraba 8 - Identidad.dc.html` y handoff en `design/README-handoff.md`. Reglas clave: arena de fondo, mar profundo `#15747F` como tinta única de marca, con el turquesa mar `#3AA79F` y el azul cielo `#7FB4D4` como acentos de superficie; wordmark Jost 200 en caja alta con su tracking intacto y `white-space: nowrap`; sin border-radius, sin sombras decorativas, sin iconografía de playa; la marca se escribe siempre «Almadraba 8».
