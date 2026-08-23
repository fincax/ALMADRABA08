import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://almadraba08.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
