/** Google Maps links built from the gym settings. No API key needed. */
import type { Settings } from './content';

export function fullAddress(settings: Settings): string {
  const { street, city, state, zip } = settings.address;
  return `${street}, ${city}, ${state} ${zip}`;
}

/** The iframe src: Mike's own embed URL when set, otherwise a search embed for the address. */
export function mapEmbedSrc(settings: Settings): string {
  if (settings.mapEmbedUrl) return settings.mapEmbedUrl;
  const query = encodeURIComponent(`${settings.name}, ${fullAddress(settings)}`);
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

/** "Get directions" link that opens the user's maps app. */
export function directionsUrl(settings: Settings): string {
  const destination = encodeURIComponent(`${settings.name}, ${fullAddress(settings)}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}
