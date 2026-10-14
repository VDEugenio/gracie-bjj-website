/**
 * Mobile menu toggle. Plain TypeScript, no framework.
 * Opens on the header button, closes on the X, Escape, any link, or when the
 * viewport grows past the phone breakpoint.
 *
 * Dispatches "menu:open" after the menu is shown, and a cancelable
 * "menu:close" before it is hidden: motion.ts cancels the close, slides the
 * menu away and then calls `detail.done()`. Without motion it hides at once.
 */
export interface MenuCloseDetail {
  done: () => void;
}

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
    if (menu.hidden || toggle.getAttribute('aria-expanded') === 'false') return;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
    if (returnFocus) toggle.focus();
    const detail: MenuCloseDetail = {
      done: () => {
        if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true;
      },
    };
    const event = new CustomEvent<MenuCloseDetail>('menu:close', { detail, cancelable: true });
    if (document.dispatchEvent(event)) detail.done();
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
