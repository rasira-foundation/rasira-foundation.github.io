import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './constellationDivider.css';

/* ── LINE — STAR — LINE ──
   A section rule with a single stitched star at its centre.

   This was a full branching constellation. That was more drawing than a
   divider between two blocks of copy needs, and it is now one rule and one
   star — which is also what was actually asked for.

   The star is radiating STROKES worked out from a centre point, the way the
   embroidered reference is stitched, not a filled glyph. That is what lets it
   draw itself on: a stroke can, a fill can only fade. */

/** Spokes of the star as ONE path of separate subpaths.
 *
 *  Deliberately a single element. A dash offset runs across a path's subpaths
 *  in sequence, so animating pathLength draws the spokes one after another,
 *  outward from the centre — the stitching order, for free, from one animated
 *  value rather than eight staggered ones. */
function starPath(x: number, y: number, r: number, spokes: number): string {
  const round = (n: number) => Math.round(n * 100) / 100;
  return Array.from({ length: spokes }, (_, i) => {
    /* Offset by half a step so no spoke lies exactly on the horizontal, where
       it would read as part of the rule rather than as part of the star. */
    const a = ((i + 0.5) * 2 * Math.PI) / spokes;
    return `M ${x} ${y} L ${round(x + r * Math.cos(a))} ${round(y - r * Math.sin(a))}`;
  }).join(' ');
}

/* Both rules are drawn FROM the centre outward — the left one runs right to
   left — so pathLength makes them travel away from the star rather than
   toward it. */
const LEFT_RULE = 'M 214 20 L 30 20';
const RIGHT_RULE = 'M 286 20 L 470 20';

const EASE = [0.22, 1, 0.36, 1] as const;
const FAILSAFE_MS = 5000;

/* The trigger. Three attempts at this failed in a row, and every one failed
   the same way: the resting state was invisible, something had to flip it,
   and some path to that flip was missed. So there are now three independent
   ones and a ceiling under all of them.

   1. A rect check on scroll and resize. No lower bound — a figure already
      scrolled past should be drawn, not disqualified forever, which is the
      bug that made a restored scroll position leave it blank.
   2. An IntersectionObserver on the SVG, which has real area. NOT on the
      shapes: a horizontal rule's bounding box has zero area, and a zero-area
      target can never satisfy any threshold. That was the second failure.
   3. A timer, as a floor under both.

   The timer is the thing the agency dial deliberately does NOT have, and the
   difference is what firing early costs. There it would waste the reveal the
   reader was meant to watch. Here the worst case is that a decorative rule
   finishes drawing before anyone scrolls to it — invisible, and far better
   than staying blank. */
function useDrawn() {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (drawn) return;
    const arrive = () => setDrawn(true);

    const check = () => {
      const el = ref.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) arrive();
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) arrive();
      },
      { threshold: 0 },
    );
    if (ref.current) io.observe(ref.current);

    const timer = window.setTimeout(arrive, FAILSAFE_MS);

    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [drawn]);

  return { ref, drawn };
}

export function ConstellationDivider() {
  const { ref, drawn } = useDrawn();

  return (
    <div className="constellation-divider-slot">
      <svg
        ref={ref}
        className="constellation-divider"
        viewBox="0 0 500 40"
        fill="none"
        /* Decorative. It carries nothing the copy does not, so a screen
           reader should pass straight over it to the heading. */
        aria-hidden="true"
        role="presentation"
      >
        {/* Star first; the rules then travel out of it. */}
        <motion.path
          className="constellation-star"
          d={starPath(250, 20, 12, 8)}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        />

        {[LEFT_RULE, RIGHT_RULE].map((d) => (
          <motion.path
            key={d}
            className="constellation-rule"
            d={d}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}
