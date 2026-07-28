// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://forestaindia.com',
  // Static output — Hostinger shared hosting has no Node runtime.
  output: 'static',
  // Emit /about/index.html so Apache serves clean URLs without rewrite rules.
  build: { format: 'directory' },
  trailingSlash: 'ignore',

  image: {
    // Source renders are 2-3MB PNGs; ship AVIF/WebP at sane widths instead.
    responsiveStyles: true,
    layout: 'constrained',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), mdx(), sitemap()],
});
