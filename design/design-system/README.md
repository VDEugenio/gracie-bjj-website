Relson Gracie Jiu-Jitsu of Charleston is a No-Gi jiu jitsu and MMA gym at 2467 Savannah Hwy, Suite 130, in West Ashley. The site's one job is to get a nervous beginner, or a parent, to book a free week. The look borrows from No-Gi apparel brands — graphite, chalk, one electric purple, tall condensed type set huge — so it reads as cool and current, while the copy stays warm and plain so it never reads as intimidating.

## Content fundamentals

- **Voice:** a coach talking to a newcomer at the front desk. Confident, friendly, short sentences. "You" for the reader, "we" for the gym.
- **Lead with reassurance:** no experience needed, no gi needed, first week free. Say these early and often.
- **Casing:** display headlines in uppercase via CSS (write them in sentence case in the CMS). Everything else sentence case. Program names are proper nouns: Mixed Level Jiu Jitsu, Fundamentals, Youth Jiu Jitsu, MMA, Open Mat, Competition Training.
- **Say "No-Gi"** (or "no gi" in running copy). Never show or mention gis, kimonos or gi pricing.
- **The CTA is always "Start your free week"**, linking to the Gymdesk signup. Secondary actions: "View schedule", "Meet the coaches", "Get directions".
- **No:** exclamation marks in headings, emoji, "beast mode" bravado, fake urgency, stock-photo fighters.

Real copy to model:
> No-Gi jiu jitsu and MMA. West Ashley, Charleston. Adults and kids, all levels. First week free.
> No experience needed. No gi needed — rash guard and shorts. Your first week is free.

Keep it plain: state what the gym is, where it is, who it's for and what it costs. No slogans, no taglines, no "No ego" wordplay — a headline that would look at home on a T-shirt is too much.

## Visual foundations

### Color
- Dark is the default theme. Pages sit on `surface`; cards on `surface-raised`; alternate bands on `surface-muted`.
- Text is `ink`; supporting copy `ink-muted`; purple text (links, tag labels) `signal-text`.
- `signal` is the only accent. Spend it on the primary button, the pressed filter chip, today's schedule edge, and at most one highlighted word or stat per section. If a screen has three purple things, remove two.
- Text on a `signal` fill is `on-signal` (graphite in dark, white in light) — never hardcode white.
- Use the light theme for long reading (program details, FAQ, the parents section) to give the eye a break from the dark scroll.

### Type
- Headlines: Archivo at condensed width (`font-stretch: 62%`, weight 900), uppercase, leading 0.8 so stacked lines touch — styles `display-xl`, `display-l`, `heading`. Class `rg-display`. Go big: the hero is 180px on desktop and the condensed width is what keeps that from feeling heavy. Stack two or three words per line rather than running a headline wide.
- The one expanded exception: the scrolling marquee of program names and the small "Relson Gracie" wordmark in the header stay at `font-stretch: 125%` (class `rg-display-wide`) so the condensed headlines have something to contrast with.
- Body: Geist (`body-l`, `body`, `label`). Times and prices: Geist Mono (`time`) so schedule columns align.
- All three load from Google Fonts (the `@import` at the top of `components/bundle.css`; Archivo loads its full width axis, 62–125). Self-host with Fontsource in production.
- On phones, `display-xl` drops to 92px, `display-l` to 72px and `heading` to 44px.

### Layout and spacing
- Max content width 1280px; gutters `space-8` desktop, `space-4` phone. Sections separated by `space-24` (64px on phones).
- Build on a 12-column grid with deliberate asymmetry: a headline spanning 8 columns against a 4-column caption beats centered everything.
- Corners are square (`radius-none`) for bands and photos, `radius-sm` for buttons and cards, `radius-pill` only for tags and chips.
- Hairlines (`line`) separate; no drop shadows anywhere.

### Imagery
- Real photos of this gym's members and coaches, in rash guards and shorts. High contrast, slightly desaturated, cropped tight on hands, grips and faces.
- Full-bleed photos under a `surface` fade for legibility. Never put text on a busy, unfaded photo.
- Kids' photos only with parent consent.

### Logo
- The Relson Gracie badge (`assets/Logos/relson-gracie-badge.webp`) is a single-ink circular mark. Use it at 56–64px in the header and large in the footer.
- The file here is a 60px placeholder: replace it with the vector original before launch. Don't redraw or recolor the badge.

### Motion (GSAP)
Motion should feel like a good scramble: fast to start, controlled to finish. Load GSAP 3.13+ (all plugins are free, including ScrollTrigger and SplitText).
- **Eases:** `power3.out` for entrances, `expo.out` for big headline reveals, `power2.inOut` for anything that moves and stops. Never `bounce` or `elastic`.
- **Durations:** 0.3s for UI (hover, filters), 0.6s for content reveals, 0.9–1.1s for the hero.
- **Hero:** split the headline into lines with SplitText and slide each up from a clipped mask (`yPercent: 110 → 0`, stagger 0.08). Then the CTA fades in.
- **Section reveals:** ScrollTrigger at `start: "top 80%"`, content rises 24px and fades in, stagger 0.06. Each element animates once.
- **Signature moments (pick two or three, not all):** a slow infinite marquee of program names between sections; photos revealed by a `clip-path` wipe as they scroll in; a pinned section where the six programs scroll horizontally; the primary CTA pulled slightly toward the cursor ("magnetic") on desktop.
- **Schedule filter:** rows fade and collapse over 0.3s, no layout jump.
- **Accessibility:** wrap everything in `gsap.matchMedia()` and skip it under `(prefers-reduced-motion: reduce)`. Content must be fully visible with JavaScript off — set the hidden starting states from JavaScript, never in CSS.

### States
- Hover: borders go to `ink`, the primary button to `signal-hover`, button arrows nudge 3px right.
- Focus: a 2px `focus-ring` outline with 2px offset on every interactive element.

## Iconography
- Use Lucide icons at 1.5px stroke, 20px, in `ink` or `ink-muted`. Arrows (`→`) on primary buttons, map pin and phone in the footer and contact page.
- No emoji, no illustrated icons, no martial-arts clip art.

## Components
Classes live in `components/bundle.css` (prefix `rg-`). Each component's page shows its preview and what to provide: Button, Tag, PromoBanner, ProgramCard, ScheduleDay, InstructorCard.
