/**
 * Headline fitting without JavaScript.
 *
 * Display sizes in tokens.css are `min(<token>, var(--fit-size, 9999px))`.
 * A heading passes its longest word here and gets an inline `--fit-size`
 * that caps the font size so that word fits `--fit-available` (the viewport
 * minus the page gutters). When the word fits at the token size, the token
 * size wins and nothing changes. The mockups clip "Fundamentals" and
 * "Instructors" at phone width; this shrinks them instead.
 */

/** Average advance width of Archivo condensed black capitals, in em. Measured from the build. */
const CAP_WIDTH_EM = 0.49;

export function longestWord(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .reduce((longest, word) => (word.length > longest.length ? word : longest), '');
}

/** Inline style value for a display heading, or undefined when there is nothing to fit. */
export function fitStyle(text: string): string | undefined {
  const word = longestWord(text);
  if (word.length < 6) return undefined;
  const ems = (word.length * CAP_WIDTH_EM).toFixed(2);
  return `--fit-size: calc(var(--fit-available) / ${ems})`;
}
