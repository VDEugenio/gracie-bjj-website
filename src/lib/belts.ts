/**
 * Belt ranks: labels and the stripe colors on coach cards.
 * The stripe is the rank color; the bar near the right end is red on a black
 * belt and black on blue, purple and brown. Relson's red belt is plain.
 * Class names are written out in full so Tailwind can find them.
 */
import type { CollectionEntry } from 'astro:content';

export type BeltKey = CollectionEntry<'coaches'>['data']['belt'];

const LABELS: Record<BeltKey, string> = {
  unknown: '[Belt rank]',
  white: 'White belt',
  blue: 'Blue belt',
  purple: 'Purple belt',
  brown: 'Brown belt',
  black: 'Black belt',
  red: 'Red belt',
};

const STRIPES: Record<BeltKey, { stripe: string; bar: string | null }> = {
  unknown: { stripe: 'bg-belt-unknown', bar: null },
  white: { stripe: 'bg-belt-white', bar: null },
  blue: { stripe: 'bg-belt-blue', bar: 'bg-belt-black' },
  purple: { stripe: 'bg-belt-purple', bar: 'bg-belt-black' },
  brown: { stripe: 'bg-belt-brown', bar: 'bg-belt-black' },
  black: { stripe: 'bg-belt-black', bar: 'bg-belt-red' },
  red: { stripe: 'bg-belt-red', bar: null },
};

export const beltLabel = (belt: BeltKey): string => LABELS[belt];
export const beltStripe = (belt: BeltKey) => STRIPES[belt];

/** "Red belt · Grandmaster", "Black belt · Relson Gracie", "[Belt rank] · Relson Gracie", "[Belt rank]". */
export function rankLine(data: Pick<CollectionEntry<'coaches'>['data'], 'belt' | 'beltNote' | 'lineage'>): string {
  const suffix = data.beltNote || data.lineage;
  return suffix ? `${LABELS[data.belt]} · ${suffix}` : LABELS[data.belt];
}
