/**
 * Outbound Gymdesk links. Every one carries UTM parameters so Mike can see
 * which page and which button brought in a lead:
 *   utm_source=website  utm_medium=cta  utm_campaign=<page>  utm_content=<placement>
 *
 * Only Gymdesk URLs are tagged. Anything else (a relative link, another site)
 * comes back unchanged, so CMS fields that may hold either are safe to pass in.
 */
export type GymdeskPlacement =
  | 'header'
  | 'nav'
  | 'footer'
  | 'menu'
  | 'login'
  | 'hero'
  | 'promo'
  | 'pricing'
  | 'final-cta'
  | 'section-cta'
  | 'facts'
  | 'contact';

const isGymdesk = (url: URL) => url.hostname === 'gymdesk.com' || url.hostname.endsWith('.gymdesk.com');

export function gymdeskUrl(base: string, campaign: string, placement: GymdeskPlacement): string {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }
  if (!isGymdesk(url)) return base;
  url.searchParams.set('utm_source', 'website');
  url.searchParams.set('utm_medium', 'cta');
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', placement);
  return url.toString();
}

/**
 * Tags `base` with the same UTM parameters `tagged` already carries. Used where
 * a CMS field (a pricing plan's own ctaUrl) replaces a link the page tagged.
 */
export function withUtmFrom(base: string, tagged: string): string {
  let target: URL;
  let source: URL;
  try {
    target = new URL(base);
    source = new URL(tagged);
  } catch {
    return base;
  }
  if (!isGymdesk(target)) return base;
  for (const [key, value] of source.searchParams) {
    if (key.startsWith('utm_')) target.searchParams.set(key, value);
  }
  return target.toString();
}
