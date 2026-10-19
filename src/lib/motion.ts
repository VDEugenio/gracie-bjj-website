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
 *   photo-wipe   clip-path wipe on scroll        reveal      fade + rise, staggered
 *   marquee      infinite program-name loop      magnetic    primary buttons follow the pointer
 *   coach-card   rise in one by one              belt        belt stripe "ties on" (scaleX)
 *   data-pulse   the hero's free-week button sends out a signal ring every few seconds
 *   tilt         desktop cards tilt toward the pointer; the [data-tilt-photo] image drifts the other way
 *   photo-tilt   photos lean inside their frames toward the pointer (desktop); the homepage
 *                hero also leans with the phone (touch)
 *   coach flip   coach cards turn over to the bio (via the coach:flip event)
 *   menu / menu-link   mobile menu from the top, links staggered
 *   schedule rows      fade and collapse on filter (via the schedule:filter event)
 *   disclosure         a dropdown's body fades and rises in as it opens
 *
 * Every entrance replays: once an element has fully left the screen it resets
 * (unseen), and it plays again when it comes back, from below or above. See
 * replayOnScroll().
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { CoachFlipDetail } from '@/scripts/coach-flip';
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

/**
 * Plays an entrance whenever `el` comes on screen, and resets it once it has
 * fully left the viewport, so the reset is never seen. Scrolling down it plays
 * at START (top at 80%); scrolling back up it plays as soon as its bottom edge
 * comes back in. `shown` is true for entrances that already play on load (the hero).
 */
function replayOnScroll(el: Element, { play, reset, shown = false }: { play: () => void; reset: () => void; shown?: boolean }): void {
  const enter = () => {
    if (shown) return;
    shown = true;
    play();
  };
  const leave = () => {
    if (!shown) return;
    shown = false;
    reset();
  };
  ScrollTrigger.create({ trigger: el, start: START, onEnter: enter });
  ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onEnterBack: enter, onLeave: leave, onLeaveBack: leave });
}

/**
 * Collects the elements that come on screen in the same frame, so they play as
 * one group staggered top to bottom. An element reset before the frame (a fast
 * scroll straight past it) is dropped from the group, so it stays ready to play.
 */
function grouped(play: (group: HTMLElement[]) => void): { add: (el: HTMLElement) => void; drop: (el: HTMLElement) => void } {
  const group = new Set<HTMLElement>();
  return {
    add(el) {
      group.add(el);
      if (group.size > 1) return;
      requestAnimationFrame(() => {
        const ready = [...group].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        group.clear();
        if (ready.length) play(ready);
      });
    },
    drop: (el) => group.delete(el),
  };
}

/**
 * The entrance playing (or waiting on a delay) for each element, so a reset can
 * cancel it outright, even one that hasn't started yet.
 */
const entrances = new WeakMap<Element, gsap.core.Animation>();
const startEntrance = (el: Element, animation: gsap.core.Animation): void => {
  entrances.get(el)?.kill();
  entrances.set(el, animation);
};
const stopEntrance = (el: Element): void => {
  entrances.get(el)?.kill();
  entrances.delete(el);
};

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
    const cleanups = [ctaPulse(), coachFlips(), mobileMenu(), scheduleFilter(), disclosures()];
    return () => cleanups.forEach((fn) => fn());
  });

  mm.add(FINE_POINTER, () => {
    const cleanups = [magnetic(), cardTilt(), photoTiltPointer()];
    return () => cleanups.forEach((fn) => fn());
  });

  mm.add(TOUCH, () => heroTiltPhone());
}

/* ---------- Line reveals (SplitText) ---------- */

/**
 * Splits a heading into masked lines and slides each line up, every time the
 * heading comes on screen. autoSplit re-splits when the web fonts finish
 * loading or the width changes; returning the tween lets SplitText carry its
 * progress over to the new lines. `onLoad` headings (in a hero) play straight away.
 */
function splitLines(el: HTMLElement, { delay = 0, onLoad = false } = {}): void {
  // A re-split builds a new tween, so the scroll triggers live outside it and drive whichever is current.
  let onScreen = onLoad;
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
      tween = gsap.from(self.lines, { yPercent: 110, duration: HERO, ease: 'expo.out', stagger: 0.08, delay, paused: !onScreen });
      return tween;
    },
  });

  replayOnScroll(el, {
    shown: onLoad,
    play: () => {
      onScreen = true;
      tween?.restart(true);
    },
    reset: () => {
      onScreen = false;
      tween?.pause(0);
    },
  });
}

function hero(): void {
  const photo = document.querySelector<HTMLElement>('[data-motion="hero-photo"]');
  // The hero photo is the page's largest paint (LCP), so it is never clipped or
  // faded: it paints at once and settles from a slight zoom. The clip-path wipe
  // is for photos further down.
  const img = photo?.querySelector('img');
  if (photo && img) {
    const settle = gsap.from(img, { scale: 1.12, duration: 1.1, ease: 'expo.out' });
    replayOnScroll(photo, { shown: true, play: () => settle.restart(), reset: () => settle.pause(0) });
  }

  for (const title of all('[data-motion="hero-title"]')) splitLines(title, { delay: 0.15, onLoad: true });

  for (const cta of all('[data-motion="hero-cta"]')) {
    const rise = gsap.from(cta, { autoAlpha: 0, y: 16, duration: REVEAL, ease: 'power3.out', delay: 0.55 });
    replayOnScroll(cta, { shown: true, play: () => rise.restart(true), reset: () => rise.pause(0) });
  }
}

function titles(): void {
  for (const title of all('[data-motion="title"]')) {
    // Program-page titles sit in the hero and play on load; page titles further down wait for the scroll.
    const inHero = title.closest('section')?.querySelector('[data-motion="hero-photo"]');
    splitLines(title, inHero ? { delay: 0.15, onLoad: true } : {});
  }
}

/* ---------- Photos ---------- */

function photoWipes(): void {
  for (const frame of all('[data-motion="photo-wipe"]')) {
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(frame, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.out' });
    const img = frame.querySelector('img');
    if (img) tl.from(img, { scale: 1.1, duration: 0.9, ease: 'power3.out' }, 0);
    replayOnScroll(frame, { play: () => tl.restart(), reset: () => tl.pause(0) });
  }
}

/* ---------- Cards, rows, steps: fade and rise with a stagger ---------- */

function reveals(): void {
  const items = all('[data-motion="reveal"]');
  if (!items.length) return;
  const hidden = { autoAlpha: 0, y: 32 };
  gsap.set(items, hidden);
  const play = grouped((group) =>
    group.forEach((item, i) =>
      startEntrance(
        item,
        // "auto" only takes over y and opacity, so a tilted card keeps its rotation tweens.
        gsap.to(item, { autoAlpha: 1, y: 0, duration: REVEAL, ease: 'power3.out', delay: i * 0.08, overwrite: 'auto' }),
      ),
    ),
  );
  for (const item of items) {
    replayOnScroll(item, {
      play: () => play.add(item),
      reset: () => {
        play.drop(item);
        stopEntrance(item);
        gsap.set(item, hidden);
      },
    });
  }
}

/* ---------- Coach cards: rise in one by one, then the belt ties on ---------- */

function coachCards(): void {
  const cards = all('[data-motion="coach-card"]');
  const belts = all('[data-motion="belt"]');
  const untied = { scaleX: 0, transformOrigin: '0% 50%' };
  if (belts.length) gsap.set(belts, untied);

  const tieOn = (belt: Element) => gsap.to(belt, { scaleX: 1, duration: REVEAL, ease: 'power3.out', overwrite: 'auto' });

  if (cards.length) {
    const hidden = { autoAlpha: 0, y: 40 };
    gsap.set(cards, hidden);
    const play = grouped((group) =>
      group.forEach((card, i) => {
        const tl = gsap.timeline({ delay: i * 0.1 });
        tl.to(card, { autoAlpha: 1, y: 0, duration: REVEAL, ease: 'power3.out', overwrite: 'auto' });
        const belt = card.querySelector('[data-motion="belt"]');
        if (belt) tl.add(tieOn(belt), 0.3);
        startEntrance(card, tl);
      }),
    );
    for (const card of cards) {
      const belt = card.querySelector('[data-motion="belt"]');
      replayOnScroll(card, {
        play: () => play.add(card),
        reset: () => {
          play.drop(card);
          stopEntrance(card);
          gsap.set(card, hidden);
          if (belt) gsap.set(belt, untied);
        },
      });
    }
  }

  // A belt stripe used outside a coach card ties on by itself.
  for (const belt of belts.filter((b) => !b.closest('[data-motion="coach-card"]'))) {
    replayOnScroll(belt, {
      play: () => startEntrance(belt, tieOn(belt)),
      reset: () => {
        stopEntrance(belt);
        gsap.set(belt, untied);
      },
    });
  }
}

/* ---------- Coach card flip ---------- */

/**
 * Turns a coach card over to its bio and back (src/scripts/coach-flip.ts sets
 * the state). The inline rotation takes over from the CSS one, so a turn
 * always starts from where the card is, even mid-turn.
 */
function coachFlips(): () => void {
  const inners = all('[data-coach-flip] [data-flip-inner]');
  if (!inners.length) return () => {};
  for (const inner of inners) gsap.set(inner, { rotationY: inner.closest('[data-flipped]') ? 180 : 0 });

  const onFlip = (event: Event) => {
    const { inner, flipped } = (event as CustomEvent<CoachFlipDetail>).detail;
    gsap.to(inner, { rotationY: flipped ? 180 : 0, duration: REVEAL, ease: 'power2.inOut', overwrite: 'auto' });
  };
  document.addEventListener('coach:flip', onFlip);
  return () => {
    document.removeEventListener('coach:flip', onFlip);
    gsap.killTweensOf(inners);
    gsap.set(inners, { clearProps: 'transform' });
  };
}

/* ---------- Hero free-week button: a signal ring every few seconds ---------- */

/**
 * The hero's primary button sends a 2px signal ring outward and fades it while
 * the arrow nudges right. It waits for the button to fade in, runs only while
 * the button is on screen, and stops for good once the visitor points at or
 * focuses the button (they have found it).
 */
function ctaPulse(): () => void {
  const removers: Array<() => void> = [];
  const GROW = 12;

  for (const button of all('[data-pulse]')) {
    const ring = button.querySelector<HTMLElement>('[data-pulse-ring]');
    if (!ring) continue;
    const arrow = button.querySelector<HTMLElement>('[data-pulse-arrow]');

    const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.8, delay: 1.2 });
    loop.fromTo(
      ring,
      { autoAlpha: 0.7, scaleX: 1, scaleY: 1 },
      {
        autoAlpha: 0,
        // The ring grows by the same few pixels on every side, whatever the button's shape.
        scaleX: () => 1 + (GROW * 2) / button.offsetWidth,
        scaleY: () => 1 + (GROW * 2) / button.offsetHeight,
        duration: 1.2,
        ease: 'power3.out',
      },
    );
    if (arrow) loop.to(arrow, { x: 4, duration: 0.3, ease: 'power2.inOut', yoyo: true, repeat: 1 }, 0);

    let found = false;
    const trigger = ScrollTrigger.create({
      trigger: button,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (found) return;
        if (self.isActive) loop.play();
        else loop.pause();
      },
    });
    const stop = () => {
      found = true;
      loop.pause();
      gsap.to(ring, { autoAlpha: 0, duration: UI, ease: 'power3.out' });
      if (arrow) gsap.to(arrow, { x: 0, duration: UI, ease: 'power3.out' });
    };
    button.addEventListener('pointerenter', stop, { once: true });
    button.addEventListener('focus', stop, { once: true });
    removers.push(() => {
      button.removeEventListener('pointerenter', stop);
      button.removeEventListener('focus', stop);
      trigger.kill();
      loop.kill();
      gsap.set(arrow ? [ring, arrow] : [ring], { clearProps: 'all' });
    });
  }

  return () => removers.forEach((fn) => fn());
}

/* ---------- Card tilt ---------- */

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

/* ---------- Photo tilt ---------- */

const PHOTO_TILT = 4;
const PHOTO_DRIFT = 10;
const PHOTO_PERSPECTIVE = 1000;

interface PhotoTilt {
  frame: HTMLElement;
  /** Lean toward a normalised point (-1…1 on each axis). */
  lean: (nx: number, ny: number) => void;
  /** Spring duration for the next moves (0.4s to follow, 0.6s to settle back). */
  duration: (seconds: number) => void;
  destroy: () => void;
}

/**
 * A photo leans in 3D inside its frame and drifts the other way. Only the
 * [data-photo-tilt] layer moves: the frame clips it, and the scrims and any
 * text stay put and are never scaled. The frame is the layer's parent.
 */
function photoTilt(layer: HTMLElement): PhotoTilt | null {
  const frame = layer.parentElement;
  if (!frame) return null;

  const quick = { duration: 0.4, ease: 'power3.out' };
  const rotX = gsap.quickTo(layer, 'rotationX', quick);
  const rotY = gsap.quickTo(layer, 'rotationY', quick);
  const driftX = gsap.quickTo(layer, 'x', quick);
  const driftY = gsap.quickTo(layer, 'y', quick);
  const springs = [rotX, rotY, driftX, driftY];

  // Zoom the photo just enough that the lean (its far edge recedes) plus the drift never show its
  // edges. Applied on the first move, so a visitor who never tilts sees the photo exactly as designed.
  let covered = false;
  const coverScale = () => {
    const { width, height } = frame.getBoundingClientRect();
    const recede = PHOTO_PERSPECTIVE / (PHOTO_PERSPECTIVE + Math.sin((PHOTO_TILT * Math.PI) / 180) * (Math.max(width, height) / 2));
    return (1 + (PHOTO_DRIFT * 2 + 4) / Math.min(width, height)) / recede;
  };
  const onResize = () => {
    if (covered) gsap.set(layer, { scale: coverScale() });
  };
  gsap.set(layer, { transformPerspective: PHOTO_PERSPECTIVE });
  window.addEventListener('resize', onResize);

  return {
    frame,
    lean(nx, ny) {
      if (!covered) {
        covered = true;
        gsap.to(layer, { scale: coverScale(), duration: REVEAL, ease: 'power3.out' });
      }
      rotY(nx * PHOTO_TILT);
      rotX(-ny * PHOTO_TILT);
      driftX(-nx * PHOTO_DRIFT);
      driftY(-ny * PHOTO_DRIFT);
    },
    duration: (seconds) => springs.forEach((fn) => fn.tween.duration(seconds)),
    destroy() {
      window.removeEventListener('resize', onResize);
      gsap.killTweensOf(layer);
      gsap.set(layer, { clearProps: 'transform' });
    },
  };
}

/**
 * Desktop: each photo leans toward the pointer while it is over the photo, or
 * over the wider [data-tilt-area] around it (the homepage hero follows the
 * pointer anywhere over the hero), and settles back on leave.
 */
function photoTiltPointer(): () => void {
  const removers: Array<() => void> = [];

  for (const layer of all('[data-photo-tilt]')) {
    const photo = photoTilt(layer);
    if (!photo) continue;
    const area = layer.closest<HTMLElement>('[data-tilt-area]') ?? photo.frame;
    let rect = area.getBoundingClientRect();

    const enter = () => {
      rect = area.getBoundingClientRect();
      photo.duration(0.4);
    };
    const move = (event: PointerEvent) => {
      photo.lean(
        gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
        gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };
    const leave = () => {
      photo.duration(0.6);
      photo.lean(0, 0);
    };

    area.addEventListener('pointerenter', enter);
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerleave', leave);
    removers.push(() => {
      area.removeEventListener('pointerenter', enter);
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerleave', leave);
      photo.destroy();
    });
  }

  return () => removers.forEach((fn) => fn());
}

/**
 * Touch screens: the hero photo leans with the phone (deviceorientation),
 * measured from the angle the phone is held at, which slowly re-centres.
 * Browsers only send orientation on HTTPS. iOS also needs permission, which it
 * only lets a page ask for during a tap, so the prompt waits for the visitor's
 * first tap that isn't on a link or control (so it never lands on top of a
 * navigation). A "denied" answer is remembered and never asked again.
 */
function heroTiltPhone(): () => void {
  if (!('DeviceOrientationEvent' in window)) return () => {};
  const layer = document.querySelector<HTMLElement>('[data-photo-tilt="phone"]');
  const hero = layer && photoTilt(layer);
  if (!hero) return () => {};

  /** Degrees of phone tilt away from the resting angle that give the full lean. */
  const RANGE = 20;
  /** How quickly the resting angle follows the way the phone is held (per event). */
  const RECENTER = 0.02;
  const ASKED_KEY = 'rg-motion-permission';

  // Only follow the phone while the hero is on screen.
  let onScreen = true;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry) onScreen = entry.isIntersecting;
  });
  observer.observe(hero.frame);

  let rest: { x: number; y: number } | null = null;

  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return;
    // Map the phone's axes onto the screen's, so landscape tilts the right way.
    const angle = screen.orientation?.angle ?? 0;
    const [x, y] =
      angle === 90 ? [event.beta, -event.gamma]
      : angle === 270 || angle === -90 ? [-event.beta, event.gamma]
      : angle === 180 ? [-event.gamma, -event.beta]
      : [event.gamma, event.beta];

    rest ??= { x, y };
    rest.x += (x - rest.x) * RECENTER;
    rest.y += (y - rest.y) * RECENTER;
    if (onScreen) hero.lean(gsap.utils.clamp(-1, 1, (x - rest.x) / RANGE), gsap.utils.clamp(-1, 1, (y - rest.y) / RANGE));
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

  const stopAsking = () => {
    document.removeEventListener('click', onTap);
    document.removeEventListener('touchend', onTap);
  };
  function onTap(event: Event) {
    if ((event.target as Element | null)?.closest('a, button, input, select, textarea, label, summary')) return;
    requestPermission!.call(DeviceOrientationEvent).then(
      (state) => {
        stopAsking();
        remember(state);
      },
      // Not counted as a tap (e.g. the end of a scroll): wait for the next one.
      () => {},
    );
  }

  // Listen straight away: Android sends orientation without asking, and on iOS events start
  // arriving once permission is granted (or still holds from earlier).
  window.addEventListener('deviceorientation', onOrientation);
  if (requestPermission && recalled() !== 'denied') {
    document.addEventListener('click', onTap);
    document.addEventListener('touchend', onTap);
  }

  return () => {
    stopAsking();
    window.removeEventListener('deviceorientation', onOrientation);
    observer.disconnect();
    hero.destroy();
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

/* ---------- Dropdowns: the body fades and rises in on open ---------- */

/** The height opens at once (native <details>); only the body's opacity and position animate. */
function disclosures(): () => void {
  const items = all<HTMLDetailsElement>('[data-motion="disclosure"]');
  const onToggle = (event: Event) => {
    const item = event.currentTarget as HTMLDetailsElement;
    const body = item.querySelector<HTMLElement>('[data-disclosure-body]');
    if (!body) return;
    if (item.open) gsap.fromTo(body, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: UI, ease: 'power3.out', overwrite: true });
    else gsap.set(body, { clearProps: 'all' });
  };
  for (const item of items) item.addEventListener('toggle', onToggle);
  return () => {
    for (const item of items) item.removeEventListener('toggle', onToggle);
    gsap.set(all('[data-disclosure-body]'), { clearProps: 'all' });
  };
}
