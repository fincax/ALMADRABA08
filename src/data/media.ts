/**
 * Vídeos y visitas virtuales de la galería.
 *
 * VÍDEOS — no hay que tocar este archivo: se dejan los .mp4 en
 * `public/videos/` y la compilación los recoge (ver el README de esa
 * carpeta). Autohospedados a propósito: YouTube o Vimeo incrustan
 * contenido de terceros, y eso obligaría a banner de cookies y a rehacer
 * la política de privacidad.
 *
 * VISITAS VIRTUALES — se rellenan aquí. Se abren en pestaña nueva, nunca
 * incrustadas, por la misma razón: un iframe de Matterport o similar carga
 * al tercero dentro de nuestra página; un enlace solo lo carga cuando el
 * visitante decide ir. Con la lista vacía no se muestra nada.
 */
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface Video {
  /** Ruta pública del mp4. */
  src: string;
  /** Fotograma de portada, si hay un .jpg con el mismo nombre. */
  poster?: string;
  /** Nombre del archivo sin extensión, para el aria-label. */
  nombre: string;
}

export interface Tour {
  url: string;
  title: { es: string; en: string };
}

/** Visitas virtuales. Ejemplo:
 *  { url: 'https://my.matterport.com/show/?m=XXXX',
 *    title: { es: 'Recorrido por la casa', en: 'Walk through the house' } } */
export const tours: Tour[] = [];

const DIR = 'public/videos';

export const videos: Video[] = existsSync(DIR)
  ? readdirSync(DIR)
      .filter((f) => f.toLowerCase().endsWith('.mp4'))
      .sort()
      .map((f) => {
        const nombre = f.replace(/\.mp4$/i, '');
        const jpg = `${nombre}.jpg`;
        return {
          src: `/videos/${f}`,
          poster: existsSync(join(DIR, jpg)) ? `/videos/${jpg}` : undefined,
          nombre,
        };
      })
  : [];
