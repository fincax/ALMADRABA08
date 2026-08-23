/**
 * Empaqueta la portada en un único archivo HTML autocontenido.
 *
 *   npm run build && node scripts/vista-previa.mjs [salida.html]
 *
 * Sirve para enseñar la web sin desplegarla: se abre con doble clic o se
 * publica en cualquier sitio. Empotra el CSS y las tipografías como datos,
 * así que no pide nada a ningún servidor.
 *
 * El JavaScript de la web ya va en línea en el HTML compilado, de modo que
 * lo que se ve aquí es exactamente el mismo código que en producción. Lo
 * único añadido es una capa que suple lo que en la vista previa no existe:
 * el envío del formulario y las otras páginas del sitio.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = 'dist/client';
const ENTRADA = join(DIST, 'index.html');
const SALIDA = process.argv[2] ?? 'vista-previa.html';
// Título opcional: al publicar la vista previa en una galería conviene el
// nombre de la marca a secas, no el título largo que la web usa para
// buscadores.
const TITULO = process.argv[3];

const html = readFileSync(ENTRADA, 'utf8');

/** Convierte una ruta del sitio en un data: URI. */
function comoDatos(ruta, tipo) {
  const archivo = join(DIST, ruta.replace(/^\//, ''));
  return `data:${tipo};base64,${readFileSync(archivo).toString('base64')}`;
}

// ── CSS, con las tipografías empotradas dentro ──────────────────────────
const hojas = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g)];
let css = '';
for (const [, ruta] of hojas) {
  css += readFileSync(join(DIST, ruta.replace(/^\//, '')), 'utf8') + '\n';
}
// Astro puede haber dejado también estilos en línea en el <head>.
for (const [, bloque] of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
  css += bloque + '\n';
}
css = css.replace(/url\((\/fonts\/[^)]+\.woff2)\)/g, (_, ruta) =>
  `url(${comoDatos(ruta, 'font/woff2')})`,
);

// ── Contenido y scripts del <body> ──────────────────────────────────────
const cuerpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

// El script del <head> que marca `html.js`: sin él las secciones con
// animación de entrada se quedarían ocultas para siempre.
const marcaJs = html.includes("classList.add(`js`)") || html.includes("classList.add('js')");

const titulo = TITULO ?? (html.match(/<title>([^<]*)<\/title>/) ?? [, 'Almadraba 8'])[1];

// ── Capa de vista previa ────────────────────────────────────────────────
// Se registra en fase de captura para adelantarse a los manejadores de la
// propia web, que aquí no tendrían a dónde enviar.
const disponibilidad = readFileSync(join(DIST, 'availability.json'), 'utf8');

const capa = `
<div id="vp-aviso" role="status" aria-live="polite" hidden></div>
<script>
(function () {
  // La web vuelve a pedir la disponibilidad al cargar para reflejar una
  // edición hecha en el servidor. Aquí no hay servidor, así que se sirve
  // el mismo archivo desde memoria en lugar de dejar un 404 en la consola.
  var DISPONIBILIDAD = ${disponibilidad};
  var fetchOriginal = window.fetch;
  window.fetch = function (recurso, opciones) {
    var url = typeof recurso === 'string' ? recurso : (recurso && recurso.url) || '';
    if (url.indexOf('/availability.json') !== -1) {
      return Promise.resolve(new Response(JSON.stringify(DISPONIBILIDAD), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));
    }
    return fetchOriginal.apply(this, arguments);
  };
  var aviso = document.getElementById('vp-aviso');
  var reloj;
  function decir(texto) {
    aviso.textContent = texto;
    aviso.hidden = false;
    aviso.classList.add('visible');
    clearTimeout(reloj);
    reloj = setTimeout(function () {
      aviso.classList.remove('visible');
      setTimeout(function () { aviso.hidden = true; }, 300);
    }, 5200);
  }

  // El formulario: se valida de verdad, pero no hay servidor al que enviar.
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('#booking-form');
    if (!form) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    var estado = form.querySelector('.form-status');
    if (estado) {
      estado.textContent = form.dataset.msgSuccess || '';
      estado.classList.remove('err');
      estado.classList.add('ok');
      estado.hidden = false;
    }
    form.reset();
    decir('Vista previa: la validación es real, pero no se ha enviado ningún correo.');
  }, true);

  // Las demás páginas del sitio no viajan en este archivo.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    decir('Vista previa: solo incluye la portada. La web tiene además /en/ y /legal/.');
  }, true);
})();
</script>`;

const salida = `<meta charset="utf-8">
<title>${titulo}</title>
<style>
${css}
/* Aviso de la vista previa. Usa los mismos colores de la marca. */
#vp-aviso {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%) translateY(10px);
  z-index: 9999;
  max-width: min(90vw, 460px);
  background: var(--abyss, #0B3F47);
  color: var(--on-dark, #F8F3E7);
  font-family: var(--font-sans, 'Jost', sans-serif);
  font-size: 13px;
  line-height: 1.5;
  padding: 13px 20px;
  text-align: center;
  opacity: 0;
  transition: opacity .3s ease, transform .3s ease;
  pointer-events: none;
}
#vp-aviso.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
@media (prefers-reduced-motion: reduce) {
  #vp-aviso { transition: none; }
}
</style>
${marcaJs ? '<script>document.documentElement.classList.add("js");</script>' : ''}
${cuerpo}
${capa}
`;

writeFileSync(SALIDA, salida);
const kb = Math.round(Buffer.byteLength(salida) / 1024);
console.log(`  ✓ ${SALIDA} — ${kb} KB, sin recursos externos`);
