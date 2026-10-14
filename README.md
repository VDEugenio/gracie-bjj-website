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
src/content/            Keystatic-managed content: settings.yaml, promo.yaml, programs/*.mdoc, schedule/, coaches/, pricing/
src/content.config.ts   Astro content collections over those files (zod schemas mirror keystatic.config.ts)
keystatic.config.ts     The Keystatic admin schema
src/lib/content.ts      Typed access to every collection
src/lib/schedule.ts     Time formatting, day grouping, derived "Mon–Thu · 5:00 PM" rows
src/lib/belts.ts        Belt labels and stripe colors
src/lib/gymdesk.ts      Gymdesk links with UTM parameters
src/lib/motion.ts       All GSAP code (phase 5)
src/assets/             Photos. programs/<slug>/image.jpg and coaches/<slug>/photo.jpg are managed by Keystatic
src/pages/              Routes
public/                 Static files copied as is
```

## Content

Mike edits content at `/keystatic` (dev server, or production once Keystatic Cloud is set up). Keystatic writes YAML and Markdoc files into `src/content/`; Astro reads them through content collections, so a build fails loudly if a required field is missing or a schedule entry points at a program that doesn't exist.

| What | Where | Notes |
|---|---|---|
| Gym settings | `src/content/settings.yaml` | Name, address, phone, social links, Gymdesk URLs and embeds, parking note, map |
| Promo banner | `src/content/promo.yaml` | Hides itself after `expiresOn` |
| Programs | `src/content/programs/<slug>.mdoc` | Frontmatter plus the rich-text description. Photo at `src/assets/programs/<slug>/image.jpg` |
| Weekly schedule | `src/content/schedule/<day>-<HHMM>-<program>.yaml` | One file per class. Everything with a time derives from this |
| Coaches | `src/content/coaches/<slug>.yaml` | Portrait at `src/assets/coaches/<slug>/photo.jpg`. Bracketed values like `[Belt rank]` are placeholders Mike still has to fill in |
| Pricing | `src/content/pricing/<slug>.yaml` | The highlighted plan is the free week |

Keystatic storage is `local` until Mike's Keystatic Cloud project exists. Then set `KEYSTATIC_STORAGE=cloud` and `PUBLIC_KEYSTATIC_CLOUD_PROJECT` in `.env` (and in the Cloudflare build environment). In local mode the admin is only built into `astro dev`; production builds leave it out.

`/dev/content.json` dumps every collection with the derived schedule strings. It is a dev aid and goes away before launch.

## Design tokens

`design/design-system/tokens.json` is the source. `scripts/tokens.mjs` turns it into a Tailwind v4 `@theme` plus theme overrides:

- Tailwind's default palette and sizes are disabled (`--*: initial`), so only brand tokens generate utilities: `bg-surface`, `text-ink-muted`, `text-signal-text`, `rounded-sm`, `rounded-pill`.
- Spacing uses a 4px base, so `p-4` is the design system's `space-4` (16px) and `py-24` is `space-24` (96px).
- Type styles are `text-<style>` utilities carrying size, line-height, weight and tracking. Headline styles are responsive by token: `text-display-xl` is 92px on phones and 180px from 768px up. Pair headline sizes with `display` (Archivo condensed, uppercase), `display-wide` (the marquee and wordmark) or `title` (schedule day names).
- Dark is the default theme. Put `data-theme="light"` on a long-read section and every color utility inside it flips to the light values.
- Belt rank colors live under `bg-belt-*` and don't change with the theme.
