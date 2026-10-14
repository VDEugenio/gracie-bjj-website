/**
 * Schedule filter. Plain TypeScript: toggles aria-pressed on the chips and the
 * hidden attribute on class rows.
 *
 * Before changing anything it dispatches a cancelable "schedule:filter" event
 * on document with the rows about to appear and disappear. motion.ts cancels
 * it, fades and collapses the rows, then calls `commit()`. With reduced motion
 * (or no motion script) nobody cancels it and the rows switch instantly.
 */
export interface ScheduleFilterDetail {
  key: string;
  show: HTMLElement[];
  hide: HTMLElement[];
  /** Writes the final hidden state of every row and empty-day note. */
  commit: () => void;
}

const root = document.querySelector<HTMLElement>('[data-schedule-filter]');

if (root) {
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-class-row]'));
  const days = Array.from(document.querySelectorAll<HTMLElement>('[data-schedule-day]'));

  const matches = (row: HTMLElement, key: string): boolean => {
    const audience = row.dataset.audience ?? 'all';
    switch (key) {
      case 'all':
        return true;
      case 'adults':
        return audience === 'adults' || audience === 'all';
      case 'kids':
        return audience === 'kids' || audience === 'all';
      case 'beginners':
        return row.dataset.startHere === 'true';
      default:
        return key.startsWith('program:') && row.dataset.program === key.slice('program:'.length);
    }
  };

  const commit = (key: string) => {
    for (const row of rows) row.hidden = !matches(row, key);
    for (const day of days) {
      const total = day.querySelectorAll('[data-class-row]').length;
      const visible = day.querySelectorAll('[data-class-row]:not([hidden])').length;
      const note = day.querySelector<HTMLElement>('[data-empty-note]');
      if (note) note.hidden = total === 0 || visible > 0;
    }
  };

  const apply = (key: string) => {
    const detail: ScheduleFilterDetail = {
      key,
      show: rows.filter((row) => row.hidden && matches(row, key)),
      hide: rows.filter((row) => !row.hidden && !matches(row, key)),
      commit: () => commit(key),
    };
    const event = new CustomEvent<ScheduleFilterDetail>('schedule:filter', { detail, cancelable: true });
    if (document.dispatchEvent(event)) detail.commit();
  };

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      for (const other of chips) other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
      apply(chip.dataset.filter ?? 'all');
    });
  }
}
