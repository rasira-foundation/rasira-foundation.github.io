import { useEffect, useState } from 'react';

/**
 * Section-driven page background, in the style of Framer's Background
 * Changer: each section declares the colour it wants behind it via a
 * `data-bg` attribute, and the page ground crossfades to that colour as
 * the section takes over the viewport.
 *
 * The crossfade itself is a plain CSS transition on the ground element
 * (see PageBackground), NOT a scroll-linked motion value.
 * That is deliberate: a scroll-derived value only advances while scroll
 * and rAF actually run, and this file's neighbours already document a
 * real bug from that — a frozen value left the page's colour stuck and
 * broke contrast for whatever was on screen. A time-based transition
 * cannot fail that way. It also means the animation runs at the same
 * speed whether the user scrolls fast or slow, which is what makes it
 * read as a deliberate change rather than as scrubbing.
 *
 * The `-50% 0px -50% 0px` rootMargin collapses the observer's root to a
 * zero-height line across the middle of the viewport, so exactly one
 * section can intersect at a time — the one you are actually looking at.
 * A normal threshold-based observer would fire for several sections at
 * once during a scroll and the last callback would win arbitrarily.
 */
export function useSectionBackground(fallback: string) {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-bg]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const next = (entry.target as HTMLElement).dataset.bg;
          if (next) setColor(next);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return color;
}
