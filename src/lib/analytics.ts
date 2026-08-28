/* ── ANALYTICS ──
 * A thin wrapper over gtag, plus the section-timing observer.
 *
 * Everything here is a NO-OP when gtag is absent, which is the normal case
 * in dev and whenever a visitor blocks trackers. That is deliberate: the
 * site must not depend on analytics being present, and a missing tag should
 * never throw into a React render.
 */

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = 'G-CNB6CMXVV5';

export function track(event: string, params: Params = {}) {
  window.gtag?.('event', event, params);
}

/**
 * A page view for a route the browser never actually navigated to.
 *
 * GA4 records one page_view on load and nothing after, because opening an
 * article only changes the hash — no document load, no automatic hit. So
 * article views would be invisible without this, even though the articles
 * are the whole point of the content work. Sending page_location and
 * page_title explicitly is what makes each article show up as its own row
 * in the Pages report rather than folding into the homepage.
 */
export function trackPageView(path: string, title: string) {
  window.gtag?.('config', GA_ID, {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title,
  });
}

/* ── SECTION TIMING ──
 * How long each part of the page was actually on screen.
 *
 * Driven by one IntersectionObserver over every [data-section] element,
 * rather than a hook per component. The sections are plain markup in six
 * different files; an attribute keeps the instrumentation out of their
 * render logic entirely, and adding a new section needs no code here.
 */
const VISIBLE_RATIO = 0.4;

type SectionState = { total: number; enteredAt: number | null; seen: boolean };
const sections = new Map<string, SectionState>();
let observer: IntersectionObserver | null = null;

function stateFor(name: string): SectionState {
  let s = sections.get(name);
  if (!s) {
    s = { total: 0, enteredAt: null, seen: false };
    sections.set(name, s);
  }
  return s;
}

function enter(name: string) {
  const s = stateFor(name);
  if (s.enteredAt !== null) return;
  s.enteredAt = performance.now();
  if (!s.seen) {
    s.seen = true;
    track('section_view', { section_name: name });
  }
}

function leave(name: string) {
  const s = stateFor(name);
  if (s.enteredAt === null) return;
  s.total += performance.now() - s.enteredAt;
  s.enteredAt = null;
}

/** Close the clock on every visible section without reporting — used when
 *  the tab goes to the background, so time spent on another tab is not
 *  counted as time spent reading. */
function pauseAll() {
  sections.forEach((_, name) => leave(name));
}

function resumeVisible() {
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    if (visible > 0 && visible / Math.min(r.height, window.innerHeight) >= VISIBLE_RATIO) {
      enter(el.dataset.section!);
    }
  });
}

/** Send the accumulated dwell times. Fired on pagehide rather than
 *  beforeunload, which is unreliable on mobile Safari, and the events go
 *  out through gtag's own transport. */
function flush() {
  pauseAll();
  sections.forEach((s, name) => {
    if (s.total < 1000) return; // a glance is not a read
    track('section_engaged', {
      section_name: name,
      engagement_seconds: Math.round(s.total / 1000),
    });
    s.total = 0;
  });
}

export function initSectionTracking() {
  if (observer) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const name = (e.target as HTMLElement).dataset.section;
        if (!name) return;
        if (e.isIntersecting && e.intersectionRatio >= VISIBLE_RATIO) enter(name);
        else leave(name);
      });
    },
    /* A spread of thresholds rather than one: a section taller than the
       viewport can never reach 0.4 of its own height on screen, so the
       callback also has to fire as it passes through. */
    { threshold: [0, 0.1, 0.25, VISIBLE_RATIO, 0.6, 0.9] },
  );

  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => observer!.observe(el));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAll();
    else resumeVisible();
  });
  window.addEventListener('pagehide', flush);
}

/** Re-scan after a route change, since the article view swaps the whole
 *  tree and the previous elements no longer exist. */
export function rescanSections() {
  if (!observer) return;
  observer.disconnect();
  sections.forEach((_, name) => leave(name));
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => observer!.observe(el));
}
