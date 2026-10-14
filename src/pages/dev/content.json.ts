/**
 * Dev-only dump of every collection as JSON, for checking the content model
 * and the schedule helpers. Removed before launch (phase 6).
 */
import type { APIRoute } from 'astro';
import { getCoaches, getPricing, getPrograms, getPromo, getSchedule, getSettings, isPromoLive } from '@/lib/content';
import { groupByDay, summaryFor, timeRows, whenFact } from '@/lib/schedule';
import { rankLine } from '@/lib/belts';

export const GET: APIRoute = async () => {
  const [settings, promo, programs, schedule, coaches, pricing] = await Promise.all([
    getSettings(),
    getPromo(),
    getPrograms(),
    getSchedule(),
    getCoaches(),
    getPricing(),
  ]);

  const body = {
    settings,
    promo: { ...promo, live: isPromoLive(promo) },
    programs: programs.map((p) => ({
      id: p.id,
      ...p.data,
      image: { src: p.data.image.src, width: p.data.image.width, height: p.data.image.height },
      body: p.body,
      summaryLine: summaryFor(p, schedule),
      when: whenFact(schedule, p.id),
      rows: timeRows(schedule, p.id),
    })),
    scheduleCount: schedule.length,
    days: groupByDay(schedule, programs).map((d) => ({
      day: d.label,
      classes: d.classes.map((c) => `${c.time} ${c.program.data.name}`),
    })),
    coaches: coaches.map((c) => ({
      id: c.id,
      name: c.data.name,
      role: c.data.role,
      rank: rankLine(c.data),
      photo: c.data.photo ? `${c.data.photo.width}x${c.data.photo.height}` : null,
      showOnHome: c.data.showOnHome,
    })),
    pricing: pricing.map((p) => ({ id: p.id, ...p.data })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
