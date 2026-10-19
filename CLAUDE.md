# Relson Gracie Jiu-Jitsu of Charleston: website

Marketing site for a No-Gi jiu jitsu and MMA gym in West Ashley, Charleston, SC. The owner is Michael (Mike) Key. The site has one job: get beginners and parents to start a free week. Every decision should make that easier.

## Stack
- **Astro** (latest stable), with static output plus on-demand routes only where Keystatic needs them. Use the `@astrojs/cloudflare` adapter.
- **Tailwind CSS v4**, with the theme generated from the design tokens (see Design).
- **Keystatic** CMS in Keystatic Cloud mode, so Mike edits content at `/keystatic` without a GitHub account.
- **GSAP 3.13+** with ScrollTrigger and SplitText, all loaded from npm. Don't load them from a CDN.
- **Fontsource** for self-hosted fonts: `@fontsource-variable/archivo` (needs the full width axis, 62–125), `@fontsource-variable/geist`, and `@fontsource-variable/geist-mono`.
- **Lucide icons** (`lucide-astro` or inline SVG), 1.5px stroke.
- Hosted on **Cloudflare Pages**. The account, repo, and domain belong to Mike.
- Use React islands only if something truly needs one. Write the schedule filter and the mobile menu in plain TypeScript.

## Commands
- `npm run dev`: dev server at http://localhost:4321 (Keystatic admin at /keystatic)
- `npm run build`: production build. It must pass before every commit.
- `npm run preview`: preview the build locally
- `npx astro check`: type-check. Keep it at zero errors.

## Project structure
```
design/                 # VISUAL SOURCE OF TRUTH: read-only, never edit
  mockups/              # html/ = design source per artboard (+ assets/), *.png = exported pictures
  design-system/        # tokens.json, README.md, components/bundle.css (rg- classes) from the design system
  content-brief.md      # business facts, schedule, programs, pricing
src/
  styles/global.css     # @import tailwind, @theme from tokens, base styles
  lib/motion.ts         # ALL GSAP code lives here
  components/           # Header, MobileMenu, Footer, Button, Tag, ProgramCard, ProgramRow, ScheduleDay, CoachCard, PricingCard, PromoBanner, Marquee, ContactForm
  layouts/Base.astro    # <head>, SEO, JSON-LD, header/footer, motion init
  pages/                # index, new-here, schedule, programs/index, programs/[slug], coaches, contact
src/content/            # Keystatic-managed content (see Content model)
public/images/          # optimized photos go through astro:assets from src/assets instead when possible
```

**There is no sign-up page.** "Sign up" in the nav and every "Start your free week" button link straight to the Gymdesk signup.

## Design
- **The mockups in `design/mockups/` are the visual source of truth.** Each artboard exists in two forms: `design/mockups/html/*.html`, the Claude Design source, which you should **read first** for exact sizes, spacing, copy, grid spans and photo crops; and `design/mockups/*.png`, the exported picture, for the overall look and for comparing against your Playwright screenshots. The HTML is mockup markup with inline styles and literal hex values, so rebuild it with components and tokens rather than pasting it. See `design/mockups/README.md`. When a mockup and this file disagree on visuals, the mockup wins. When they disagree on facts (address, prices, links), `design/content-brief.md` wins.
- **Tokens:** generate CSS custom properties and the Tailwind `@theme` from `design/design-system/tokens.json`. Never hardcode a hex value, font size, or spacing value in a component; use the tokens.
- **Dark is the default theme.** The light theme (`[data-theme="light"]` on a section) is for long-read sections only: the body of each program detail page (what you'll learn, your first class, this week, other programs) and a future parents section. It is not a site-wide toggle.
- **Color:** graphite `surface` (#121212) background, `ink` text. **`signal` purple is the only accent.** Use it for the primary button, the active filter chip, today's schedule edge, the "Start here" tag, and at most one highlight per section. Text on a signal fill uses `on-signal`, never literal white.
- **Type:**
  - Headlines use **Archivo condensed**: `font-stretch: 62%`, weight 900, uppercase via CSS, line-height 0.8 so stacked lines nearly touch. Set them big and stack two or three words per line rather than running a headline wide.
  - Sizes (desktop / phone): `display-xl` 180 / 92px for the hero and final call to action; `display-l` 120 / 72px for section openers; `heading` 48 / 44px for program-card titles; coach names 64 / 72px on the coaches page (34px phone / 64px desktop on the homepage cards). Page titles (Programs, Class schedule, Our instructors, Visit us) are 190 / 108px.
  - **One exception stays expanded** (`font-stretch: 125%`, weight 800, class `rg-display-wide`): the scrolling program-name marquee and the small "Relson Gracie" wordmark in the desktop header.
  - Body text uses Geist. Times and prices use Geist Mono.
  - Headlines are solid `ink`. No outlined or stroked text.
- **Shape:** square photos and bands, 2px radius on buttons and cards, pill shapes only for tags and chips. No drop shadows. No gradients except the dark scrim on photos.
- **Photos** are black and white. Keep them that way: purple is the only color on the page. Use `astro:assets` `<Image>` with explicit width/height, `loading="lazy"` below the fold, and AVIF/WebP output. Never upscale a photo past its native size.
- **Hero photo:** use the **mirrored** (left-to-right flipped) arm-lock shot on both phone and desktop, so the coach's face sits on the right, clear of the left-aligned headline. Mirror the high-res original the same way when it arrives.
- **Phone hero:** headline and subhead sit over the bottom of the photo; the two buttons sit in a graphite strip directly below the photo, not on it.
- **Mobile menu:** full-screen graphite overlay with large condensed links (Home, New to BJJ?, Schedule, Programs, Coaches, Contact, Sign up), the current page marked, the free-week button and address at the bottom. The free-week button stays visible in the header when the menu is closed.
- **Coach cards** are fighter-style cards: a full 4:5 portrait under a bottom scrim, the rank set vertically down the top-right edge, the role label and the name (first and last on separate lines) set large over the bottom of the photo, then a 10px **belt stripe** across the card in the rank color with a rank bar near the right end (black belt = black with a red bar, purple belt = purple with a black bar, Relson's red belt plain red; 1px `line-strong` edges so black reads on dark), then a "Read bio" cue. On the coaches page the card **flips** (click, tap, or Enter/Space on the cue) to a back face that opens with the same belt stripe, then the tags, bio and a "Teaches" line, and flips back with "Back"; without JavaScript the back simply reads below the front. Coaches page: 3 columns from 1280px, 2 on tablets and small laptops, stacked on phones. The homepage shows every coach with `showOnHome` as compact versions (photo, name, belt stripe, rank), 3 across on desktop and 2 on phones, linking to the coaches page.

### Mockups
The HTML source of every artboard is in `design/mockups/html/` (same names, `.html`), with its images, already cropped and black and white, in `design/mockups/html/assets/`. Use those image files as the starting point for `src/assets/`. The PNG exports sit in `design/mockups/` with these names:
- `home-phone.png`, `home-desktop.png`
- `schedule-phone.png`, `schedule-desktop.png`
- `programs-phone.png`, `programs-desktop.png`
- `program-detail-phone.png`, `program-detail-desktop.png` (Fundamentals shown; the same template serves all six programs)
- `coaches-phone.png`, `coaches-desktop.png`
- `contact-phone.png`, `contact-desktop.png`
- `menu-open-phone.png`

Dashed mono chips in the mockups are motion annotations, not UI. Don't build them.

## Content rules
- **The gym is No-Gi only.** Never show, mention, or price a gi or kimono. The one current exception is the coach portraits of Relson Gracie and Jerry Brewer, which show a gi until No-Gi portraits are available.
- **The primary CTA is always the label "Start your free week".** It links to the Gymdesk signup; see the Gymdesk section below.
- **Voice:** a friendly coach at the front desk. Plain statements of what the gym is, where it is, who it's for, and what it costs. Short sentences, "you" and "we", no exclamation marks in headings, no emoji, no fight-gym bravado. **No slogans or taglines** (the old "No gi. No ego. Just jiu jitsu." line is out).
- **Program names are proper nouns:** Mixed Level Jiu Jitsu, Fundamentals, Youth Jiu Jitsu, MMA, Open Mat, Competition Training. Fundamentals and Mixed Level carry a "Start here" tag for beginners, except on the homepage program cards, which show the audience ("Adults") instead.
- **Business facts.** Don't invent hours, ages, belts, or bios. Use clear placeholders like `[Belt rank]` until Mike supplies them.
  - Name: Relson Gracie Jiu-Jitsu of Charleston
  - Address: 2467 Savannah Hwy, Suite 130, Charleston, SC 29414
  - Phone: (843) 377-5361
  - Instagram: https://www.instagram.com/graciejiujitsucharlestonsc/
  - Facebook: https://www.facebook.com/people/Gracie-Jiujitsu-Charleston/100054647910466/
- **Coaches, in display order** (full bios are in `design/content-brief.md`; seed Keystatic from them):
  1. Relson Gracie — Head Instructor, red belt (Grandmaster). Visits for seminars and private lessons.
  2. Michael Key — Owner / Instructor, black belt (jiu jitsu since 2007; also a taekwondo black belt). Teaches the Mon/Wed/Fri adult evening classes.
  3. Jerry Brewer — Instructor, black belt under Relson Gracie.
  4. James Foy — Instructor, black belt under Relson Gracie (2022). Adult BJJ and Striking Fundamentals.
  5. Sebastian Seagraves — Instructor and Youth coach, purple belt. Youth, Fundamentals, Adult BJJ.
  6. Aryan (Ari) — Instructor, purple belt under David Close. MMA and self-defense. Classes and photo still to come.

## Content model (Keystatic)
Mike edits all of this, so nothing below may be hardcoded in a page.
- **settings** (singleton): gym name, address, phone, email, social links, Gymdesk URLs (signup, login, lead form, booking), parking/entrance note.
- **promo** (singleton): `enabled`, `tag`, `message`, `linkLabel`, `linkUrl`, `expiresOn`. Hide the banner automatically when `expiresOn` has passed, checked at build time **and** client-side.
- **programs** (collection): `name`, `slug`, `order`, `tags[]`, `startHere` (boolean), `summary`, `description` (rich text), `learn[]` (what you'll learn), `audience` (adults | kids | all), `cost` (short line, e.g. "Included in the Adult membership"), `image`. Each program gets a page at `/programs/[slug]` built from the program detail mockup.
- **schedule** (collection, one entry per class): `day` (monday–saturday), `start` (24h "HH:MM"), `durationMin` (default 60), `program` (relationship to programs). Seed it from the JSON in `content-brief.md`. Program rows, detail pages, and "Today at the gym" all derive their times from this.
- **coaches** (collection): `name`, `role`, `order`, `belt` (white | blue | purple | brown | black | red), `beltNote` (e.g. "Grandmaster"), `lineage`, `specialties[]`, `bio`, `teaches` (short text, e.g. "Seminars · privates"), `teachesLabel` (optional, replaces the word "Teaches", e.g. "Status" for a coach who no longer teaches), `photo`, `showOnHome` (boolean).
- **pricing** (collection): `name`, `price`, `period` (month | day-pass | 10-pass | free), `features[]`, `highlighted`, `ctaUrl`, `order`.

## Gymdesk integration
Gymdesk is the gym's member system. It owns signups, billing, and leads, and **the website never handles payments or member data itself.**
- **Signup:** https://relson-gracie-jiujitsu-of-charleston.gymdesk.com/signup
- **Lead/trial form and booking widget:** Mike will provide embed codes from Gymdesk (Website > Forms > Embed; Gym > Bookings > Settings). Put each embed in its own component (`GymdeskForm.astro`, `GymdeskBooking.astro`) and load its script only on the pages that use it.
- **The contact page's "Send us a message" form is the Gymdesk lead form.** The mockup shows the intended fields and styling (name, email, optional phone, "Interested in", message). Until the embed code arrives, build `ContactForm` to the mockup with no submit handler.
- Restyle embeds with scoped CSS to match the tokens where their markup allows it. Don't fight an iframe.
- Add UTM parameters to every outbound Gymdesk link (`utm_source=website&utm_medium=cta&utm_campaign=<page>`) so Mike can see which page brought in a lead.
- Header: "Member login" as a quiet text link to the Gymdesk member portal, next to the free-week button.

## Motion (GSAP)
- **All animation lives in `src/lib/motion.ts`,** initialized once from `Base.astro`. Components only add `data-motion="…"` attributes.
- **Wrap everything in `gsap.matchMedia()`.** Under `(prefers-reduced-motion: reduce)`, run no animations at all.
- **Content must be fully visible with JavaScript off.** Set hidden starting states from JS (`gsap.set` / `from`), never in CSS.
- **Eases:** `power3.out` for entrances, `expo.out` for the hero, `power2.inOut` for movement that stops. Never use bounce or elastic.
- **Durations:** 0.3s for UI, 0.6s for reveals, 0.9–1.1s for the hero.
- **Planned moments:**
  - The hero headline (and program-page titles) split into lines with SplitText and each line slides up from a mask (stagger 0.08).
  - An infinite program-name marquee.
  - Photos reveal with a `clip-path` wipe.
  - Cards and program rows fade in with a stagger at ScrollTrigger `start: "top 80%"`.
  - **Every entrance replays** (reveals, photo wipes, titles, coach cards and belts, and the hero): once an element has fully left the screen it resets unseen, and it plays again when it comes back from below or above (`replayOnScroll()` in motion.ts).
  - A magnetic primary CTA on desktop pointers only.
  - The hero's "Start your free week" button sends a thin `signal` ring outward every ~3s while the arrow nudges right; it runs only while the button is on screen and stops for good once the visitor points at or focuses it (`<Button pulse>`).
  - Schedule filter rows fade and collapse over 0.3s.
  - Mobile menu opens from the top in 0.3s; its links rise in with a 0.05 stagger.
  - **Coach card tilt**, also used on the homepage program cards (desktop, `(hover: hover) and (pointer: fine)` only): the card tilts toward the cursor in 3D (max ±8° on X and Y, `perspective: 900px` on the parent, `gsap.quickTo` 0.4s `power3.out`), the photo drifts the opposite way up to 12px inside its frame, and the border goes `ink`; on mouse leave everything springs back over 0.6s. Animate `transform` only, and keep text crisp (no scaling).
  - Coach belt stripes "tie on" as each card scrolls in: `scaleX` 0→1 from the left, 0.6s. On phones, cards rise in one by one.
  - **Coach card flip:** the card turns over on `rotateY` in 0.6s `power2.inOut`; with reduced motion the faces swap at once.
  - **Photo tilt** (every photo outside a card, desktop pointers only): the photo leans in 3D inside its frame toward the pointer while it is over the photo (max ±4°, `perspective` 1000px), drifts the other way up to 10px, and springs back over 0.6s on leave. Mark the photo layer with `data-photo-tilt`.
  - **Hero photo tilt** (homepage): the hero photo leans in 3D inside its frame (max ±4°, `perspective` 1000px) and drifts the other way up to 10px. The scrims and headline stay put. On desktop it follows the pointer anywhere over the hero and springs back over 0.6s on leave. On touch screens (`(hover: none) and (pointer: coarse)`) it follows the phone's own tilt (`deviceorientation`), measured from the angle the phone is held at, which slowly re-centers, and only while the hero is on screen. The photo zooms just enough to hide its edges on the first move. Phone tilt needs HTTPS. iOS needs motion permission, requested on the visitor's first tap that isn't on a link or control; a denial is remembered in `localStorage` and never asked again. Cards do not tilt on phones.
- Animate only `transform`, `opacity`, and `clip-path`. Clean up ScrollTriggers on Astro view transitions if those get enabled.

## Quality bar
- **Lighthouse:** 90+ on mobile for Performance, Accessibility, Best Practices, and SEO.
- **Accessibility:**
  - Semantic landmarks and one `<h1>` per page.
  - Visible `focus-visible` rings using the `focus-ring` token.
  - Text contrast of 4.5:1 or better (the tokens already pass, so don't override them).
  - A labeled mobile menu button, `aria-current` on the current nav link, `aria-pressed` on filter chips, labeled form fields, and real `alt` text on every photo.
- **Responsive:** design at 390px first, then 768px and 1440px. No horizontal scroll at any width.
- Before calling a page done, run the dev server, take Playwright screenshots at 390px and 1440px, and compare them with the matching mockup.

## SEO
- Every page has a unique `<title>` and meta description, plus Open Graph and Twitter tags with a shared OG image.
- `LocalBusiness` (`SportsActivityLocation`) JSON-LD in `Base.astro`, built from Keystatic settings plus the schedule. Include address, phone, geo, and opening hours derived from the classes.
- Use `@astrojs/sitemap` and a `robots.txt`.
- Add **redirects from the old site's URLs** in `public/_redirects`: `/classes` and `/classes/*` → `/programs`, `/instructors` → `/coaches`, `/relson-gracie` → `/coaches`, `/login` → the Gymdesk member login. Old Google results must not 404.

## Workflow rules
- Work one phase at a time:
  1. Foundation and tokens
  2. Content model
  3. Components
  4. Pages
  5. Motion
  6. SEO and launch
- Plan before coding, and commit at the end of each phase with a clear message.
- Keep dependencies minimal. Ask before adding any package not listed in Stack.
- Never edit anything in `design/`.
- Never commit secrets. The Keystatic Cloud project ID and any keys go in `.env` (git-ignored), with names documented in `.env.example`.

## Open items (use placeholders until resolved)
- Michael Key's full bio (who promoted him and when); Aryan's classes and portrait
- Which classes Relson teaches
- No-Gi portraits for Relson and Jerry (current ones show a gi); higher-res portraits for Jerry (300px source) and James
- Sebastian's MMA record (bio says "as of February 2024")
- Youth Jiu Jitsu age range
- Class lengths (assume 60 min)
- Parking and entrance directions for Suite 130
- Vector logo (`design/` has a 60px placeholder)
- High-resolution originals of the selected photos
- Gymdesk lead-form and booking embed codes

## Project status and where to read (added October 14, 2026)

All six phases are built and on `main`. Before digging through the code, read:
- `README.md`: status, commands, file map, content model, component props, pages, tokens, motion hooks, SEO.
- `docs/ARCHITECTURE.md`: how the pieces fit together, the decisions that deviate from this file and why, gotchas, recipes for common changes, and the project timeline.
- `LAUNCH.md`: the go-live checklist and the facts Mike still owes.

**Every push to `main` deploys to production automatically** (confirmed October 14, 2026). Cloudflare Workers Builds is connected to `VDEugenio/gracie-bjj-website`, builds each push to `main` and deploys it to the `gracie-bjj-website` Worker within a couple of minutes. The result appears as a "Workers Builds: gracie-bjj-website" check on the commit in GitHub. The site is live at https://gracie-bjj-website.vaughndde.workers.dev until the custom domain is attached. So run `npm run build` and `npx astro check` before pushing, and treat a push as a release.

Decisions made during the build that differ from the text above:
- **Hosting is Cloudflare Workers with static assets, not Pages.** `@astrojs/cloudflare` dropped Pages support in v13. It is the same Git-connected, build-on-push setup, under Workers & Pages in the dashboard. See LAUNCH.md.
- **The Cloudflare adapter is attached only for `astro build`.** In dev it runs the server inside workerd, which breaks Keystatic's local file writes.
- **The `/keystatic` admin is built into production only when `KEYSTATIC_STORAGE=cloud`.** Local storage mode is dev-only.
- **`design/mockups/*.png` were renamed** to the names listed above, because the exports arrived under other names. Nothing else in `design/` was touched.
- **Phone page titles shrink to fit** the viewport instead of clipping as the mockups do (`src/lib/fit.ts`). Desktop overlaps from the mockups were kept.
- **Pages build as `coaches.html`, not `coaches/index.html`** (`build.format: 'file'`), so Cloudflare serves `/coaches` without a trailing-slash redirect and the URLs match the canonicals and the sitemap.
- **The desktop header starts at 1024px (`lg`), not 768px.** With seven nav links it can't fit at tablet widths, so below `lg` the header uses the phone layout and the mobile menu. From `lg` it shows the badge, nav and free-week button; "Member login" joins at 1280px (`xl`) and the wordmark at 1440px. Nav labels never wrap (`navlink` is `white-space: nowrap`).
- **The homepage "New here?" section became its own page, `/new-here`** (October 2026), linked from the nav after Home as **"New to BJJ?"** (the page title too; the URL stays `/new-here`). There is no mockup for it. The hero holds the title and buttons on the left and the topics (free week, what BJJ is, how a class runs, what to wear, why people train, for parents) as one-at-a-time dropdowns on the right (`Disclosure`, native `<details name>`), then the facts strip and the photo call to action. No light long read.
- **Homepage pricing shows two cards** (Free week and one "Monthly membership", the same $100 for adults and kids). The day passes are still in Keystatic but no page shows them.
