// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const isDev = process.argv.includes('dev');

/**
 * Keystatic only works in production when it talks to
 * Keystatic Cloud. Local storage mode needs the file system, so the admin
 * is included in `astro dev` always and in `astro build` only when
 * KEYSTATIC_STORAGE=cloud. See .env.example.
 */
export const keystaticEnabled = isDev || env.KEYSTATIC_STORAGE === 'cloud';

export default defineConfig({
  // TODO(launch): set SITE_URL in .env to the production domain for canonical URLs, OG tags and the sitemap.
  site: env.SITE_URL || 'https://example.com',
  output: 'static',
  trailingSlash: 'never',
  // Emit coaches.html rather than coaches/index.html. Cloudflare serves /coaches
  // straight from coaches.html; a directory index would 307 to /coaches/ and
  // disagree with the canonical URLs and the sitemap.
  build: { format: 'file' },
  // The Cloudflare adapter runs the dev server inside workerd, which breaks
  // Keystatic's local file writes. Only attach it for builds.
  adapter: isDev ? undefined : cloudflare({ imageService: 'compile' }),
  // React and Markdoc exist for the Keystatic admin and the .mdoc program descriptions.
  // No React ships on site pages.
  integrations: [
    react(),
    markdoc(),
    // The sitemap lists the public pages only: no admin, API or 404.
    sitemap({ filter: (page) => !/^\/(keystatic|api|404)(\/|$)/.test(new URL(page).pathname) }),
    ...(keystaticEnabled ? [keystatic()] : []),
  ],
  // The toolbar overlay shows up in Playwright screenshots; re-enable locally if you want its audits.
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    // keystatic.config.ts also runs in the admin's browser bundle, where Vite only
    // exposes PUBLIC_ variables. Without this the admin UI stays in local mode
    // while the server is in cloud mode.
    define: {
      'import.meta.env.KEYSTATIC_STORAGE': JSON.stringify(env.KEYSTATIC_STORAGE || 'local'),
    },
  },
  image: {
    // Square photos, square crops. Components pass explicit widths/sizes.
    layout: 'none',
    responsiveStyles: false,
  },
});
