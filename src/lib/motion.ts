/**
 * All site motion. Initialised once from Base.astro; components only carry
 * data-motion="…" hooks.
 *
 * Rules (CLAUDE.md, Motion):
 * - Everything runs inside gsap.matchMedia(). Under prefers-reduced-motion
 *   nothing is registered, so nothing animates and every element keeps its
 *   CSS state.
 * - Starting states are set here, never in CSS, so the page is complete with
 *   JavaScript off.
 * - Eases: power3.out for entrances, expo.out for the hero, power2.inOut for
 *   movement that stops. Durations: 0.3s UI, 0.6s reveals, 0.9–1.1s hero.
 * - Only transform, opacity and clip-path animate. The one exception is the
 *   schedule filter, whose rows have to collapse (height) for the list to close up.
 *
 * Hooks:
 *   hero-photo   settles from a slight zoom      hero-title  SplitText lines rise from a mask
 *   hero-cta     fades up after the headline     title       page titles: same line reveal
 *   photo-wipe   clip-path wipe on scroll        reveal      fade + rise, staggered, once
 *   marquee      infinite program-name loop      magnetic    primary buttons follow the pointer
 *   coach-card   rise in one by one              belt        belt stripe "ties on" (scaleX)
 *   tilt         3D tilt toward the pointer on desktop, or with the phone's own tilt on touch
 *                screens; the [data-tilt-photo] image drifts the other way
 *   menu / menu-link   mobile menu from the top, links staggered
 *   schedule rows      fade and collapse on filter (via the schedule:filter event)
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { MenuCloseDetail } from '@/scripts/mobile-menu';
import type { ScheduleFilterDetail } from '@/scripts/schedule-filter';

const MOTION_OK = '(prefers-reduced-motion: no-preference)';
const FINE_POINTER = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 768px)';
const TOUCH = '(prefers-reduced-motion: no-preference) and (hover: none) and (pointer: coarse)';

const UI = 0.3;
const REVEAL = 0.6;
const HERO = 1;
/**
 * ScrollTrigger start for scroll reveals: the element's top at 80% of the
 * viewport, capped just below the maximum scroll so elements near the page end
 * still fire. (ScrollTrigger's own clamp() never fires at scroll 0.)
 */
const START = (self: ScrollTrigger): number => {
  const el = self.trigger as Element;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.min(top - window.innerHeight * 0.8, ScrollTrigger.maxScroll(window) - 1);
};

const all = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

let started = false;

export function initMotion(): void {
  if (started) return;
  started = true;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, () => {
    hero();
    titles();
    photoWipes();
    reveals();
    coachCards();
    marquees();
    const cleanups = [mobileMenu(), scheduleFilter()];
    return () => cleanups.forEach((fn) => fn());
  });

  mm.add(FINE_POINTER, () => {
    const cleanups = [magnetic(), cardTilt()];
    return () => cleanups.forEach((fn) => fn());
  });

  mm.add(TOUCH, () => phoneTilt());
}

/* ---------- Line reveals (SplitText) ---------- */

/**
 * Splits a heading into masked lines and slides each line up. autoSplit
 * re-splits when the web fonts finish loading or the width changes; returning
 * the tween lets SplitText carry its progress over to the new lines.
 */
function splitLines(el: HTMLElement, { delay = 0, onScroll = false } = {}): void {
  // A re-split builds a new tween, so the scroll trigger lives outside it and just plays whichever is current.
  let entered = !onScroll;
  let tween: gsap.core.Tween | undefined;

  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    // Screen readers read the line wrappers as they are; "auto" would build an
    // aria-label from textContent and run "No-Gi" and "jiu jitsu" together.
    aria: 'none',
    autoSplit: true,
    onSplit: (self: SplitText) => {
      tween = gsap.from(self.lines, { yPercent: 110, duration: HERO, ease: 'expo.out', stagger: 0.08, delay, paused: !entered });
      return tween;
    },
  });

  if (onScroll) {
    ScrollTrigger.create({
      trigger: el,
      start: START,
      once: true,
      onEnter: () => {
        entered = true;
        tween?.play();
      },
    });
  }
}

function hero(): void {
  const photo = document.querySelector<HTMLElement>('[data-motion="hero-photo"]');
  // The hero photo is the page's largest paint (LCP), so it is never clipped or
  // faded: it paints at once and settles from a slight zoom. The clip-path wipe
  // is for photos further down.
  const img = photo?.querySelector('img');
  if (img) gsap.from(img, { scale: 1.12, duration: 1.1, ease: 'expo.out', clearProps: 'transform' });

  for (const title of all('[data-motion="hero-title"]')) splitLines(title, { delay: 0.15 });

  const ctas = all('[data-motion="hero-cta"]');
  if (ctas.length) {
    gsap.from(ctas, { autoAlpha: 0, y: 16, duration: REVEAL, ease: 'power3.out', delay: 0.55, clearProps: 'transform' });
  }
}

function titles(): void {
  for (const title of all('[data-motion="title"]')) {
    // Program-page titles sit in the hero and play on load; page titles further down wait for the scroll.
    const inHero = title.closest('section')?.querySelector('[data-motion="hero-photo"]');
    splitLines(title, inHero ? { delay: 0.15 } : { onScroll: true });
  }
}

/* ---------- Photos ---------- */

function photoWipes(): void {
  for (const frame of all('[data-motion="photo-wipe"]')) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: START, once: true } });
    tl.fromTo(
      frame,
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.out', clearProps: 'clipPath' },
    );
    const img = frame.querySelector('img');
    if (img) tl.from(img, { scale: 1.1, duration: 0.9, ease: 'power3.out', clearProps: 'transform' }, 0);
  }
}

/* ---------- Cards, rows, steps: fade and rise with a stagger ---------- */

function reveals(): void {
  const items = all('[data-motion="reveal"]');
  if (!items.length) return;
  gsap.set(items, { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch(items, {
    start: START,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: REVEAL,
        ease: 'power3.out',
        stagger: 0.08,
        // "auto" only takes over y and opacity, so a tilted card keeps its rotation tweens.
        overwrite: 'auto',
        clearProps: 'transform',
      }),
  });
}

/* ---------- Coach cards: rise in one by one, then the belt ties on ---------- */

function coachCards(): void {
  const cards = all('[data-motion="coach-card"]');
  const belts = all('[data-motion="belt"]');
  if (belts.length) gsap.set(belts, { scaleX: 0, transformOrigin: '0% 50%' });

  const tieOn = (belt: Element) => gsap.to(belt, { scaleX: 1, duration: REVEAL, ease: 'power3.out' });

  if (cards.length) {
    gsap.set(cards, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(cards, {
      start: START,
      once: true,
      onEnter: (batch) =>
        batch.forEach((card, i) => {
          const tl = gsap.timeline({ delay: i * 0.1 });
          tl.to(card, { autoAlpha: 1, y: 0, duration: REVEAL, ease: 'power3.out' });
          const belt = card.querySelector('[data-motion="belt"]');
          if (belt) tl.add(tieOn(belt), 0.3);
        }),
    });
  }

  // A belt stripe used outside a coach card ties on by itself.
  for (const belt of belts.filter((b) => !b.closest('[data-motion="coach-card"]'))) {
    ScrollTrigger.create({ trigger: belt, start: START, once: true, onEnter: () => tieOn(belt) });
  }
}

/** Desktop only (coach and program cards): the card tilts toward the cursor, the photo drifts the other way. */
function cardTilt(): () => void {
  const MAX_TILT = 8;
  const MAX_DRIFT = 12;
  const removers: Array<() => void> = [];

  for (const card of all('[data-tilt]')) {
    const photo = card.querySelector<HTMLElement>('[data-tilt-photo] img');

    const quick = { duration: 0.4, ease: 'power3.out' };
    const rotX = gsap.quickTo(card, 'rotationX', quick);
    const rotY = gsap.quickTo(card, 'rotationY', quick);
    const driftX = photo ? gsap.quickTo(photo, 'x', quick) : null;
    const driftY = photo ? gsap.quickTo(photo, 'y', quick) : null;
    const springs = [rotX, rotY, driftX, driftY].filter((fn): fn is gsap.QuickToFunc => fn !== null);
    const setDuration = (seconds: number) => springs.forEach((fn) => fn.tween.duration(seconds));

    let rect = card.getBoundingClientRect();

    const enter = () => {
      rect = card.getBoundingClientRect();
      setDuration(0.4);
      // Scale the photo just enough that a 12px drift never shows its edge. The text is never scaled.
      const shortSide = Math.min(rect.width, rect.height);
      if (photo) gsap.to(photo, { scale: 1 + (MAX_DRIFT * 2 + 4) / shortSide, duration: 0.4, ease: 'power3.out' });
    };
    const move = (event: PointerEvent) => {
      const nx = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width) * 2 - 1);
      const ny = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
      rotY(nx * MAX_TILT);
      rotX(-ny * MAX_TILT);
      driftX?.(-nx * MAX_DRIFT);
      driftY?.(-ny * MAX_DRIFT);
    };
    const leave = () => {
      setDuration(0.6);
      springs.forEach((fn) => fn(0));
      if (photo) gsap.to(photo, { scale: 1, duration: 0.6, ease: 'power3.out' });
    };

    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    removers.push(() => {
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
    });
  }

  return () => removers.forEach((fn) => fn());
}

/**
 * Touch screens: the cards on screen lean with the phone (deviceorientation).
 * Browsers only send orientation on HTTPS. iOS also needs permission, which it
 * only lets a page ask for during a tap, so the prompt waits for the visitor's
 * first tap on a page with tilt cards. A "denied" answer is remembered and
 * never asked again.
 */
function phoneTilt(): () => void {
  const cards = all('[data-tilt]');
  if (!cards.length || !('DeviceOrientationEvent' in window)) return () => {};

  const MAX_TILT = 6;
  const MAX_DRIFT = 10;
  /** Degrees of phone tilt away from the resting angle that give the full card tilt. */
  const RANGE = 20;
  /** How quickly the resting angle follows the way the phone is held (per event). */
  const RECENTER = 0.02;
  const ASKED_KEY = 'rg-motion-permission';

  const quick = { duration: 0.4, ease: 'power3.out' };
  const springs = cards.map((card) => {
    const photo = card.querySelector<HTMLElement>('[data-tilt-photo] img');
    return {
      card,
      photo,
      rotX: gsap.quickTo(card, 'rotationX', quick),
      rotY: gsap.quickTo(card, 'rotationY', quick),
      driftX: photo ? gsap.quickTo(photo, 'x', quick) : null,
      driftY: photo ? gsap.quickTo(photo, 'y', quick) : null,
    };
  });

  // Only cards on screen follow the phone.
  const visible = new Set<Element>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
  });
  cards.forEach((card) => observer.observe(card));

  let rest: { x: number; y: number } | null = null;
  let running = false;

  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return;
    // Map the phone's axes onto the screen's, so landscape tilts the right way.
    const angle = screen.orientation?.angle ?? 0;
    const [x, y] =
      angle === 90 ? [event.beta, -event.gamma]
      : angle === 270 || angle === -90 ? [-event.beta, event.gamma]
      : angle === 180 ? [-event.gamma, -event.beta]
      : [event.gamma, event.beta];

    if (!rest) {
      rest = { x, y };
      // Scale each photo just enough that the drift never shows its edge. The text is never scaled.
      for (const { card, photo } of springs) {
        const { width, height } = card.getBoundingClientRect();
        if (photo) gsap.to(photo, { scale: 1 + (MAX_DRIFT * 2 + 4) / Math.min(width, height), duration: REVEAL, ease: 'power3.out' });
      }
    }
    rest.x += (x - rest.x) * RECENTER;
    rest.y += (y - rest.y) * RECENTER;

    const nx = gsap.utils.clamp(-1, 1, (x - rest.x) / RANGE);
    const ny = gsap.utils.clamp(-1, 1, (y - rest.y) / RANGE);
    for (const s of springs) {
      if (!visible.has(s.card)) continue;
      // Each card gets its own vanishing point (a tall stacked grid would skew cards far from its centre).
      // Set here rather than once, because the reveal's clearProps wipes it.
      if (!gsap.getProperty(s.card, 'transformPerspective')) gsap.set(s.card, { transformPerspective: 900 });
      s.rotY(nx * MAX_TILT);
      s.rotX(-ny * MAX_TILT);
      s.driftX?.(-nx * MAX_DRIFT);
      s.driftY?.(-ny * MAX_DRIFT);
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    window.addEventListener('deviceorientation', onOrientation);
  };

  const remember = (state: string) => {
    try {
      localStorage.setItem(ASKED_KEY, state);
    } catch {
      /* storage blocked: we may ask again next visit */
    }
  };
  const recalled = (): string | null => {
    try {
      return localStorage.getItem(ASKED_KEY);
    } catch {
      return null;
    }
  };

  type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
  const requestPermission = (DeviceOrientationEvent as IOSOrientation).requestPermission;

  const onTap = () => {
    requestPermission!.call(DeviceOrientationEvent).then(
      (state) => {
        stopAsking();
        remember(state);
        if (state === 'granted') start();
      },
      // Not counted as a tap (e.g. the end of a scroll): wait for the next one.
      () => {},
    );
  };
  const stopAsking = () => {
    document.removeEventListener('click', onTap);
    document.removeEventListener('touchend', onTap);
  };

  // Listen straight away: Android sends orientation without asking, and on iOS an earlier "granted"
  // may still hold. Where a permission API exists, the first tap confirms it (or shows the prompt).
  start();
  if (requestPermission && recalled() !== 'denied') {
    document.addEventListener('click', onTap);
    document.addEventListener('touchend', onTap);
  }

  return () => {
    stopAsking();
    window.removeEventListener('deviceorientation', onOrientation);
    observer.disconnect();
    gsap.set(cards, { clearProps: 'transform' });
    for (const { photo } of springs) if (photo) gsap.set(photo, { clearProps: 'transform' });
  };
}

/* ---------- Program-name marquee ---------- */

function marquees(): void {
  for (const strip of all('[data-motion="marquee"]')) {
    const track = strip.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track) continue;
    // The track holds the list twice, so sliding it by half loops seamlessly.
    const pxPerSecond = 60;
    const loop = gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      repeat: -1,
      duration: track.scrollWidth / 2 / pxPerSecond,
      paused: true,
    });
    // Only run while the strip is on screen.
    ScrollTrigger.create({
      trigger: strip,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    });
  }
}

/* ---------- Magnetic primary CTA (desktop pointers) ---------- */

function magnetic(): () => void {
  const removers: Array<() => void> = [];
  const STRENGTH = 0.3;
  const MAX = 10;

  for (const button of all('[data-motion="magnetic"]')) {
    const xTo = gsap.quickTo(button, 'x', { duration: UI, ease: 'power3.out' });
    const yTo = gsap.quickTo(button, 'y', { duration: UI, ease: 'power3.out' });
    let rect = button.getBoundingClientRect();

    const enter = () => {
      rect = button.getBoundingClientRect();
    };
    const move = (event: PointerEvent) => {
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      xTo(gsap.utils.clamp(-MAX, MAX, dx * STRENGTH));
      yTo(gsap.utils.clamp(-MAX, MAX, dy * STRENGTH));
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };

    button.addEventListener('pointerenter', enter);
    button.addEventListener('pointermove', move);
    button.addEventListener('pointerleave', leave);
    removers.push(() => {
      button.removeEventListener('pointerenter', enter);
      button.removeEventListener('pointermove', move);
      button.removeEventListener('pointerleave', leave);
      gsap.set(button, { clearProps: 'transform' });
    });
  }

  return () => removers.forEach((fn) => fn());
}

/* ---------- Mobile menu ---------- */

function mobileMenu(): () => void {
  const menu = document.querySelector<HTMLElement>('[data-motion="menu"]');
  if (!menu) return () => {};
  const links = all('[data-motion="menu-link"]', menu);

  const onOpen = () => {
    gsap.killTweensOf([menu, ...links]);
    gsap.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: UI, ease: 'power3.out', clearProps: 'transform' });
    gsap.fromTo(
      links,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: UI, ease: 'power3.out', stagger: 0.05, delay: 0.1, clearProps: 'transform' },
    );
  };

  const onClose = (event: Event) => {
    const { detail } = event as CustomEvent<MenuCloseDetail>;
    event.preventDefault();
    gsap.killTweensOf([menu, ...links]);
    gsap.set(links, { autoAlpha: 1, clearProps: 'transform' });
    gsap.to(menu, {
      yPercent: -100,
      duration: UI,
      ease: 'power2.inOut',
      onComplete: () => {
        detail.done();
        gsap.set(menu, { clearProps: 'transform' });
      },
    });
  };

  document.addEventListener('menu:open', onOpen);
  document.addEventListener('menu:close', onClose);
  return () => {
    document.removeEventListener('menu:open', onOpen);
    document.removeEventListener('menu:close', onClose);
    gsap.set([menu, ...links], { clearProps: 'all' });
  };
}

/* ---------- Schedule filter: rows fade and collapse ---------- */

function scheduleFilter(): () => void {
  let running: gsap.core.Timeline | null = null;

  const onFilter = (event: Event) => {
    const { detail } = event as CustomEvent<ScheduleFilterDetail>;
    event.preventDefault();
    // A quick second click finishes the previous transition first.
    running?.progress(1);

    const { show, hide } = detail;
    const tl = gsap.timeline({
      defaults: { duration: UI, ease: 'power2.inOut' },
      onComplete: () => {
        detail.commit();
        gsap.set([...show, ...hide], { clearProps: 'all' });
        running = null;
      },
    });
    running = tl;

    if (hide.length) {
      tl.set(hide, { overflow: 'hidden' }, 0);
      tl.to(hide, { autoAlpha: 0, height: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0 }, 0);
    }
    if (show.length) {
      for (const row of show) row.hidden = false;
      tl.set(show, { overflow: 'hidden' }, 0);
      tl.from(show, { autoAlpha: 0, height: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0 }, 0);
    }
  };

  document.addEventListener('schedule:filter', onFilter);
  return () => {
    running?.progress(1);
    document.removeEventListener('schedule:filter', onFilter);
  };
}
