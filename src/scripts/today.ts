/**
 * Marks "today" client-side, because the site is static and cannot know the
 * day at build time. Uses the gym's time zone, not the visitor's.
 *
 * - [data-schedule-day][data-day]  gets data-today (signal top edge, "Today" label);
 *                                 inside [data-today-first] today's card also moves first on phones.
 * - [data-today-label]             "Today · Monday, Oct 12"
 * - [data-today-panel]             home page: shows the panel for today, hides the rest
 * - [data-today-eyebrow]           home page: "This week at the gym" becomes "Today at the gym"
 * - [data-today-date]              "Oct 12 · " prefix in the home card heading
 *
 * Without JavaScript nothing is marked and the home page shows Monday under
 * "This week at the gym".
 */
const TIME_ZONE = 'America/New_York';
const now = new Date();

const weekday = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'long' }).format(now).toLowerCase();
const shortDate = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: 'numeric' }).format(now);
const longDate = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'long', month: 'short', day: 'numeric' }).format(now);

// Schedule cards
let marked = false;
for (const card of document.querySelectorAll<HTMLElement>('[data-schedule-day][data-day]')) {
  const isToday = card.dataset.day === weekday;
  card.toggleAttribute('data-today', isToday);
  if (card.closest('[data-today-first]')) card.classList.toggle('max-md:order-first', isToday);
  if (isToday) marked = true;
}

// "Today · Monday, Oct 12" on the schedule page
for (const label of document.querySelectorAll<HTMLElement>('[data-today-label]')) {
  label.textContent = marked ? `Today · ${longDate}` : `Today · ${longDate} · Closed`;
  label.hidden = false;
}

// Home page panels (one per day, plus "sunday")
const panels = document.querySelectorAll<HTMLElement>('[data-today-panel]');
if (panels.length > 0) {
  const wanted = Array.from(panels).some((p) => p.dataset.todayPanel === weekday) ? weekday : 'monday';
  for (const panel of panels) panel.hidden = panel.dataset.todayPanel !== wanted;
  for (const eyebrow of document.querySelectorAll<HTMLElement>('[data-today-eyebrow]')) eyebrow.textContent = 'Today at the gym';
  for (const date of document.querySelectorAll<HTMLElement>('[data-today-date]')) {
    const inToday = date.closest('[data-today-panel]')?.getAttribute('data-today-panel') === wanted;
    date.textContent = inToday && wanted === weekday ? `${shortDate} · ` : '';
  }
}
