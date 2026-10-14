/**
 * Structured data for search engines. The LocalBusiness markup
 * (schema.org SportsActivityLocation) is built from the Keystatic settings and
 * the weekly schedule, so a new class time or a changed phone number reaches
 * Google on the next build without touching code.
 */
import type { ClassEntry, Settings } from './content';
import { DAYS, endTime } from './schedule';

export interface OpeningHours {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string;
  opens: string;
  closes: string;
}

/**
 * Opening hours derived from the classes: on each day the gym opens with the
 * first class and closes when the last one ends. Days without classes are left
 * out, which schema.org reads as closed.
 */
export function openingHours(schedule: ClassEntry[]): OpeningHours[] {
  return DAYS.flatMap((day) => {
    const classes = schedule.filter((c) => c.data.day === day.key);
    if (classes.length === 0) return [];
    const opens = classes.map((c) => c.data.start).sort()[0]!;
    const closes = classes
      .map((c) => endTime(c.data.start, c.data.durationMin))
      .sort()
      .at(-1)!;
    return [{ '@type': 'OpeningHoursSpecification' as const, dayOfWeek: `https://schema.org/${day.label}`, opens, closes }];
  });
}

/** E.164 for the telephone property: "(843) 377-5361" -> "+18433775361". */
function e164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

interface LocalBusinessInput {
  settings: Settings;
  schedule: ClassEntry[];
  /** Absolute site origin, e.g. https://example.com/ */
  site: URL;
  /** Absolute URL of the shared OG photo. */
  image: string;
  /** Absolute URL of the logo. */
  logo: string;
}

export function localBusiness({ settings, schedule, site, image, logo }: LocalBusinessInput): Record<string, unknown> {
  const { address, geo } = settings;
  const url = new URL('/', site).href;
  const sameAs = [settings.instagram, settings.facebook].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${url}#gym`,
    name: settings.name,
    url,
    image,
    logo,
    telephone: e164(settings.phone),
    ...(settings.email ? { email: settings.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: 'US',
    },
    ...(geo?.lat != null && geo?.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } }
      : {}),
    ...(address.neighborhood ? { areaServed: `${address.neighborhood}, ${address.city}, ${address.state}` } : {}),
    sport: ['Brazilian Jiu-Jitsu', 'Mixed Martial Arts'],
    openingHoursSpecification: openingHours(schedule),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
