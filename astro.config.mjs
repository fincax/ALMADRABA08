import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://almadraba08.com',

  // Las páginas se siguen generando estáticas: el adaptador solo existe
  // para que /api/reserva pueda ejecutarse en el servidor (ese archivo es
  // el único con `prerender = false`). El resto se sirve como HTML plano.
  adapter: node({ mode: 'standalone' }),

  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    // nodemailer es una dependencia de servidor: no debe pasar por el
    // empaquetador ni acabar en el bundle del cliente.
    ssr: { external: ['nodemailer'] },
  },
});
