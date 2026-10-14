/**
 * Headline fitting without JavaScript.
 *
 * Display sizes in tokens.css are `min(<token>, var(--fit-size, 9999px))`.
 * A heading passes its text here and gets an inline `--fit-size` that caps
 * the font size so its longest word fits `--fit-available` (the viewport
 * minus the page gutters). When the word fits at the token size, the token
 * size wins and nothing changes. The mockups clip "Fundamentals" and
 * "Instructors" at phone width; this shrinks them instead.
 *
 * Word widths come from the advance widths of Archivo at 62% width and
 * weight 900 (uppercase, as the display utility renders), measured in the
 * browser and stored here in em.
 */

const GLYPH_EM: Record<string, number> = {
  A: 0.52, B: 0.488, C: 0.503, D: 0.499, E: 0.452, F: 0.392, G: 0.533, H: 0.503, I: 0.253, J: 0.443,
  K: 0.5, L: 0.422, M: 0.695, N: 0.508, O: 0.544, P: 0.475, Q: 0.544, R: 0.499, S: 0.459, T: 0.465,
  U: 0.493, V: 0.48, W: 0.719, X: 0.49, Y: 0.471, Z: 0.465,
  '0': 0.434, '1': 0.361, '2': 0.417, '3': 0.43, '4': 0.425, '5': 0.427, '6': 0.435, '7': 0.377, '8': 0.422, '9': 0.435,
  ' ': 0.1, '-': 0.23, '.': 0.212, ',': 0.212, "'": 0.203, '’': 0.194, '&': 0.556, '/': 0.268, ':': 0.212,
  '!': 0.256, '?': 0.414, '(': 0.379, ')': 0.379,
};
const FALLBACK_EM = 0.55;
/** Small safety margin for letter-spacing rounding. */
const MARGIN = 1.02;

/** Width of a word in em at the display style, uppercase. */
export function wordEm(word: string): number {
  let total = 0;
  for (const ch of word.toUpperCase()) total += GLYPH_EM[ch] ?? FALLBACK_EM;
  return total;
}

/** The widest word of a text, ignoring tags. */
export function widestWord(text: string): { word: string; em: number } {
  let best = { word: '', em: 0 };
  for (const word of text.replace(/<[^>]+>/g, ' ').split(/\s+/)) {
    const em = wordEm(word);
    if (em > best.em) best = { word, em };
  }
  return best;
}

/** Inline style value for a display heading, or undefined when there is nothing to fit. */
export function fitStyle(text: string): string | undefined {
  const { em } = widestWord(text);
  if (em < 2.5) return undefined;
  return `--fit-size: calc(var(--fit-available) / ${(em * MARGIN).toFixed(3)})`;
}
