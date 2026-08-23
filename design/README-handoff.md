# Handoff: Almadraba 8 — identidad visual y web (almadraba08.com)

## Overview
Almadraba 8 es una vivienda privada en Avenida de la Almadraba 8, Atlanterra, Zahara de los Atunes (Cádiz). No es un alojamiento turístico: es la casa de sus propietarios, que la habitan buena parte del otoño e invierno y solo la comparten algunas semanas al año (julio, agosto, puentes y ocasiones especiales).

Este paquete contiene (a) el manual de identidad aprobado y (b) el diseño de la web `almadraba08.com` (one-page con anclas). El objetivo del desarrollo es una web pública, muy ligera, con un formulario de consulta — **sin motor de reservas ni pasarela de pago**: las respuestas son personales.

## About the Design Files
Los archivos de este bundle son **referencias de diseño creadas en HTML** — prototipos que muestran el aspecto y comportamiento previstos, no código de producción para copiar tal cual. La tarea es **recrear estos diseños en el entorno del codebase destino** (Next.js/React, Astro, Vue, etc.) siguiendo sus patrones y librerías establecidos. Si no existe codebase todavía, la recomendación es **Astro** o **Next.js (App Router) con export estático**: la web es esencialmente contenido estático más un endpoint de formulario.

Los archivos `.dc.html` se abren directamente en un navegador. Los recuadros de imagen son componentes placeholder (`image-slot`) donde el cliente arrastra fotos: **en producción se sustituyen por `<img>`/`next/image` con las fotografías reales**, no se porta el componente.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografías, tamaños, tracking y espaciado son definitivos y deben recrearse fielmente con las herramientas del codebase. La única libertad es la implementación técnica (componentes, utilidades CSS, sistema de grid).

Nota: el proyecto tiene adjunto un design system genérico llamado "Organic" (redondeado, cálido, juguetón). **No aplica a esta marca** y debe ignorarse — la identidad de Almadraba 8 es sobria, angulosa, sin border-radius ni sombras decorativas.

---

## Design Tokens

### Color
| Token | HEX | Uso |
| --- | --- | --- |
| `--sand` | `#F3EBDA` | Fondo principal de página |
| `--sand-2` | `#E5DAC2` | Fondo de bandas secundarias |
| `--sand-3` | `#F8F3E7` | Superficies claras: campos de formulario, tarjetas |
| `--teal` | `#12706C` | **Tinta de marca**: logo, CTAs, cifras destacadas, enlaces |
| `--teal-light` | `#3AA79F` | Hover de enlaces de texto |
| `--sky` | `#7FB4D4` | Solo acompañante: filetes, kickers sobre fondo oscuro |
| `--night` | `#0E4E56` | Fondos oscuros, hover de botón primario |
| `--dune` | `#B7A98C` | Neutro cálido medio |
| `--ink` | `#26312F` | Texto principal, pie de página |
| `--ink-soft` | `#5C6C69` | Texto de párrafo secundario |
| `--muted` | `#8A8071` | Kickers y etiquetas sobre fondo arena |
| `--line` | `#E2D8C1` | Bordes y separadores sobre arena clara |
| `--line-2` | `#DACFB6` | Borde de campos de formulario |
| `--line-3` | `#C9BC9E` | Borde de chips sobre arena media |
| `--on-dark` | `#F8F3E7` | Texto sobre fondos oscuros |
| `--on-dark-soft` | `#BFD4D6` | Párrafo sobre azul noche |
| `--on-dark-muted` | `#8F9C99` | Enlaces del pie sobre carbón |

**Regla cromática:** la arena es siempre el fondo; el turquesa profundo es la tinta única de marca; el azul cielo solo acompaña (filetes, descriptores, kickers) — nunca los dos azules al mismo peso visual.

### Tipografía
Google Fonts: `Jost` (200, 300, 400, 500) y `Cormorant Garamond` (300, 400, 500). El manual usa además `Marcellus`, que **no hace falta en la web**.

| Rol | Fuente | Specs |
| --- | --- | --- |
| Wordmark | Jost 200 | caja alta, `letter-spacing: .34em`–`.38em`, `padding-left` igual al tracking (compensa el espacio final), **`white-space: nowrap` obligatorio** |
| Titular editorial | Cormorant Garamond 400 | 30–40px, `line-height: 1.2–1.3`, caja baja, sin tracking |
| Kicker / etiqueta | Jost 400 | 10–11px, `letter-spacing: .2em–.3em`, caja alta |
| Párrafo | Jost 300/400 | 15–16px, `line-height: 1.7–1.75` |
| Nav / botones | Jost 400 | 11px, `letter-spacing: .18em–.24em`, caja alta |
| Cifras destacadas | Cormorant Garamond 400 | 34px, color `--teal` |

### Geometría
- **Border-radius: 0** en todo (excepto avatares circulares en mockups de redes sociales). Sin sombras decorativas; solo la sombra suave de los mockups físicos del manual.
- Ancho máximo de contenido: **1200px**, padding lateral **48px**.
- Ritmo vertical de secciones: **110px** arriba y abajo (90px en la banda de características).
- Separación de columnas: **70px**; grid de imágenes: **18px**.

---

## Screens / Views

### Web — one-page (`Almadraba 8 - Web.dc.html`)

**1. Nav (sticky)**
Fondo `rgba(243,235,218,.94)` + `backdrop-filter: blur(8px)`, borde inferior `--line`. Altura de padding 20px/48px. Izquierda: wordmark Jost 300 / 13px / `.32em` en `--teal`. Derecha: enlaces "LA CASA", "ZAHARA", "DISPONIBILIDAD" (11px, `.2em`, `--ink-soft`) + CTA "ESCRÍBENOS" (fondo `--teal`, texto `--sand`, padding 11px 22px; hover `--night`). En móvil: wordmark + botón menú; el resto en panel desplegable a pantalla completa sobre `--sand`.

**2. Hero**
Alto 640px (en móvil ~78vh). Fotografía a sangre + degradado `linear-gradient(to top, rgba(14,78,86,.62), rgba(14,78,86,.10) 55%, rgba(14,78,86,.24))`. Contenido alineado abajo-izquierda dentro del contenedor de 1200px, padding inferior 76px: wordmark Jost 200 / 46px / `.34em` en `--on-dark`; filete 44×1px en `--sky`; claim Cormorant 30px "Nuestra casa junto al mar. Algunas semanas, también puede ser la tuya."; descriptor 10.5px `.3em` "ATLANTERRA · ZAHARA DE LOS ATUNES" en `#CFE0E6`.

**3. La casa** (`#casa`)
Dos columnas 1fr/1fr, gap 70px, alineadas al centro. Izquierda: kicker "LA CASA", titular Cormorant 40px "Una vivienda real, entre el Atlántico y la Sierra de la Plata.", dos párrafos. Derecha: fotografía de 460px de alto.

**4. La vivienda** (banda `--sand-2`)
Padding 90px. Grid de 4 columnas con las cifras: **2** dormitorios y un baño · **40 m²** de jardín privado con porche · **1** plaza de garaje · **∞** vistas abiertas a la montaña. Debajo, separador 1px `#D3C6A9` y una fila de chips con borde `--line-3`, 12px `.12em`: SALÓN-COMEDOR, COCINA CONTEMPORÁNEA, PISCINA COMUNITARIA, ZONAS AJARDINADAS, WIFI Y ESPACIO DE TRABAJO, PLAYA A PIE.

**5. Zahara** (`#zahara`)
Cabecera a dos bloques (titular Cormorant 38px a la izquierda, párrafo 15px a la derecha, alineados por la línea base inferior). Debajo, galería grid `2fr 1fr 1fr` de 380px de alto.

**6. Disponibilidad** (`#disponibilidad`, fondo `--night`)
Dos columnas. Izquierda: kicker en `--sky`, titular "Algunas semanas al año." y dos párrafos en `--on-dark-soft`. Derecha: lista de cuatro filas separadas por `1px solid rgba(191,212,214,.28)` — Julio / SEMANAS SELECCIONADAS, Agosto / SEMANAS SELECCIONADAS, Puentes y festivos / CONSULTAR, Resto del año / NUESTRA CASA (esta última en `rgba(191,212,214,.55)`).

**7. Contacto** (`#contacto`)
Dos columnas. Izquierda: titular "Cuéntanos quién viene y cuándo.", nota "Respondemos personalmente. No hay motor de reservas ni respuestas automáticas." y la dirección postal. Derecha: formulario — Nombre + Email (dos columnas), Fechas aproximadas, textarea de 5 filas, y botón de bloque "ENVIAR CONSULTA". Campos: fondo `--sand-3`, borde `--line-2`, padding 15px 16px, sin radio.

**8. Pie** (fondo `--ink`)
Wordmark 16px en `--on-dark` + descriptor; a la derecha, enlaces INSTAGRAM / AVISO LEGAL / almadraba08.com en `--on-dark-muted`.

### Manual de identidad (`Almadraba 8 - Identidad.dc.html`)
Referencia de marca: construcción del wordmark (vertical, horizontal, desnudo, monograma A8, símbolo 8), versiones sobre fondo oscuro y a una tinta, área de seguridad, tamaño mínimo, paleta, tipografía, aplicaciones físicas y reglas de uso. No es una página del sitio; sirve para favicon, avatares, OG image y materiales impresos.

---

## Interactions & Behavior
- **Nav sticky** con fondo translúcido y blur; los enlaces hacen scroll suave a sus anclas (`scroll-behavior: smooth`, con `prefers-reduced-motion` respetado).
- **Hover:** enlaces de texto `--ink-soft` → `--teal`; enlaces de marca `--teal` → `--teal-light`; botones `--teal` → `--night`. Transición 160ms ease.
- **Focus visible:** `outline: 2px solid var(--teal); outline-offset: 2px` en todo elemento interactivo. Nunca el anillo azul por defecto.
- **Formulario:** validación nativa (nombre y email requeridos, `type="email"`). Envío a un endpoint propio o servicio tipo Formspree/Resend; estados de envío, éxito ("Gracias — te respondemos personalmente en cuanto podamos.") y error, en el mismo lugar del botón. Honeypot antispam, sin captcha visible.
- **Imágenes:** `loading="lazy"` salvo el hero, formatos AVIF/WebP con `srcset`, `object-fit: cover`.
- **Animación:** mínima. Como mucho, un fade-in sutil de secciones al entrar en viewport (opacidad + 12px de desplazamiento, 500ms). Nada de parallax ni carruseles automáticos.

## Responsive
- ≥1200px: layout descrito.
- 900–1199px: mismo layout, padding lateral 32px.
- <900px: todas las rejillas de dos columnas pasan a una; la banda de cifras a 2 columnas; la galería de Zahara a scroll horizontal o pila; el hero baja a ~78vh y el wordmark a 28–32px manteniendo el tracking y el `nowrap`.
- El wordmark **nunca** reduce su tracking para caber: si no cabe, se baja el `font-size` o se usa el monograma A8.

## State Management
Mínimo: apertura del menú móvil, y estado del formulario (`idle | sending | success | error`) con los valores de los campos. No hace falta store global ni fetching de datos; el contenido es estático (Markdown/MDX o constantes) para que los propietarios puedan editar textos y disponibilidad.

## Assets
- **Fotografía:** aún no entregada. En los prototipos hay placeholders indicando qué va en cada hueco (fachada/porche, salón, jardín, playa, Sierra de la Plata, detalle del pueblo). Todas las fotos deben ser reales de la casa y del entorno; nada de banco de imágenes genérico de "resort".
- **Logo:** es puramente tipográfico — se compone con Jost, no hay SVG que importar. Para favicon y avatares, generar un cuadrado sólido `--teal` con "A8" centrado en Jost 300 (versión de 16px con peso 400 para que aguante).
- **Fuentes:** Jost y Cormorant Garamond (Google Fonts / SIL OFL). Recomendado auto-hospedarlas y precargar el subset latino.
- **OG image:** 1200×630, fondo `--night`, wordmark centrado en `--on-dark` con filete `--sky`.

## Iconografía y prohibiciones (del brief, vinculantes)
Nada de peces, atunes, redes, barcos, anclas, timones, conchas, palmeras, olas, puestas de sol, gaviotas, faros, sombrillas, tumbonas, casas dibujadas, llaves, estrellas de hotel, coronas ni dorados. Nada de estética "resort" ni inmobiliaria. Nada de azul marino + blanco. Si hacen falta iconos de interfaz, usar un set de línea neutro y sobrio a 1.25–1.5px de grosor, en `--ink-soft`.

## Copy aprobado
- Claim ES: **Nuestra casa junto al mar. Algunas semanas, también puede ser la tuya.**
- Claim EN: **Our home by the Atlantic. For a few weeks each year, it could be yours.**
- Descriptor: **Atlanterra · Zahara de los Atunes**
- La marca se escribe siempre **Almadraba 8**. "08" solo en el dominio `almadraba08.com` y en recursos gráficos donde aporte valor. El nombre no se traduce.

## Internacionalización
Preparar la web para ES/EN desde el principio (rutas `/` y `/en`, o `next-intl`/`astro-i18n`). El copy inglés existe para los claims; el resto se traducirá.

## Fuera de alcance (no implementar)
- Motor de reservas, calendario sincronizado o pagos.
- Cualquier referencia al eclipse de 2027 en la identidad o el diseño base. Será una **campaña temporal** posterior ("Almadraba 8 · Totality 2027") en una landing aparte.
- Reutilizar la marca, colores o tipografía de Zarabita, Dalia Zahara o Grupo ABU.

## Files
- `Almadraba 8 - Web.dc.html` — diseño de la web (one-page).
- `Almadraba 8 - Identidad.dc.html` — manual de identidad completo.
- `Logo Explorations.dc.html` — exploraciones previas de logo (contexto; la dirección aprobada es el wordmark 2a).
- `image-slot.js` — componente de placeholder de imagen usado por los prototipos. **Solo para los prototipos**, no se lleva a producción.
- `support.js` — runtime necesario para abrir los `.dc.html` en el navegador.
- `CLAUDE.md` — resumen de la identidad, para dejar en la raíz del repo como memoria del proyecto.
