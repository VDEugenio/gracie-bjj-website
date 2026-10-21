# How the site works

Companion to [README.md](../README.md) (commands, file map, component props) and [LAUNCH.md](../LAUNCH.md) (go-live). This file explains how the pieces fit together, why things were decided the way they were, the gotchas that cost time, and the recipes for common changes. [CLAUDE.md](../CLAUDE.md) stays the brief and the rules.

Written October 14, 2026, at the end of the six build phases.

## 1. The shape of the site

- **A static Astro 7 site.** Eleven public pages (home, schedule, programs, six program detail pages, coaches, contact) plus a 404 page, all prerendered to HTML at build time into `dist/`.
- **No server code runs for visitors.** The only on-demand routes are Keystatic's `/keystatic` admin and its `/api/keystatic/*` endpoints, and they exist only in builds made with `KEYSTATIC_STORAGE=cloud`. That is the sole reason the `@astrojs/cloudflare` adapter is in the project.
- **Hosting is Cloudflare Workers with static assets** (the adapter dropped classic Pages in v13). Deploys are Git-connected: every push to `main` rebuilds and redeploys.
- **One external system: Gymdesk.** Every "Start your free week" button, the "Sign up" nav item, the "Member login" link and the pricing cards link out to Gymdesk with UTM parameters. The site holds no member data and takes no payments.
- **No JavaScript framework on the pages.** The mobile menu, the schedule filter, the promo expiry and the "today" marker are plain TypeScript in `src/scripts/`. React and Markdoc are installed only for the Keystatic admin and the `.mdoc` program descriptions.

## 2. Run modes and environment

| | `npm run dev` | `npm run build` |
|---|---|---|
| Adapter | none (`adapter: undefined`) | `@astrojs/cloudflare` with `imageService: 'compile'` (sharp at build time) |
| Keystatic admin | always on, `local` storage, writes straight into `src/content/` | only when `KEYSTATIC_STORAGE=cloud` |
| Site URL | `SITE_URL` from `.env`, else `https://example.com` | same; canonical URLs, OG tags, sitemap, robots.txt and JSON-LD all use it |
| Tokens | regenerated first (`predev`) | regenerated first (`prebuild`) |
| Dev toolbar | off (it showed up in screenshots) | n/a |

Why the adapter is dev-off: with it attached, Astro runs the dev server inside workerd, which cannot write to the file system, so Keystatic local mode fails. Why the admin is off in local-mode builds: local storage needs a writable file system that a deployed Worker does not have.

`astro.config.mjs` reads `.env` through Vite's `loadEnv` because Astro's own env handling is not available at config time. The three variables are documented in `.env.example`: `SITE_URL`, `KEYSTATIC_STORAGE`, `PUBLIC_KEYSTATIC_CLOUD_PROJECT`. None is a secret. `.env` is git-ignored.

`npm run preview` serves `dist/` through the adapter's wrangler dev server, so `public/_redirects` works there. It does not work under `npm run dev`.

## 3. Content pipeline

```
Keystatic admin (/keystatic)      keystatic.config.ts
        │ writes
        ▼
src/content/*.yaml, programs/*.mdoc
        │ read by glob loaders
        ▼
Astro content collections         src/content.config.ts   (zod schemas that mirror Keystatic's)
        │
        ▼
src/lib/content.ts                typed getters: getSettings, getPrograms, getSchedule, getCoaches, getPricing …
        │
        ▼
src/lib/*.ts derivations          schedule.ts, copy.ts, seo.ts, belts.ts, gymdesk.ts, maps.ts, format.ts, nav.ts, fit.ts
        │
        ▼
components → pages
```

- **Two schemas, kept in sync by hand.** `keystatic.config.ts` defines what Mike sees in the admin; `src/content.config.ts` defines what Astro accepts. When adding a field, change both, then the README content table. A mismatch fails the build loudly, which is intended.
- **Files.** `settings.yaml` and `promo.yaml` are singletons. `programs/<slug>.mdoc` is frontmatter plus a Markdoc body (Keystatic `format: { contentField: 'description' }`). `schedule/<day>-<HHMM>-<program>.yaml` is one class per file; the file name is only a label, the fields inside are what count. `coaches/<slug>.yaml` and `pricing/<slug>.yaml` are plain YAML.
- **Relationships.** A schedule entry's `program` is the program's id (its file name without extension). `schedule.ts` joins them; a dangling id fails the build.
- **Images.** Keystatic saves uploads to `src/assets/programs/<slug>/image.jpg` and `src/assets/coaches/<slug>/photo.jpg`, and the collection schema resolves them with Astro's `image()` helper, so pages get `ImageMetadata` with real dimensions. `Photo.astro` renders a `<Picture>` with AVIF, WebP and JPEG sources and caps the requested widths at the source width, so a 300px portrait is never upscaled. The `photo` utility applies `grayscale(1)`, so a colour upload still renders black and white.
- **Placeholders.** Facts Mike has not supplied are bracketed text in the content, e.g. `[Belt rank]`, `[Bio from Mike: …]`, rendered as is so they are visible and easy to find. `format.ts` has an `isPlaceholder()` helper (not used yet) for any component that needs to treat them differently. The dashed parking-note box on the contact page is the one placeholder hard-coded in a template, shown while `settings.parkingNote` is empty.
- **Everything with a time derives from the schedule.** Program rows ("Mon–Thu · 5:00 PM"), the program page "This week" card, the home page's "Today at the gym" panels, the footer hours, the contact page hours, the "First time? Come to Fundamentals at 6 PM" sentence, the coach cards' "Teaches" lines (from each class's optional `instructor`; a coach no class names falls back to the `teaches` text), and the opening hours in the JSON-LD. Change a class in Keystatic and all of them follow on the next build.

**Gotcha: stale content cache.** After changing a schema in `src/content.config.ts`, stop the dev server, delete `.astro/data-store.json`, and start again. The content layer keeps old entries otherwise.

## 4. Design tokens and type

- **Source of truth:** `design/design-system/tokens.json` (read-only, like everything in `design/`). `scripts/tokens.mjs` turns it into `src/styles/tokens.css`, which is committed and regenerated before every dev run and build. Never edit `tokens.css` by hand; if a token must change, that is a design change and belongs in `tokens.json` on the design side.
- **What the generator emits.** A Tailwind v4 `@theme static` block that first disables Tailwind's defaults (`--*: initial`) so only brand tokens produce utilities, then colours (dark values), belt colours, font families, a 4px spacing base, the site and header containers (1280px and 1440px), breakpoints (sm 640, md 768, lg 1024, xl 1280), radii, weights, leading, tracking and motion defaults. A second `@theme inline` block carries the type scale as `text-<style>` utilities with their line-height, weight and tracking modifiers. Then `:root` sets responsive `--fs-*` sizes (phone values, desktop values from `md`), `--space-N` variables, and the `[data-theme="dark"]` / `[data-theme="light"]` colour overrides.
- **Type scale (phone / desktop):** display-page 108/190, display-xl 92/180, display-cta 86/180, display-band 150 (desktop band CTAs), display-detail 100/160, display-l 72/120, display-m 60/96, display-name 72/64, display-name-sm 34/64, heading 44/48, heading-sm 28/32, menu 64, marquee 40/96, wordmark 15, title 20, lead 18/20, body-l 16/18, body 16, body-sm 15, caption 14, label 12, label-sm 11, label-xs 10, button 13, button-sm 12, chip 12, time 14, time-l 18, time-sm 12, price 32/40, price-l 40/48.
- **Type utilities in `global.css`.** `display` (Archivo at 62% width, weight 900, uppercase, balanced wrapping), `display-wide` (125% width, weight 800: only the marquee and the header wordmark), `title` (Archivo at normal width for schedule day names), plus `photo`, `link`, `navlink`, the scrim gradients, `tilt-stage` (perspective for the coach and program card tilt), `no-scrollbar`, `wrap` (page gutter: 16px on phones, 80px from `md`, 1280px max) and `.split-line-mask` (see Motion).
- **Themes.** Dark is the default. `data-theme="light"` on a section flips every colour utility inside it; it is used only for the long-read body of program pages. The `light` custom variant exists for the rare case a component needs a light-only rule.
- **Colour rules in practice.** `signal` purple is the only accent: primary button, active chip, today's schedule edge, the "Start here" tag, one highlight per section. Text on signal uses `on-signal`. Photos are grayscale by CSS. No shadows, no gradients except scrims.

### Headline fitting

The phone mockups clip single long words ("FUNDAMENTALS", "INSTRUCTORS", "SCHEDULE") at the viewport edge. Rather than clip, display sizes in `tokens.css` are `min(<token>, var(--fit-size, 9999px))`, and `src/lib/fit.ts` computes `--fit-size` at build time from a table of measured Archivo glyph widths: the widest word of the heading must fit `--fit-available` (viewport minus gutters) or, with `fit="container"` on `SectionHeading`, the nearest `@container` ancestor (`100cqw`). When the word already fits at the token size, the token wins and nothing changes. The container basis was added in the phase 4 review so "Programs" and "Class schedule" fit their grid column instead of running under the intro text or the photo.

Resulting phone sizes: Class schedule 93px, Programs 83px, Our instructors 68px, Fundamentals 59px. Desktop overlaps that the mockups show on purpose (the title overlapping intro text, "FUNDAMENTALS" spilling into the gutter) were kept. "SEAGRAVES" overruns its name box on phones as in the mockup.

## 5. Client-side behaviour

Each script in `src/scripts/` is imported with a `<script>` tag inside the component that needs it (Header, ScheduleFilter, PromoBanner, Base), so Astro bundles and deduplicates it per page. All of them are progressive enhancements: the page is complete without them.

| Script | What it does | Hooks and events |
|---|---|---|
| `mobile-menu.ts` | Opens and closes the full-screen menu, traps focus, closes on Escape, on any link, and when the viewport grows past `md` | `[data-menu-toggle]`, `[data-mobile-menu]`, `[data-menu-close]`. Dispatches `menu:open`, and a cancelable `menu:close` whose `detail.done()` hides the menu |
| `schedule-filter.ts` | Chips set `aria-pressed` and toggle `hidden` on class rows; shows the "No classes" note of a day that empties out | Keys `all`, `adults`, `kids`, `beginners` (rows with `data-start-here`), `program:<id>`. Dispatches a cancelable `schedule:filter` with `show`, `hide` and `commit()` |
| `promo-expiry.ts` | Hides the promo banner after `expiresOn` in the browser, in addition to the build-time check in `isPromoLive()` | `[data-promo-expires]` |
| `today.ts` | Marks today's schedule card (`data-today`, moved first on phones inside `[data-today-first]`), fills "Today · Tuesday, Oct 13", and on the home page shows today's panel and changes the eyebrow to "Today at the gym". Uses `America/New_York`, not the visitor's zone | `[data-schedule-day][data-day]`, `[data-today-label]`, `[data-today-panel]`, `[data-today-eyebrow]`, `[data-today-date]` |

The cancelable-event pattern is how motion stays out of these scripts: `motion.ts` cancels the event, animates, then calls `commit()` or `done()`. With reduced motion, or with motion failing to load, nobody cancels and the change applies instantly.

## 6. Motion

All GSAP code is in `src/lib/motion.ts`, started once by `initMotion()` from `Base.astro`. Components only carry `data-motion` attributes. Two `gsap.matchMedia()` contexts:

- `(prefers-reduced-motion: no-preference)`: hero, titles, photo wipes, reveals, coach cards, coach card flip, the hero CTA pulse, marquee, menu and filter transitions.
- the same plus `(hover: hover) and (pointer: fine) and (min-width: 768px)`: magnetic buttons, the card tilt (`[data-tilt]`: coach cards and homepage program cards) and the photo tilt (`[data-photo-tilt]`).
- `(prefers-reduced-motion: no-preference) and (hover: none) and (pointer: coarse)`: the homepage hero photo tilt, driven by `deviceorientation`.

The pointer-driven photo tilt (hero included) runs in the desktop block.

**Every entrance replays.** `replayOnScroll(el, { play, reset })` gives each animated element two ScrollTriggers: one plays it at `START` (top at 80%) scrolling down, the other resets it once it has fully left the viewport and plays it again when its bottom edge comes back in scrolling up. A `shown` flag keeps it from replaying while visible. `grouped()` batches the elements that come on screen in the same frame so they stagger top to bottom, and the `entrances` map lets a reset cancel an entrance that hasn't started yet (a fast scroll straight past). ScrollTrigger measures an element where it is drawn, so a hidden card (drawn 32–40px low) resets up to 40px after it leaves; it is still off screen, so nothing visible pops.

Under reduced motion nothing registers, so nothing animates. Starting states are set from JavaScript (`gsap.set` / `from`), never in CSS, so the page is complete with JavaScript off.

| Hook | Where it is set | What happens |
|---|---|---|
| `hero-photo` | `index.astro`, `programs/[slug].astro` | The photo settles from a 1.12 zoom over 1.1s. It is never clipped or faded because it is the page's largest paint (LCP) |
| `hero-title` | `index.astro` | SplitText masked lines rise from below (stagger 0.08, `expo.out`, 0.15s delay) |
| `hero-cta` | `index.astro` (both button rows) | Fade and rise after the headline |
| `title` | `programs/[slug].astro`, `new-here.astro` | Same line reveal; plays on load when its section has a `hero-photo` (program pages, `/new-here`), otherwise on scroll |
| `photo-wipe` | `PhotoBlock`, `ProgramRow`, `FinalCta` | `clip-path` wipe left to right plus a slight settle when the frame reaches 80% of the viewport |
| `reveal` | `ProgramCard`, `ProgramRow`, `ScheduleDay`, `PricingCard`, `Steps`, `MapEmbed` | Fade and rise with a 0.08 stagger |
| `coach-card`, `belt` | `CoachCard`, `BeltStripe` | Cards rise in one by one; the belt stripe ties on (`scaleX` 0→1 from the left) 0.3s into each card. Desktop pointers also get the tilt via `data-tilt` (below) |
| `data-tilt`, `data-tilt-photo` | `CoachCard`, `ProgramCard` | Desktop tilt: ±8° via `quickTo`, the `data-tilt-photo` image drifts up to 12px the other way, springs back over 0.6s. Put `tilt-stage` on the parent grid. Desktop only |
| `data-pulse` | `Button` with `pulse` (the homepage hero) | A 2px `signal` ring scales out by 12px a side and fades over 1.2s, every ~3s, while the arrow nudges 4px; paused off screen, stopped for good on hover or focus |
| coach flip | `CoachCard` (full) + `src/scripts/coach-flip.ts` | The script owns the state (`data-flip-ready`, `data-flipped`, `inert` on the hidden face, `aria-expanded`, focus handoff) and dispatches `coach:flip`; motion.ts turns `[data-flip-inner]` on `rotationY` (0.6s `power2.inOut`). Without motion the CSS swaps the faces; without JavaScript the back reads below the front |
| `data-photo-tilt` | `index.astro` hero (`="phone"`), `programs/[slug].astro` and `new-here.astro` heroes, `PhotoBlock`, `ProgramRow`, `FinalCta` | The layer around a photo leans ±4° (`transformPerspective` 1000) and drifts up to 10px the other way; the frame clips it and the scrims sit outside it. It zooms just enough to hide its edges on the first move, so the resting photo matches the mockup. Desktop: follows the pointer over the photo, or over a `data-tilt-area` ancestor (the homepage hero section). Touch, `data-photo-tilt="phone"` only: follows `deviceorientation` from a slowly re-centering resting angle, only while the hero is on screen. Orientation events only fire on HTTPS. iOS asks for permission on the first tap that isn't on a link or control, and `localStorage` key `rg-motion-permission` remembers a denial |
| `marquee` | `Marquee` | The track (rendered twice) slides by 50% on an infinite tween at 60px/s, paused while off screen |
| `magnetic` | `Button` (primary variant) | The button leans up to 10px toward the pointer |
| `menu`, `menu-link` | `MobileMenu` | Slides down from the top in 0.3s, links rise with a 0.05 stagger; slides back up on close |
| `disclosure` | `Disclosure` (the `new-here.astro` hero) | On `toggle` open, the body fades and rises 8px over 0.3s. The height opens at once; native `<details name>` makes a group exclusive without JS |
| (schedule rows) | via the `schedule:filter` event | Rows fade and collapse (height, padding, border) over 0.3s. This is the one place something other than transform, opacity or clip-path animates, because the list has to close up |

Details worth knowing:

- **Scroll start.** `START` computes "element top at 80% of the viewport" but caps it just below the maximum scroll, so elements near the end of a short page still fire. ScrollTrigger's own `clamp()` never fires at scroll position 0.
- **SplitText** uses `autoSplit`, so lines re-split when web fonts finish loading or the width changes, and `aria: 'none'` so screen readers read the original text rather than a generated label that would run "No-Gi" and "jiu jitsu" together.
- **`.split-line-mask`** in `global.css` clips vertically only, so long words that overrun the heading box horizontally (see Headline fitting) still show.
- **Screenshots** (`npm run screenshots`) run with reduced motion, so they capture the resting state.

## 7. SEO and sharing

- **`Base.astro`** takes `title`, `description`, `campaign`, `currentPath?` and `noindex?`. It appends the gym name to the title, writes the canonical URL from `SITE_URL` plus `currentPath`, the Open Graph and Twitter tags, preloads the two first-paint fonts (Archivo width axis, Geist), and injects the JSON-LD.
- **One OG image** for every page: the team photo cropped to 1200×630 at build time with `getImage()`.
- **Structured data:** `src/lib/seo.ts` builds a `SportsActivityLocation` from settings (name, address, E.164 phone, email if set, geo, Instagram and Facebook as `sameAs`, neighbourhood as `areaServed`) and the schedule (opening hours per day from the first class start to the last class end; days without classes are omitted, which schema.org reads as closed). The geo coordinates in `settings.yaml` came from the US Census geocoder for 2467 Savannah Hwy.
- **`robots.txt`** is built by `src/pages/robots.txt.ts` so the sitemap line follows `SITE_URL`; it disallows `/keystatic` and `/api/`. The sitemap (`@astrojs/sitemap`) is filtered to public pages.
- **URL shape:** `trailingSlash: 'never'` and `build.format: 'file'` together produce `coaches.html`, which Cloudflare serves at `/coaches` without a redirect. With directory output Cloudflare would 307 `/coaches` to `/coaches/`, disagreeing with the canonicals and the sitemap.
- **Redirects:** `public/_redirects` maps the old site's `/classes`, `/classes/*`, `/instructors`, `/relson-gracie` (and their trailing-slash forms) to the new pages with 301s, and `/login` to the Gymdesk member login. Cloudflare applies this file at the edge.
- **UTM:** `gymdeskUrl(base, campaign, placement)` adds `utm_source=website`, `utm_medium=cta`, `utm_campaign=<page>` and `utm_content=<placement>` to Gymdesk hosts only; other URLs pass through untouched, so CMS fields that may hold either are safe. `withUtmFrom()` copies the tags onto a pricing plan's own `ctaUrl`. `utm_content` is an addition to the brief so Mike can tell the header button from the final CTA.
- **Lighthouse (mobile, phase 6, median of 3):** Performance 94–98, Accessibility 100, Best Practices 96, SEO 100 on all pages. Best Practices lost points only on the 60px placeholder logo, since replaced by the 350px badge. `/contact` can dip when the Google Maps embed is slow.

## 8. Hosting and deployment

- Cloudflare Workers with static assets, deployed with `npx wrangler deploy` after `npm run build`. There is no wrangler config in the repo: the adapter writes `dist/client/wrangler.json` during the build (assets directory `.`, a `SESSION` KV binding, the Worker named after `name` in `package.json`, `gracie-bjj-website`, which the Cloudflare project name must match). The same folder gets `_headers` (immutable caching for `/_astro/*`), the copied `_redirects`, `robots.txt` and the sitemap. `dist/server/` is empty in a local-mode build because nothing is on demand; in a cloud-mode build it holds the Worker that serves the Keystatic admin API.
- The adapter enables sessions backed by a `SESSION` KV binding (the build log says so). The site does not use sessions; wrangler provisions the namespace on the first deploy. LAUNCH.md covers the fallback if it cannot.
- Build-time variables on Cloudflare: `SITE_URL`, `KEYSTATIC_STORAGE=cloud`, `PUBLIC_KEYSTATIC_CLOUD_PROJECT`, `NODE_VERSION=22`. See LAUNCH.md section 3.
- Node: `engines` says 22.12 or newer and `.nvmrc` says 22; development has been on Node 24 without issues.
- Content edits in production go Keystatic Cloud → commit on `main` → Cloudflare rebuild, about a minute end to end.

## 9. Decisions log

Things that differ from CLAUDE.md or the mockups, or that a future session might otherwise second-guess.

| Decision | Why |
|---|---|
| Cloudflare Workers with static assets instead of Pages | `@astrojs/cloudflare` removed Pages support in v13. Same Git-connected workflow |
| Adapter attached only for builds | In dev it runs the server in workerd, which breaks Keystatic local writes |
| Keystatic admin excluded from local-mode production builds | Local storage needs a writable file system |
| `design/mockups/*.png` renamed to the CLAUDE.md names | The exports arrived under other names; the screenshot comparison expects these. No other change to `design/` |
| Phone titles shrink to fit instead of clipping | Clipped titles ("FUNDAME", "PROGRAI") read as a bug on a real phone. Desktop overlaps were kept because they are deliberate in the mockups |
| `display-cta` is 86px on phones, not the mockup's 88px | "YOUR FIRST" measures 365px at 88px against a 358px column |
| `display-band` 150px added | Band CTAs on the coaches and program mockups use it on desktop |
| Sticky header | Keeps the free-week button in reach, as the brief asks |
| "Member login" points at `…gymdesk.com/login` | Assumed from the signup URL; Mike has to confirm. The `/login` redirect in `_redirects` uses the same URL |
| Keyless Google Maps embed (`google.com/maps?q=…&output=embed`) | No API key to manage. It shows the area without an exact pin until Mike pastes a real embed URL into settings |
| Page copy lives in the templates, not the CMS | Hero lines, section intros and the "New to BJJ?" dropdowns are design copy. Everything with a time, price, name or link is CMS content, and several sentences are derived from the schedule (`copy.ts`) |
| `compressHTML` left at Astro 7's `'jsx'` default | Whitespace between inline elements on separate lines is dropped, so templates use `{' '}` where a space matters |
| zod from `astro/zod` (zod 4) | Astro 7 ships zod 4; use `z.url()` rather than `z.string().url()` |
| Images never upscale | `Photo.astro` caps widths at the source. Jerry's 300px portrait stays small until a better original arrives |
| `tsconfig` is strict with `noUnusedLocals` and `@/*` → `src/*` | Keeps `astro check` meaningful |

## 10. Recipes

**Change the schedule.** In Keystatic go to Classes → Schedule, or add `src/content/schedule/<day>-<HHMM>-<program>.yaml` with `label`, `day`, `start` (24h `HH:MM`), `durationMin`, `program` (a program id) and optionally `instructor` (a coach id). Rows, program pages, the coach cards' "Teaches" lines, the today panels, the footer and contact hours, and the JSON-LD all update on the next build.

**Add a program.** Keystatic → Classes → Programs, or create `src/content/programs/<slug>.mdoc` with the frontmatter fields from the README content table plus a photo at `src/assets/programs/<slug>/image.jpg`. It appears on `/programs`, gets `/programs/<slug>`, joins the marquee and the "Other programs" lists. The schedule filter's chips are fixed (All, Adults, Kids, Beginners, and MMA while a program with id `mma` exists); the "Beginners" chip follows `startHere`.

**Add a coach.** Keystatic → People → Coaches, or `src/content/coaches/<slug>.yaml` with a portrait at `src/assets/coaches/<slug>/photo.jpg`. `order` sets the position, `showOnHome` puts the coach among the four compact home cards. Leave `belt: unknown` and bracketed placeholders until the facts arrive.

**Add a page.** Create it under `src/pages/`, wrap it in `Base` with a unique `title`, `description`, `campaign` (used as `utm_campaign`) and `currentPath`. Add it to `NAV` in `src/lib/nav.ts` if it belongs in the menu. The sitemap picks it up automatically. Check it with `npm run screenshots -- <name>`.

**Add a motion moment.** Put a `data-motion="<hook>"` on the element, then handle the hook inside the right `matchMedia` block in `motion.ts`. Set any hidden starting state from JavaScript, animate only transform, opacity or clip-path, and use `power3.out` for entrances, `expo.out` for the hero, `power2.inOut` for movement that stops. Add the hook to the README motion table.

**Add a content field.** Add it to `keystatic.config.ts` and to the zod schema in `src/content.config.ts`, delete `.astro/data-store.json`, restart the dev server, and document it in the README content table.

**Switch Keystatic to Cloud.** Set `KEYSTATIC_STORAGE=cloud` and `PUBLIC_KEYSTATIC_CLOUD_PROJECT=<team>/<project>` in `.env` locally and in the Cloudflare build variables. LAUNCH.md section 2 has the steps on the Keystatic side.

**Verify before committing.** `npm run build` and `npm run check` must both pass. For visual work, run the dev server and `npm run screenshots -- home schedule programs programs/fundamentals coaches contact`, then compare `.screenshots/*.png` with `design/mockups/*.png`; the script warns about horizontal overflow. For performance, run Lighthouse in Chrome DevTools against `npm run preview`.

## 11. Timeline

| Date | Commit | What |
|---|---|---|
| 2026-10-13 | `4240a30` | Phase 1: foundation and tokens (Astro, Tailwind v4, token generator, fonts, base styles) |
| 2026-10-13 | `1157530` | Phase 2: content model (Keystatic config, collections, seed content from the content brief) |
| 2026-10-13 | `ccdbdcb` | Phase 3: components (28 components, client scripts, lib helpers) |
| 2026-10-13 | `1e96199` | Phase 4: pages (all routes built from the mockups) |
| 2026-10-14 | `a4d688e`, `3120648` | Mockup exports renamed; phase 4 review against the mockups (container fit, band size, coaches title) |
| 2026-10-14 | `5be5a0f` | Phase 5: motion (`src/lib/motion.ts`, GSAP) |
| 2026-10-14 | `dd529e7` | Phase 6: SEO and launch prep (JSON-LD, OG image, robots, sitemap, redirects, 404, UTM everywhere) |
| 2026-10-14 | `8a0e09f`, `d56f6aa` | LAUNCH.md and README updates |
| 2026-10-17 | batch 1 commits | First round of owner feedback: coach cards flip to the bio and lose their numbers, all six coaches and one membership price on the homepage, the `/new-here` page, CTA pulse, photo tilt on every photo, replaying scroll entrances, desktop header from 1024px |
| 2026-10-19 | batch 2 commits | Nav labels never wrap (wordmark from 1440px); "New here?" renamed "New to BJJ?"; that page's long read became dropdowns in the hero |

Phases 1 to 4 were built in a Claude Code session on this machine; phases 5 and 6 in a second session started through Claude Code Remote Control, which worked on a git worktree branch (`worktree-bridge-cse_…`) that was then fast-forwarded into `main`. That branch can be deleted once the remote session is closed.

## 12. Open items

Facts Mike still owes are listed at the end of LAUNCH.md and in CLAUDE.md under "Open items". Technical follow-ups:

- Set `SITE_URL` once the domain is known (`TODO(launch)` in `astro.config.mjs`).
- Switch Keystatic to Cloud (`TODO(mike)` in `.env.example`).
- Confirm the Gymdesk member login URL (`settings.gymdesk.loginUrl` and the `/login` line in `public/_redirects`).
- If a vector logo arrives, swap `src/assets/logo.png` (the 350px badge) for it in `Logo.astro` and `Base.astro`.
- Paste the Gymdesk lead-form and booking embeds into Settings → Gymdesk in Keystatic; the contact page switches from `ContactForm` (which until then opens the visitor's email app addressed to `formEmail`) to `GymdeskForm` on the next build.
- Mirror the high-resolution hero original left to right when it arrives, as the current `hero-arm-lock-mirrored.jpg` is.
