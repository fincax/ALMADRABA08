/**
 * Circuito de fotografías.
 *
 * Para publicar una foto basta con dejar el archivo en `src/assets/photos/`
 * con el nombre del hueco que ocupa. No hay que tocar código: Astro la
 * detecta, la reescala y sirve AVIF/WebP con `srcset` automáticamente.
 *
 * Huecos disponibles (el nombre del archivo, sin extensión):
 *   hero                   portada a sangre
 *   casa                   sección «La casa»
 *   salon                  galería · salón-comedor
 *   porche                 galería · porche y jardín
 *   cocina                 galería · cocina
 *   dormitorio-principal   galería · dormitorio principal
 *   dormitorio-segundo     galería · segundo dormitorio
 *   bano                   galería · baño
 *   piscina                galería · piscina y zonas comunes
 *   playa                  Zahara · playa o dunas
 *   sierra                 Zahara · Sierra de la Plata
 *   pueblo                 Zahara · detalle del pueblo
 *
 * Ejemplo: `src/assets/photos/salon.jpg` llena el hueco del salón.
 * Formatos admitidos: jpg, jpeg, png, webp, avif. Cuanto mayor sea el
 * original, mejor — el reescalado lo hace la compilación.
 */
import type { ImageMetadata } from 'astro';

const archivos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const porHueco = new Map<string, ImageMetadata>();
for (const [ruta, mod] of Object.entries(archivos)) {
  const hueco = ruta.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  porHueco.set(hueco, mod.default);
}

/** Devuelve la imagen de un hueco, o undefined si aún no se ha entregado. */
export function fotoDe(hueco: string): ImageMetadata | undefined {
  return porHueco.get(hueco.toLowerCase());
}

/** Cuántas fotos hay entregadas (para avisos en la compilación). */
export const fotosEntregadas = porHueco.size;
