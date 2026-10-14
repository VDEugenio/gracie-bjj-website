// Generates src/styles/tokens.css from design/design-system/tokens.json.
// Runs before `astro dev` and `astro build` (see package.json). The output is
// committed so type-checking and editors work without running it first.
//
// Everything the site can use as a color, font, size, space or radius is
// declared here as a Tailwind v4 theme token. Components never write a hex
// value, a px font size or a px spacing value; they use the generated
// utilities (bg-surface, text-display-xl, p-4) or the CSS variables.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'design/design-system/tokens.json');
const target = resolve(root, 'src/styles/tokens.css');

const tokens = JSON.parse(readFileSync(source, 'utf8'));

/* ---------- Values that tokens.json does not define ---------- */

// Belt rank colors are real-world colors, not theme colors, so they do not
// change with the light theme. Red, black, purple and unknown come from the
// mockups; white, blue and brown are picked to sit in the same family.
const BELTS = {
  white: '#e8e6e0',
  blue: '#1f4e9c',
  purple: '#4b2f8a',
  brown: '#5a3a21',
  black: '#0b0b0b',
  red: '#8c1d1d',
  unknown: '#2a2a2a',
};

// Phone-first breakpoints. `md` is where the mockups switch from the 390px
// artboards to the 1440px ones.
const BREAKPOINTS = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' };

// Type scale. tokens.json defines the core group; the rest are the sizes the
// mockups use, named so components never carry a raw px value.
// size: [phone, desktop] or a single value for every width.
const TYPE = {
  // Archivo condensed, 900, uppercase (pair with the `display` utility)
  'display-page': { size: ['108px', '190px'], lh: 0.8, tracking: '-0.01em', weight: 900 },
  'display-xl': { size: ['92px', '180px'], lh: 0.8, tracking: '-0.01em', weight: 900 },
  'display-detail': { size: ['100px', '160px'], lh: 0.8, tracking: '-0.01em', weight: 900 },
  'display-l': { size: ['72px', '120px'], lh: 0.8, tracking: '-0.01em', weight: 900 },
  'display-m': { size: ['60px', '96px'], lh: 0.8, tracking: '-0.01em', weight: 900 },
  'display-name': { size: ['72px', '64px'], lh: 0.85, tracking: '-0.01em', weight: 900 },
  'display-name-sm': { size: ['34px', '64px'], lh: 0.85, tracking: '-0.01em', weight: 900 },
  heading: { size: ['44px', '48px'], lh: 0.85, tracking: '-0.01em', weight: 900 },
  'heading-sm': { size: ['28px', '32px'], lh: 0.85, tracking: '-0.01em', weight: 900 },
  // Archivo expanded, 800 (pair with the `display-wide` utility)
  marquee: { size: ['40px', '96px'], lh: 1, tracking: '-0.01em', weight: 800 },
  wordmark: { size: '15px', lh: 1.1, tracking: '0.02em', weight: 800 },
  // Archivo normal width, 700 (pair with the `title` utility)
  title: { size: '20px', lh: 1.15, weight: 700 },
  // Geist
  'body-l': { size: ['16px', '18px'], lh: 1.6, weight: 400 },
  body: { size: '16px', lh: 1.6, weight: 400 },
  'body-sm': { size: '15px', lh: 1.5, weight: 400 },
  caption: { size: '14px', lh: 1.5, weight: 400 },
  label: { size: '12px', lh: 1.2, tracking: '0.12em', weight: 600 },
  'label-sm': { size: '11px', lh: 1.2, tracking: '0.12em', weight: 600 },
  'label-xs': { size: '10px', lh: 1.2, tracking: '0.16em', weight: 600 },
  button: { size: '13px', lh: 1, tracking: '0.12em', weight: 600 },
  'button-sm': { size: '12px', lh: 1, tracking: '0.12em', weight: 600 },
  chip: { size: '12px', lh: 1, tracking: '0.1em', weight: 600 },
  // Geist Mono
  time: { size: '14px', lh: 1.2, tracking: '0.02em', weight: 500 },
  'time-l': { size: '18px', lh: 1.2, tracking: '0.02em', weight: 500 },
  'time-sm': { size: '12px', lh: 1.2, tracking: '0.02em', weight: 500 },
  price: { size: ['32px', '40px'], lh: 1.1, tracking: '0.02em', weight: 600 },
  'price-l': { size: ['40px', '48px'], lh: 1.1, tracking: '0.02em', weight: 600 },
};

const WEIGHTS = { normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
const LEADING = { none: 1, tight: 1.1, snug: 1.25, normal: 1.5, relaxed: 1.6 };
const TRACKING = {
  normal: '0',
  display: '-0.01em',
  label: '0.12em',
  'label-wide': '0.16em',
  chip: '0.1em',
  time: '0.02em',
  wordmark: '0.02em',
};

/* ---------- Helpers ---------- */

const themes = tokens.color.themes.map((t) => t.id); // ['dark', 'light']
const colorTokens = tokens.color.tokens;

/** Resolve "{signal}" style references to the concrete value for a theme. */
function colorValue(token, theme) {
  const raw = typeof token.value === 'string' ? token.value : token.value[theme];
  const ref = /^\{(.+)\}$/.exec(raw);
  if (!ref) return raw;
  const found = colorTokens.find((t) => t.name === ref[1]);
  if (!found) throw new Error('Unknown token reference ' + raw);
  return colorValue(found, theme);
}

function colorBlock(theme, indent = '  ') {
  return colorTokens.map((t) => indent + '--color-' + t.name + ': ' + colorValue(t, theme) + ';').join('\n');
}

// Fontsource variable fonts register under "<Name> Variable".
function familyOf(key) {
  return tokens.type.families[key]
    .replace('"Archivo"', '"Archivo Variable"')
    .replace('"Geist"', '"Geist Variable"')
    .replace('"Geist Mono"', '"Geist Mono Variable"');
}

const isResponsive = (def) => Array.isArray(def.size);

/* ---------- Emit ---------- */

const out = [];
const push = (line = '') => out.push(line);

push('/* GENERATED FILE. Do not edit. Source: design/design-system/tokens.json via scripts/tokens.mjs */');
push();
push('@theme static {');
push("  /* Drop Tailwind's default palette, sizes and fonts so only brand tokens generate utilities. */");
push('  --*: initial;');
push();
push('  /* Color: ' + themes[0] + ' is the default theme. */');
push(colorBlock(themes[0]));
push();
push('  /* Belt rank colors (theme independent) */');
for (const [name, value] of Object.entries(BELTS)) push('  --color-belt-' + name + ': ' + value + ';');
push();
push('  /* Fonts (self-hosted via Fontsource) */');
push('  --font-display: ' + familyOf('display') + ';');
push('  --font-body: ' + familyOf('body') + ';');
push('  --font-mono: ' + familyOf('mono') + ';');
push('  --default-font-family: var(--font-body);');
push('  --default-mono-font-family: var(--font-mono);');
push();
push('  /* Spacing: tokens.json space-N is N x 4px, the same scale Tailwind uses (p-4 = space-4 = 16px). */');
push('  --spacing: 4px;');
push('  --container-site: 1280px;');
for (const [name, value] of Object.entries(BREAKPOINTS)) push('  --breakpoint-' + name + ': ' + value + ';');
push();
push('  /* Radius */');
for (const t of tokens.radius.tokens) push('  --' + t.name + ': ' + t.value + ';');
push();
push('  /* Weight, leading, tracking */');
for (const [name, value] of Object.entries(WEIGHTS)) push('  --font-weight-' + name + ': ' + value + ';');
for (const [name, value] of Object.entries(LEADING)) push('  --leading-' + name + ': ' + value + ';');
for (const [name, value] of Object.entries(TRACKING)) push('  --tracking-' + name + ': ' + value + ';');
push();
push('  /* Type scale. Responsive sizes point at --fs-* variables that change at the md breakpoint. */');
for (const [name, def] of Object.entries(TYPE)) {
  push('  --text-' + name + ': ' + (isResponsive(def) ? 'var(--fs-' + name + ')' : def.size) + ';');
  push('  --text-' + name + '--line-height: ' + def.lh + ';');
  if (def.weight) push('  --text-' + name + '--font-weight: ' + def.weight + ';');
  if (def.tracking) push('  --text-' + name + '--letter-spacing: ' + def.tracking + ';');
}
push();
push('  /* Motion defaults for the few CSS hover transitions (GSAP handles everything else). */');
push('  --default-transition-duration: 200ms;');
push('  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);');
push('  --ease-out: cubic-bezier(0, 0, 0.2, 1);');
push('  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);');
push('}');
push();
push('/* Responsive type sizes: phone first, desktop from the md breakpoint. */');
push(':root {');
for (const [name, def] of Object.entries(TYPE)) if (isResponsive(def)) push('  --fs-' + name + ': ' + def.size[0] + ';');
push('}');
push('@media (min-width: ' + BREAKPOINTS.md + ') {');
push('  :root {');
for (const [name, def] of Object.entries(TYPE)) if (isResponsive(def)) push('    --fs-' + name + ': ' + def.size[1] + ';');
push('  }');
push('}');
push();
push('/* Themes. Dark is the default; add data-theme="light" to a section for long reads. */');
for (const theme of themes) {
  push('[data-theme="' + theme + '"] {');
  push(colorBlock(theme));
  push('}');
}
push();
push('/* Spacing tokens by their design-system names, for plain CSS. */');
push(':root {');
for (const t of tokens.spacing.tokens) push('  --' + t.name + ': ' + t.value + ';');
push('}');
push();

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out.join('\n'));
console.log(
  'tokens: wrote src/styles/tokens.css (' +
    colorTokens.length +
    ' colors, ' +
    Object.keys(TYPE).length +
    ' text styles)',
);
