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
src/components/         UI components, one file each (see Components)
src/scripts/            Client-side TypeScript: mobile menu, schedule filter, promo expiry
src/pages/dev/          Temporary: /dev/components gallery and /dev/content.json. Removed before launch
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

## Components

Every component takes content as props and uses tokens only. `data-motion="…"` attributes mark where phase 5 attaches GSAP; nothing animates yet.

| Component | Props |
|---|---|
| `Button` | `href?`, `variant` primary/secondary, `size` md/sm, `arrow?`, `full?`, `type?` |
| `Tag`, `Chip` | `variant` signal/neutral, `href?` · `label`, `value`, `pressed?` |
| `SectionHeading` | `eyebrow?`, `eyebrowTone?`, `level`, `size` page/xl/detail/l/m, `id`, `gap?`; heading text in the slot, intro in `slot="intro"` |
| `Photo`, `PhotoBlock` | `image`, `alt`, `widths?`, `sizes?`, `position?`, `loading?`, `priority?` · plus `scrim`, `raised?`, overlay slot |
| `Logo` | `class?` (size), `decorative?` |
| `PromoBanner` | `promo`, `href?` |
| `Header`, `MobileMenu`, `Footer` | `settings`, `currentPath`, `campaign` (+ `schedule` for the footer) |
| `Marquee` | `items[]` |
| `ProgramCard` | `program`, `index`, `summary` |
| `ProgramRow`, `ProgramTimes` | `program`, `index`, `rows[]`, `last?` · `rows[]` |
| `ProgramLinkList` | `items[] {name, href, summary}` |
| `ScheduleDay` | `day`, `today?`, `variant` card/home, `headingLevel?`, `showTags?`, `note?` |
| `ScheduleFilter` | `programIds[]` |
| `CoachCard`, `BeltStripe` | `coach`, `index`, `variant` full/compact, `headingLevel?` · `belt`, `size?` |
| `PricingCard`, `PricingDropIns`, `PriceList` | `plan`, `href` · `plans[]`, `href` · `rows[] {label, price}` |
| `Steps` | `steps[] {title, note?}`, `variant` numbered/cards |
| `FactList` | `facts[] {label, value, mono?}` |
| `FinalCta` | `variant` photo/band, `tone?`, `size?`, `image?`, `alt?`, `position?`, `body?`, `href`, `secondary?`; headline in the slot |
| `ContactInfo`, `MapEmbed`, `ContactForm` | `settings`, `schedule` · `settings`, `class` (size) · `interests?` |
| `GymdeskForm`, `GymdeskBooking` | `embed?` (render nothing until Mike pastes the embed code into settings) |

`/dev/components` renders all of them with real content. Compare it against `design/mockups/*.png` with `npm run screenshots -- dev/components`.

**Long headlines on phones.** The phone mockups clip single long words ("Fundamentals", "Instructors") at the viewport edge. Display sizes are therefore `min(token, --fit-size)`: `src/lib/fit.ts` works out the longest word of a heading and sets `--fit-size` inline so the word fits the viewport minus the gutters. When the word fits at the token size, nothing changes.

**After changing a content schema**, stop the dev server, delete `.astro/data-store.json` and start it again; the content cache keeps old entries otherwise.

## Design tokens

`design/design-system/tokens.json` is the source. `scripts/tokens.mjs` turns it into a Tailwind v4 `@theme` plus theme overrides:

- Tailwind's default palette and sizes are disabled (`--*: initial`), so only brand tokens generate utilities: `bg-surface`, `text-ink-muted`, `text-signal-text`, `rounded-sm`, `rounded-pill`.
- Spacing uses a 4px base, so `p-4` is the design system's `space-4` (16px) and `py-24` is `space-24` (96px).
- Type styles are `text-<style>` utilities carrying size, line-height, weight and tracking. Headline styles are responsive by token: `text-display-xl` is 92px on phones and 180px from 768px up. Pair headline sizes with `display` (Archivo condensed, uppercase), `display-wide` (the marquee and wordmark) or `title` (schedule day names).
- Dark is the default theme. Put `data-theme="light"` on a long-read section and every color utility inside it flips to the light values.
- Belt rank colors live under `bg-belt-*` and don't change with the theme.
