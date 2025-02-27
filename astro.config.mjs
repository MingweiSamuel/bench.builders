// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { SITES } from './src/data';
import remarkSectionize from 'remark-sectionize';
import rehypeToc from 'rehype-toc';
import rehypeSlug from 'rehype-slug';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  trailingSlash: 'ignore',

  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),

  image: {
    remotePatterns: [{ protocol: "https" }],
  },

  site: 'https://bench.builders',
  integrations: [sitemap(), mdx({
    remarkPlugins: [remarkSectionize],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeToc,
        // { headings: ["h2", "h3"] }
      ]
    ],
  })],

  redirects: {
    '/support': '/join',
    '/guide': '/guides',
    '/guide/[..._]': '/guides',
    ...Object.fromEntries((await SITES).flatMap(({ id, muni, act, ggt, vta }) => {
      return [
        muni, act, ggt, vta
      ].filter(stopId => stopId).map(stopId => ['/' + stopId, '/' + id])
    })),
  },
});