/**
 * Schedule helpers. The weekly schedule collection is the single source of
 * class times; program rows, program pages, "Today at the gym" and the
 * business-hours markup all derive from it through these functions.
 */
import type { CollectionEntry } from 'astro:content';

export type ClassEntry = CollectionEntry<'schedule'>;
export type ProgramEntry = CollectionEntry<'programs'>;
export type DayKey = ClassEntry['data']['day'];

export const DAYS: ReadonlyArray<{ key: DayKey; label: string; short: string }> = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
];

const dayIndex = (key: DayKey) => DAYS.findIndex((d) => d.key === key);
export const dayLabel = (key: DayKey) => DAYS[dayIndex(key)]?.label ?? key;
export const dayShort = (key: DayKey) => DAYS[dayIndex(key)]?.short ?? key;

/* ---------- Times ---------- */

function parse(hhmm: string): { h: number; m: number } {
  const [h = '0', m = '0'] = hhmm.split(':');
  return { h: Number(h), m: Number(m) };
}

/** "18:00" -> "6:00 PM", "06:00" -> "6:00 AM", "12:00" -> "12:00 PM". */
export function formatTime(hhmm: string): string {
  const { h, m } = parse(hhmm);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "18:00" -> "6 PM", "12:00" -> "noon", "17:30" -> "5:30 PM". For running copy. */
export function shortTime(hhmm: string): string {
  const { h, m } = parse(hhmm);
  if (h === 12 && m === 0) return 'noon';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "18:00" + 60 -> "19:00". */
export function endTime(hhmm: string, durationMin: number): string {
  const { h, m } = parse(hhmm);
  const total = h * 60 + m + durationMin;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const byStart = (a: ClassEntry, b: ClassEntry) => a.data.start.localeCompare(b.data.start);

/* ---------- Grouping ---------- */

export interface DayClass {
  id: string;
  start: string;
  time: string;
  durationMin: number;
  program: ProgramEntry;
}

export interface DayClasses {
  key: DayKey;
  label: string;
  short: string;
  classes: DayClass[];
}

/** Every day Monday to Saturday with its classes in start order. Days with no classes have an empty list. */
export function groupByDay(schedule: ClassEntry[], programs: ProgramEntry[]): DayClasses[] {
  const programById = new Map(programs.map((p) => [p.id, p]));
  return DAYS.map((day) => ({
    key: day.key,
    label: day.label,
    short: day.short,
    classes: schedule
      .filter((c) => c.data.day === day.key)
      .sort(byStart)
      .flatMap((c) => {
        const program = programById.get(c.data.program.id);
        if (!program) return [];
        return [{ id: c.id, start: c.data.start, time: formatTime(c.data.start), durationMin: c.data.durationMin, program }];
      }),
  }));
}

export function classesForProgram(schedule: ClassEntry[], programId: string): ClassEntry[] {
  return schedule.filter((c) => c.data.program.id === programId).sort(byStart);
}

/** Days a program runs, in week order, without duplicates. */
export function daysForProgram(schedule: ClassEntry[], programId: string): DayKey[] {
  const seen = new Set<DayKey>();
  for (const c of classesForProgram(schedule, programId)) seen.add(c.data.day);
  return DAYS.map((d) => d.key).filter((k) => seen.has(k));
}

/** Runs of consecutive days, e.g. [mon,tue,wed,fri] -> [[mon,tue,wed],[fri]]. */
function runs(days: DayKey[]): DayKey[][] {
  const out: DayKey[][] = [];
  for (const day of days) {
    const last = out[out.length - 1];
    if (last && dayIndex(day) === dayIndex(last[last.length - 1]!) + 1) last.push(day);
    else out.push([day]);
  }
  return out;
}

/**
 * Short day label for copy: "Mon–Sat", "Mon–Thu", "Mon and Wed", "Mon, Wed, Fri".
 * A single run of three or more days becomes a range; otherwise days are listed.
 */
export function dayListLabel(days: DayKey[]): string {
  if (days.length === 0) return '';
  const r = runs(days);
  if (r.length === 1 && days.length >= 3) return `${dayShort(days[0]!)}–${dayShort(days[days.length - 1]!)}`;
  const shorts = days.map(dayShort);
  if (shorts.length === 2) return `${shorts[0]} and ${shorts[1]}`;
  return shorts.join(', ');
}

export interface TimeRow {
  /** "Mon–Thu" or "Mon" */
  days: string;
  /** "12:00 PM · 7:00 PM" */
  times: string;
}

/**
 * Day/time rows for a program, as on the programs page. Consecutive days with
 * identical times collapse into one row when the run is three days or longer
 * ("Mon–Thu · 5:00 PM"); everything else gets a row per day.
 */
export function timeRows(schedule: ClassEntry[], programId: string): TimeRow[] {
  return rowsFor(classesForProgram(schedule, programId));
}

function rowsFor(classes: ClassEntry[]): TimeRow[] {
  const timesByDay = new Map<DayKey, string[]>();
  for (const c of classes) {
    const list = timesByDay.get(c.data.day) ?? [];
    list.push(c.data.start);
    timesByDay.set(c.data.day, list);
  }
  const days = DAYS.map((d) => d.key).filter((k) => timesByDay.has(k));
  const key = (d: DayKey) => (timesByDay.get(d) ?? []).join(',');

  const rows: TimeRow[] = [];
  let i = 0;
  while (i < days.length) {
    let j = i;
    while (j + 1 < days.length && dayIndex(days[j + 1]!) === dayIndex(days[j]!) + 1 && key(days[j + 1]!) === key(days[i]!)) j++;
    const group = days.slice(i, j + 1);
    const times = (timesByDay.get(days[i]!) ?? []).map(formatTime).join(' · ');
    if (group.length >= 3) rows.push({ days: `${dayShort(group[0]!)}–${dayShort(group[group.length - 1]!)}`, times });
    else for (const d of group) rows.push({ days: dayShort(d), times: (timesByDay.get(d) ?? []).map(formatTime).join(' · ') });
    i = j + 1;
  }
  return rows;
}

export interface Teaching {
  /** Short program names in program order: ["Mixed Level", "MMA"] */
  programs: string[];
  /** Day/time rows across those classes: [{ days: "Tue–Thu", times: "12:00 PM" }] */
  rows: TimeRow[];
}

/** What a coach teaches, from the classes that name them as instructor. Null when none do. */
export function teachingFor(schedule: ClassEntry[], programs: ProgramEntry[], coachId: string): Teaching | null {
  const classes = schedule.filter((c) => c.data.instructor?.id === coachId).sort(byStart);
  if (classes.length === 0) return null;
  const ids = new Set(classes.map((c) => c.data.program.id));
  return {
    programs: programs.filter((p) => ids.has(p.id)).map((p) => p.data.shortName ?? p.data.name),
    rows: rowsFor(classes),
  };
}

/** Distinct start times across the week, in time order. */
function distinctStarts(schedule: ClassEntry[], programId: string): string[] {
  return [...new Set(classesForProgram(schedule, programId).map((c) => c.data.start))].sort();
}

/**
 * One-line summary for cards, always built from the schedule so it follows
 * Keystatic edits: "Mon and Wed · 6 PM".
 */
export function summaryFor(program: ProgramEntry, schedule: ClassEntry[]): string {
  const days = daysForProgram(schedule, program.id);
  if (days.length === 0) return 'Times to be announced';
  const starts = distinctStarts(schedule, program.id).map(shortTime);
  const times = starts.length <= 2 ? starts.join(' and ') : starts.join(', ');
  return `${dayListLabel(days)} · ${times}`;
}

/** Schedule entries sorted by day then start, for lists and JSON-LD. */
export function sortSchedule(schedule: ClassEntry[]): ClassEntry[] {
  return [...schedule].sort((a, b) => dayIndex(a.data.day) - dayIndex(b.data.day) || byStart(a, b));
}
