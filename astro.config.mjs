import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 独自ドメイン www.koyori.app で配信する（public/CNAME と対応）。
// GitHub Pages の既定 URL（koyori-app.github.io/official-site）で配信する場合は
// site を https://koyori-app.github.io、base を /official-site に変え、public/CNAME を削除する。
export default defineConfig({
  site: 'https://www.koyori.app',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: { ja: 'ja-JP', en: 'en-US' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
