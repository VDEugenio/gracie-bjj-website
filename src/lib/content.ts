/**
 * Typed access to the Keystatic-managed content collections.
 * Pages import from here instead of calling getCollection directly, so sorting
 * and the singleton lookups live in one place.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { sortSchedule } from './schedule';

export type Settings = CollectionEntry<'settings'>['data'];
export type Promo = CollectionEntry<'promo'>['data'];
export type Program = CollectionEntry<'programs'>;
export type ClassEntry = CollectionEntry<'schedule'>;
export type Coach = CollectionEntry<'coaches'>;
export type Plan = CollectionEntry<'pricing'>;

export async function getSettings(): Promise<Settings> {
  const entry = await getEntry('settings', 'settings');
  if (!entry) throw new Error('Missing src/content/settings.yaml');
  return entry.data;
}

export async function getPromo(): Promise<Promo | null> {
  const entry = await getEntry('promo', 'promo');
  return entry?.data ?? null;
}

/** The banner shows when enabled and, if an expiry is set, until the end of that day. */
export function isPromoLive(promo: Promo | null, now: Date = new Date()): promo is Promo {
  if (!promo || !promo.enabled) return false;
  if (!promo.expiresOn) return true;
  const end = new Date(promo.expiresOn);
  end.setUTCHours(23, 59, 59, 999);
  return now <= end;
}

export async function getPrograms(): Promise<Program[]> {
  const all = await getCollection('programs');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getProgram(id: string): Promise<Program | undefined> {
  return getEntry('programs', id);
}

export async function getSchedule(): Promise<ClassEntry[]> {
  return sortSchedule(await getCollection('schedule'));
}

export async function getCoaches(): Promise<Coach[]> {
  const all = await getCollection('coaches');
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** The compact cards on the home page: coaches flagged showOnHome, at most four. */
export async function getHomeCoaches(): Promise<Coach[]> {
  return (await getCoaches()).filter((c) => c.data.showOnHome).slice(0, 4);
}

export async function getPricing(): Promise<Plan[]> {
  const all = await getCollection('pricing');
  return all.sort((a, b) => a.data.order - b.data.order);
}
