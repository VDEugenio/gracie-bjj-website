/**
 * Mobile menu toggle. Plain TypeScript, no framework.
 * Opens on the header button, closes on the X, Escape, any link, or when the
 * viewport grows past the phone breakpoint. Dispatches "menu:open" and
 * "menu:close" on document so motion.ts (phase 5) can animate it.
 */
const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');

if (menu && toggle) {
  const closeButton = menu.querySelector<HTMLButtonElement>('[data-menu-close]');
  const focusable = () =>
    Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((el) => el.offsetParent !== null);

  const open = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
    closeButton?.focus();
    document.dispatchEvent(new CustomEvent('menu:open'));
  };

  const close = (returnFocus = true) => {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
    if (returnFocus) toggle.focus();
    document.dispatchEvent(new CustomEvent('menu:close'));
  };

  toggle.addEventListener('click', open);
  closeButton?.addEventListener('click', () => close());

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  menu.querySelectorAll('a[href]').forEach((link) => link.addEventListener('click', () => close(false)));

  const desktop = window.matchMedia('(min-width: 768px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) close(false);
  });
}
