# Relson Gracie Jiu-Jitsu of Charleston

Marketing site for a No-Gi jiu jitsu and MMA gym in West Ashley, Charleston, SC. Its one job is to get beginners and parents to start a free week. Project rules, content rules and the design brief live in [CLAUDE.md](./CLAUDE.md) and `design/`.

## Stack

Astro 7, Tailwind CSS v4, Keystatic (content), GSAP (motion), Fontsource (self-hosted Archivo, Geist, Geist Mono), Lucide icons. Deployed to Cloudflare Workers with static assets.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 22.12 or newer) |
| `npm run dev` | Dev server at http://localhost:4321, Keystatic admin at `/keystatic` |
| `npm run build` | Production build into `dist/`. Must pass before every commit |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check `.astro` and `.ts` files. Keep it at zero errors |
| `npm run tokens` | Regenerate `src/styles/tokens.css` from `design/design-system/tokens.json` (also runs before dev and build) |
| `npm run screenshots -- home schedule` | Full-page Playwright screenshots at 390px and 1440px into `.screenshots/` (needs the dev server running; first run `npx playwright install chromium`) |

## Environment

Copy `.env.example` to `.env`. Variables are documented there. Never commit `.env`.

## Project structure

```
design/                 Visual source of truth. Read-only.
scripts/tokens.mjs      tokens.json -> src/styles/tokens.css
scripts/screenshots.mjs Playwright screenshots for mockup comparison
src/styles/global.css   Tailwind import, fonts, base styles, type utilities
src/styles/tokens.css   Generated. Do not edit.
src/layouts/Base.astro  <head>, SEO, page shell
src/components/         UI components (phase 3)
src/content/            Keystatic-managed content (phase 2)
src/lib/                Content and schedule helpers, motion.ts (phase 5)
src/pages/              Routes
public/                 Static files copied as is
```

## Design tokens

`design/design-system/tokens.json` is the source. `scripts/tokens.mjs` turns it into a Tailwind v4 `@theme` plus theme overrides:

- Tailwind's default palette and sizes are disabled (`--*: initial`), so only brand tokens generate utilities: `bg-surface`, `text-ink-muted`, `text-signal-text`, `rounded-sm`, `rounded-pill`.
- Spacing uses a 4px base, so `p-4` is the design system's `space-4` (16px) and `py-24` is `space-24` (96px).
- Type styles are `text-<style>` utilities carrying size, line-height, weight and tracking. Headline styles are responsive by token: `text-display-xl` is 92px on phones and 180px from 768px up. Pair headline sizes with `display` (Archivo condensed, uppercase), `display-wide` (the marquee and wordmark) or `title` (schedule day names).
- Dark is the default theme. Put `data-theme="light"` on a long-read section and every color utility inside it flips to the light values.
- Belt rank colors live under `bg-belt-*` and don't change with the theme.
