# Relson Gracie Jiu-Jitsu of Charleston

Marketing site for a No-Gi jiu jitsu and MMA gym in West Ashley, Charleston, SC. Its one job is to get beginners and parents to start a free week. Project rules, content rules and the design brief live in [CLAUDE.md](./CLAUDE.md) and `design/`.

## Status (October 14, 2026)

All six build phases are done and on `main`: foundation and tokens, content model, components, pages, motion, and SEO and launch prep. The build passes, `astro check` is at zero errors, and every route matches its mockup at 390px and 1440px. The site runs with placeholders for the facts Mike still owes (listed at the end of [LAUNCH.md](./LAUNCH.md)).

Not done yet, in this order: Cloudflare project, Keystatic Cloud project, the domain and `SITE_URL`, Google Business Profile. Keystatic runs in local mode until the Cloud project exists. The repo is at https://github.com/VDEugenio/gracie-bjj-website.

## Where to read

| File | What it answers |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | The brief and the rules: design, content, Gymdesk, motion, quality bar. Read first |
| README.md (this file) | Commands, file map, content model, component props, pages, tokens, motion hooks, SEO |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | How the pieces fit together, decisions and their reasons, gotchas, recipes for common changes, project timeline |
| [LAUNCH.md](./LAUNCH.md) | Go-live checklist (GitHub, Keystatic Cloud, Cloudflare, domain, Google) and what Mike still needs to provide |
| `design/` | Mockups, design tokens, content brief. Read-only |

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

Going live (GitHub, Cloudflare, Keystatic Cloud, the domain, Google Business Profile) is a step-by-step list in [LAUNCH.md](./LAUNCH.md).

## Project structure

```
design/                 Visual source of truth. Read-only.
scripts/tokens.mjs      tokens.json -> src/styles/tokens.css
scripts/screenshots.mjs Playwright screenshots for mockup comparison
src/styles/global.css   Tailwind import, fonts, base styles, type utilities
src/styles/tokens.css   Generated. Do not edit.
src/layouts/Base.astro  <head>, SEO tags, JSON-LD, page shell, motion start
src/components/         UI components, one file each (see Components)
src/scripts/            Client-side TypeScript: mobile menu, schedule filter, promo expiry, today marker
src/content/            Keystatic-managed content: settings.yaml, promo.yaml, programs/*.mdoc, schedule/, coaches/, pricing/
src/content.config.ts   Astro content collections over those files (zod schemas mirror keystatic.config.ts)
keystatic.config.ts     The Keystatic admin schema
src/lib/content.ts      Typed access to every collection
src/lib/schedule.ts     Time formatting, day grouping, derived "Mon–Thu · 5:00 PM" rows
src/lib/belts.ts        Belt labels and stripe colors
src/lib/gymdesk.ts      Gymdesk links with UTM parameters
src/lib/seo.ts          LocalBusiness JSON-LD and opening hours derived from the schedule
src/lib/motion.ts       All GSAP code, initialised once from Base.astro
src/assets/             Photos. programs/<slug>/image.jpg and coaches/<slug>/photo.jpg are managed by Keystatic
src/pages/              Routes (plus 404.astro and robots.txt.ts)
public/                 Static files copied as is, including _redirects for the old site's URLs
LAUNCH.md               Go-live steps: GitHub, Cloudflare, Keystatic Cloud, domain, Google
docs/ARCHITECTURE.md    How it works, decisions, gotchas, recipes, timeline
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


## Components

Every component takes content as props and uses tokens only. `data-motion="…"` attributes mark where `src/lib/motion.ts` attaches GSAP (see Motion below).

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
| `ScheduleDay` | `day`, `today?`, `variant` card/home, `headingLevel?`, `note?` |
| `ScheduleFilter` | `programIds[]` |
| `CoachCard`, `BeltStripe` | `coach`, `variant` full (flips to the bio, `src/scripts/coach-flip.ts`)/compact, `headingLevel?` · `belt`, `size?` |
| `PricingCard`, `PriceList` | `plan`, `href` · `rows[] {label, price}` |
| `Steps` | `steps[] {title, note?}`, `variant` numbered/cards |
| `FactList` | `facts[] {label, value, mono?}` |
| `Disclosure` | `title`, `group` (items sharing it open one at a time), `id?`; body in the slot. Native `<details>`, works without JS |
| `FinalCta` | `variant` photo/band, `tone?`, `size?`, `image?`, `alt?`, `position?`, `body?`, `href`, `secondary?`; headline in the slot |
| `ContactInfo`, `MapEmbed`, `ContactForm` | `settings`, `schedule` · `settings`, `class` (size) · `to?`, `phone?`, `interests?` (opens the visitor's email app addressed to `settings.formEmail`) |
| `GymdeskForm`, `GymdeskBooking` | `embed?` (render nothing until Mike pastes the embed code into settings) |


**Long headlines on phones.** The phone mockups clip single long words ("Fundamentals", "Instructors") at the viewport edge. Display sizes are therefore `min(token, --fit-size)`: `src/lib/fit.ts` measures a heading's widest word with a table of Archivo glyph widths and sets `--fit-size` inline so that word fits the viewport minus the gutters. When the word fits at the token size, nothing changes.

## Pages

| Route | Source | Campaign (utm_campaign) |
|---|---|---|
| `/` | `src/pages/index.astro` | `home` |
| `/new-here` | `src/pages/new-here.astro` | `new-here` |
| `/schedule` | `src/pages/schedule.astro` | `schedule` |
| `/programs` | `src/pages/programs/index.astro` | `programs` |
| `/programs/<slug>` | `src/pages/programs/[slug].astro` | `program-<slug>` |
| `/coaches` | `src/pages/coaches.astro` | `coaches` |
| `/contact` | `src/pages/contact.astro` | `contact` |
| 404 | `src/pages/404.astro` | `not-found` |

Page copy (hero lines, section intros, the "New to BJJ?" dropdowns) lives in the page templates. Everything with a time, a price, a name or a link comes from the content collections, and the "First time? Come to Fundamentals at 6 PM" and "Your first class" sentences are derived from the schedule (`src/lib/copy.ts`).

**Today.** The site is static, so `src/scripts/today.ts` marks today in the browser using the gym's time zone: the signal edge and "Today" label on the schedule card (which also moves first on phones), the "Today · Tuesday, Oct 13" line, and the home page's day panel. Without JavaScript the home page shows Monday under "This week at the gym" and no card is marked.

Compare any route against its mockup with `npm run screenshots -- home schedule programs programs/fundamentals coaches contact`.

**After changing a content schema**, stop the dev server, delete `.astro/data-store.json` and start it again; the content cache keeps old entries otherwise.

## Motion

All GSAP code is in `src/lib/motion.ts`, started once from `Base.astro`. Components only carry `data-motion` hooks:

| Hook | What happens |
|---|---|
| `hero-photo`, `hero-title`, `hero-cta` | On load: the photo settles from a slight zoom (never clipped, so it stays the fast LCP paint), the headline lines rise from a mask (SplitText, 0.08 stagger, `expo.out`), then the buttons fade up |
| `title` | Page and program titles: the same line reveal (on load in a hero, on scroll elsewhere) |
| `photo-wipe` | Photos wipe in left to right as they scroll in |
| `reveal` | Cards, rows and steps fade and rise with a stagger at 80% of the viewport |
| `coach-card`, `belt` | Coach cards rise in one by one and the belt stripe ties on (scaleX). Desktop pointers also get the tilt (see `tilt`) |
| `tilt`, `tilt-photo` | `data-tilt` / `data-tilt-photo` (plain attributes, not `data-motion`): coach cards and homepage program cards tilt toward a desktop pointer and the photo drifts the other way (desktop only). The parent grid needs `tilt-stage` |
| `photo-tilt` | `data-photo-tilt` on the layer around a photo (inside its clipping frame): it leans toward a desktop pointer while the pointer is over the photo, or anywhere over a `data-tilt-area` ancestor (the homepage hero). Only `data-photo-tilt="phone"` (the homepage hero) also leans with the phone on touch screens (HTTPS only; iOS asks for motion access on the first tap that isn't on a link or control) |
| `data-pulse` | `<Button pulse>`: a signal ring goes out from the hero's free-week button every ~3s while it is on screen, until the visitor points at or focuses it |
| coach flip | `coach:flip` events from `src/scripts/coach-flip.ts` turn the card over on `rotateY` |
| `marquee` | The program-name strip loops while it is on screen |
| `magnetic` | Primary buttons lean toward the pointer (desktop pointers only) |

Every entrance replays: an element resets once it has fully left the screen and plays again when it comes back (`replayOnScroll()`).
| `menu`, `menu-link` | The phone menu slides down from the top, links rise in with a 0.05 stagger |
| `disclosure` | A dropdown's body fades and rises 8px over 0.3s as it opens (the height opens at once) |

The schedule filter and the mobile menu dispatch cancelable `schedule:filter` and `menu:close` events; motion.ts cancels them, animates, then commits the change. With `prefers-reduced-motion: reduce` nothing is registered, so they switch instantly. All starting states are set from JavaScript, so the page is complete with JavaScript off. Screenshots (`npm run screenshots`) run with reduced motion.

## Design tokens

`design/design-system/tokens.json` is the source. `scripts/tokens.mjs` turns it into a Tailwind v4 `@theme` plus theme overrides:

- Tailwind's default palette and sizes are disabled (`--*: initial`), so only brand tokens generate utilities: `bg-surface`, `text-ink-muted`, `text-signal-text`, `rounded-sm`, `rounded-pill`.
- Spacing uses a 4px base, so `p-4` is the design system's `space-4` (16px) and `py-24` is `space-24` (96px).
- Type styles are `text-<style>` utilities carrying size, line-height, weight and tracking. Headline styles are responsive by token: `text-display-xl` is 92px on phones and 180px from 768px up. Pair headline sizes with `display` (Archivo condensed, uppercase), `display-wide` (the marquee and wordmark) or `title` (schedule day names).
- Dark is the default theme. Put `data-theme="light"` on a long-read section and every color utility inside it flips to the light values.
- Belt rank colors live under `bg-belt-*` and don't change with the theme.

## SEO

- **Titles and descriptions:** every page passes its own `title` and `description` to `Base.astro`, which appends the gym name and writes the Open Graph and Twitter tags. All pages share one OG image: the team photo, cropped to 1200×630 at build time.
- **Structured data:** `Base.astro` adds a `SportsActivityLocation` JSON-LD block built by `src/lib/seo.ts` from settings (name, address, phone, geo, social links) and the schedule. Opening hours run from each day's first class to the end of its last, so they follow schedule edits automatically.
- **URLs:** `SITE_URL` (see `.env.example`) sets the canonical URLs, OG URLs, the sitemap (`@astrojs/sitemap`, public pages only) and `robots.txt` (`src/pages/robots.txt.ts`, which keeps `/keystatic` out). Pages build as `coaches.html` rather than `coaches/index.html` (`build.format: 'file'`) so Cloudflare serves `/coaches` without a trailing-slash redirect.
- **Old site:** `public/_redirects` sends every URL in the old graciecharleston.com sitemap to its new home with a 301: `/classes/*` to `/programs` (adult-bjj, fundamentals and kids-bjj to their program pages), `/instructors` and `/relson-gracie` to `/coaches`, `/locations/*` and `/connect` to `/contact`, the retired pages (events, blog, reviews, gift card, checkout, privacy policy) to `/`, and `/login` to Gymdesk. The `/login` target is the Gymdesk member login; update it there if that URL changes. Redirects only apply on Cloudflare and in `npm run preview`, not in `npm run dev`.
- **Gymdesk links:** every one goes through `gymdeskUrl()` (or `withUtmFrom()` for a pricing plan's own link), so each carries `utm_source=website&utm_medium=cta&utm_campaign=<page>&utm_content=<placement>`.
