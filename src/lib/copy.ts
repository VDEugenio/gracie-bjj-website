/**
 * Derived sentences for pages: "Five classes today. First time? Come to
 * Fundamentals at 6 PM." and the "Your first class" steps. Everything comes
 * from the schedule so it never goes stale when Mike edits a class.
 */
import type { ClassEntry, Program, Settings } from './content';
import { classesForProgram, dayLabel, daysForProgram, shortTime, type DayClasses, type DayKey } from './schedule';

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/**
 * The home page's line under the day name. Picks the beginner class to point
 * newcomers at: a "Start here" program, preferring one tagged for beginners.
 */
export function todaySentence(day: DayClasses): string {
  const count = day.classes.length;
  if (count === 0) return 'No classes today.';
  const lead = `${countWord(count)} ${count === 1 ? 'class' : 'classes'} today.`;
  const starters = day.classes.filter((c) => c.program.data.startHere);
  const pick =
    starters.find((c) => c.program.data.tags.some((t) => /beginner/i.test(t))) ?? starters[0];
  if (!pick) return lead;
  return `${lead} First time? Come to ${pick.program.data.name} at ${shortTime(pick.start)}.`;
}

/** "Monday or Wednesday", "Monday, Wednesday or Friday", "Monday to Saturday". */
export function dayLongList(days: DayKey[]): string {
  const labels = days.map(dayLabel);
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  // consecutive run of three or more reads as a range
  const ORDER: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const idx = days.map((d) => ORDER.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1]! + 1);
  if (consecutive) return `${labels[0]} to ${labels[labels.length - 1]}`;
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}

export interface Step {
  title: string;
  note?: string;
}

/** The three "Your first class" steps on a program page. */
export function firstClassSteps(program: Program, schedule: ClassEntry[], settings: Settings): Step[] {
  const classes = classesForProgram(schedule, program.id);
  const starts = [...new Set(classes.map((c) => c.data.start))];
  const days = daysForProgram(schedule, program.id);
  const where = `${dayLongList(days)}, ${settings.address.street}.`;
  const third: Step =
    starts.length === 1 && starts[0]
      ? { title: `Come to a ${shortTime(starts[0])} class`, note: where }
      : { title: `Come to any ${program.data.name} class`, note: where };
  return [
    { title: 'Start your free week online', note: 'It takes a couple of minutes through Gymdesk.' },
    { title: 'Wear a rash guard and shorts', note: 'No gi needed. We train No-Gi only.' },
    third,
  ];
}

/** "60 min", or "60–90 min" when classes of this program differ in length. */
export function lengthFact(program: Program, schedule: ClassEntry[]): string {
  const lengths = [...new Set(classesForProgram(schedule, program.id).map((c) => c.data.durationMin))].sort((a, b) => a - b);
  if (lengths.length === 0) return '60 min';
  if (lengths.length === 1) return `${lengths[0]} min`;
  return `${lengths[0]}–${lengths[lengths.length - 1]} min`;
}

export const AUDIENCE_LABEL: Record<Program['data']['audience'], string> = {
  adults: 'Adults',
  kids: 'Kids',
  all: 'Adults and kids',
};
