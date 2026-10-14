// Full-page screenshots at the two design widths, for comparing against design/mockups/*.png.
//
//   npm run screenshots -- home dev/components schedule
//   npm run screenshots -- --base http://localhost:4321 --out .screenshots home
//
// Pages are given as bare names ("home" is the root). Leading slashes are optional,
// because Git Bash on Windows rewrites a bare "/" argument into a filesystem path.
//
// Expects a running server (npm run dev). Output: .screenshots/<page>-<width>.png (git-ignored).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};

const base = opt('--base', 'http://localhost:4321').replace(/\/$/, '');
const outDir = resolve(opt('--out', '.screenshots'));
const paths = (args.length ? args : ['home']).map((a) => (a === 'home' ? '/' : '/' + a.replace(/^\/+/, '')));
const viewports = [
  { name: 'phone', width: 390, height: 844, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

for (const path of paths) {
  const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/[\/?#]+/g, '-');
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const file = resolve(outDir, `${slug}-${vp.width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const overflow = scrollWidth > vp.width ? `  HORIZONTAL OVERFLOW: ${scrollWidth}px > ${vp.width}px` : '';
    console.log(`${slug} @ ${vp.width}px -> ${file}${overflow}`);
    await context.close();
  }
}

await browser.close();
