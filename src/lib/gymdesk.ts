/**
 * Outbound Gymdesk links. Every one carries UTM parameters so Mike can see
 * which page and which button brought in a lead:
 *   utm_source=website  utm_medium=cta  utm_campaign=<page>  utm_content=<placement>
 */
export type GymdeskPlacement =
  | 'header'
  | 'nav'
  | 'menu'
  | 'hero'
  | 'promo'
  | 'pricing'
  | 'final-cta'
  | 'section-cta'
  | 'facts'
  | 'contact';

export function gymdeskUrl(base: string, campaign: string, placement: GymdeskPlacement): string {
  const url = new URL(base);
  url.searchParams.set('utm_source', 'website');
  url.searchParams.set('utm_medium', 'cta');
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', placement);
  return url.toString();
}
