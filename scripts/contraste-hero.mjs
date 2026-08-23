/**
 * Contraste del texto del hero sobre la fotografía real.
 *
 *   node scripts/contraste-hero.mjs [url]
 *
 * El resto de la web tiene los contrastes calculados sobre colores planos,
 * pero el hero escribe encima de una foto: ahí el fondo cambia píxel a
 * píxel y el degradado solo lo oscurece en parte. Un claim que se lee sobre
 * césped en sombra puede desaparecer sobre una pared blanca iluminada.
 *
 * Esto recorta la zona que ocupa cada texto, calcula la luminancia media y
 * la del 10 % de píxeles más claros —el peor caso real, no el promedio que
 * lo disimula— y comprueba el contraste contra el color del texto.
 *
 * Umbrales WCAG AA: 4,5:1 en texto normal; 3:1 a partir de 24 px, o de
 * 18,66 px en negrita.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';

const TEXTOS = [
  { sel: '.hero-wordmark', nombre: 'Wordmark', grande: true },
  { sel: '.hero .claim', nombre: 'Claim', grande: true },
  { sel: '.hero .descriptor, .hero [class*="descript"]', nombre: 'Descriptor', grande: false },
];

const canal = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminancia = (r, g, b) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const contraste = (l1, l2) => {
  const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (a + 0.05) / (b + 0.05);
};

const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const ctx = await navegador.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});
const pagina = await ctx.newPage();
await pagina.goto(BASE, { waitUntil: 'networkidle' });

// ¿Hay foto de verdad, o seguimos con el marcador de posición?
const conFoto = await pagina.evaluate(
  () => !!document.querySelector('.hero-photo img, .hero-photo picture img'),
);
console.log(conFoto ? '\n  Hero con fotografía.\n' : '\n  Hero sin foto todavía (marcador de posición).\n');

let fallos = 0;

for (const t of TEXTOS) {
  const el = pagina.locator(t.sel).first();
  if ((await el.count()) === 0) continue;

  const caja = await el.boundingBox();
  if (!caja) continue;

  // Color del texto tal y como lo calcula el navegador.
  const color = await el.evaluate((n) => getComputedStyle(n).color);
  const [tr, tg, tb] = color.match(/\d+/g).map(Number);
  const lTexto = luminancia(tr, tg, tb);

  // El fondo bajo el texto, con el degradado ya aplicado: se oculta el
  // propio texto para fotografiar solo lo que hay detrás.
  await el.evaluate((n) => (n.style.visibility = 'hidden'));
  const recorte = await pagina.screenshot({
    clip: { x: caja.x, y: caja.y, width: caja.width, height: caja.height },
  });
  await el.evaluate((n) => (n.style.visibility = ''));

  const png = PNG.sync.read(recorte);
  const lums = [];
  for (let i = 0; i < png.data.length; i += 4) {
    lums.push(luminancia(png.data[i], png.data[i + 1], png.data[i + 2]));
  }
  lums.sort((a, b) => a - b);
  const media = lums.reduce((s, v) => s + v, 0) / lums.length;
  const claros = lums.slice(Math.floor(lums.length * 0.9));
  const p90 = claros.reduce((s, v) => s + v, 0) / claros.length;

  const cMedia = contraste(lTexto, media);
  const cPeor = contraste(lTexto, p90);
  const minimo = t.grande ? 3 : 4.5;
  const pasa = cPeor >= minimo;
  if (!pasa) fallos++;

  console.log(
    `  ${pasa ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${t.nombre.padEnd(12)}` +
      `medio ${cMedia.toFixed(2)}:1   peor caso ${cPeor.toFixed(2)}:1   ` +
      `(mínimo ${minimo}:1${t.grande ? ', texto grande' : ''})`,
  );
}

await navegador.close();

console.log('');
if (fallos) {
  console.log(
    `  ${fallos} texto(s) sin contraste suficiente sobre la foto.\n` +
      `  Se corrige oscureciendo el degradado del hero en Hero.astro,\n` +
      `  no aclarando el texto: el blanco ya está al máximo.\n`,
  );
  process.exitCode = 1;
}
