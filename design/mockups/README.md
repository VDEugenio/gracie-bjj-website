# Mockups

Two forms of the same 13 artboards from the Claude Design canvas.

## `html/` — the design source (read these first)
Each file is the artboard exactly as designed: real copy, exact pixel sizes, spacing, grid spans, photo crops (`object-position`), and which images go where. Images are in `html/assets/`, already cropped and black and white:

| File | Used for |
|---|---|
| `hero-arm-lock-mirrored.jpg` | Homepage hero (mirrored on purpose) |
| `02-team-group-photo.jpg` | Final call to action |
| `03-program-mixed-level.jpg` … `08-program-competition.jpg` | Program cards (06 MMA uses `program-mma-striking.jpg`) |
| `09-welcome-section.jpg` | "New here?" strip |
| `10-community-landscape.jpg` | Schedule page header and CTA |
| `coaches/coach-*.jpg` | Coach portraits, pre-cropped to 4:5 |
| `logo-placeholder.webp` | 60px badge placeholder until the vector arrives |

How to read them:
- They're **mockup markup, not production code**: inline styles with literal hex values. Rebuild them with the Astro components and the tokens; don't paste them in.
- Dashed mono chips (class `mo`, inside `<sc-if value="{{notes}}">`) are **motion notes**, not UI.
- `<x-dc>`, `<helmet>`, `<sc-if>` and the `data-dc-script` block are canvas runtime wrappers; ignore them.
- They also open in a browser (fonts load from Google Fonts), close enough to eyeball, though the motion chips always show.

## `*.png` — the pictures
Exported from the canvas. Use them to judge the overall look and to compare against Playwright screenshots at 390px and 1440px.

If the HTML and a PNG ever disagree, the HTML wins on measurements and copy; the PNG shows the intended look. Facts (prices, times, bios) come from `../content-brief.md`.
