/**
 * Capturas de la web para revisión visual.
 *
 *   node scripts/capturas.mjs [url] [carpeta]
 *
 * Usa un viewport real —no una ventana gigante— porque el hero se mide en
 * `vh`: en una ventana de 12 000 px de alto ocuparía 9 360, y la captura
 * mentiría. Playwright hace el desplazamiento por su cuenta.
 *
 * Fuerza `prefers-reduced-motion`, así las secciones no dependen del
 * observador de scroll para aparecer.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const SALIDA = process.argv[3] ?? 'capturas';

const DISPOSITIVOS = [
  { nombre: 'movil', viewport: { width: 390, height: 844 }, dsf: 2 },
  { nombre: 'tablet', viewport: { width: 834, height: 1112 }, dsf: 2 },
  { nombre: 'escritorio', viewport: { width: 1440, height: 900 }, dsf: 1 },
];

const PAGINAS = [
  { nombre: 'portada', ruta: '/' },
  { nombre: 'portada-en', ruta: '/en/' },
  { nombre: 'legal', ruta: '/legal/' },
  { nombre: '404', ruta: '/no-existe-esta-pagina' },
];

mkdirSync(SALIDA, { recursive: true });

const navegador = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

let problemas = 0;

for (const d of DISPOSITIVOS) {
  const ctx = await navegador.newContext({
    viewport: d.viewport,
    deviceScaleFactor: d.dsf,
    reducedMotion: 'reduce',
    locale: 'es-ES',
  });
  const pagina = await ctx.newPage();

  for (const p of PAGINAS) {
    await pagina.goto(BASE + p.ruta, { waitUntil: 'networkidle' });
    await pagina.screenshot({
      path: join(SALIDA, `${d.nombre}-${p.nombre}.png`),
      fullPage: true,
    });

    // Desbordamiento horizontal: el fallo responsive más común y el más
    // fácil de pasar por alto, porque solo se nota al deslizar de lado.
    const ancho = await pagina.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    if (ancho.documento > ancho.ventana + 1) {
      console.log(
        `  ✗ ${d.nombre}/${p.nombre}: la página se desborda ` +
          `(${ancho.documento}px en un viewport de ${ancho.ventana}px)`,
      );
      problemas++;
    }
  }
  await ctx.close();
}

await navegador.close();

if (problemas === 0) {
  console.log(`  ✓ ${DISPOSITIVOS.length * PAGINAS.length} capturas, sin desbordamiento horizontal`);
} else {
  process.exitCode = 1;
}
