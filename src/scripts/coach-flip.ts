/**
 * Coach cards flip to show the bio. Plain TypeScript: turns the flip on
 * (data-flip-ready), then a click or tap anywhere on a card, or Enter/Space on
 * its "Read bio" / "Back" button, toggles data-flipped and makes the hidden
 * face inert so keyboards and screen readers only reach the side on show.
 *
 * Every toggle dispatches a "coach:flip" event on document; motion.ts turns the
 * card. With reduced motion (or no motion script) the CSS swaps the faces at once.
 */
export interface CoachFlipDetail {
  card: HTMLElement;
  inner: HTMLElement;
  flipped: boolean;
}

for (const card of document.querySelectorAll<HTMLElement>('[data-coach-flip]')) {
  const inner = card.querySelector<HTMLElement>('[data-flip-inner]');
  const front = card.querySelector<HTMLElement>('[data-flip-face="front"]');
  const back = card.querySelector<HTMLElement>('[data-flip-face="back"]');
  if (!inner || !front || !back) continue;
  const [toBack, toFront] = [front, back].map((face) => face.querySelector<HTMLButtonElement>('[data-flip-toggle]'));

  const show = (flipped: boolean) => {
    card.toggleAttribute('data-flipped', flipped);
    front.inert = flipped;
    back.inert = !flipped;
    toBack?.setAttribute('aria-expanded', String(flipped));
  };

  card.setAttribute('data-flip-ready', '');
  show(false);

  card.addEventListener('click', (event) => {
    // Let a selection inside the bio stand instead of turning the card.
    if (window.getSelection()?.toString()) return;
    const flipped = !card.hasAttribute('data-flipped');
    // Keep keyboard focus on the card: hand it to the button on the side coming up.
    const hadFocus = card.contains(document.activeElement) && (event.target as Element).closest('[data-flip-toggle]');
    show(flipped);
    if (hadFocus) (flipped ? toFront : toBack)?.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent<CoachFlipDetail>('coach:flip', { detail: { card, inner, flipped } }));
  });
}
