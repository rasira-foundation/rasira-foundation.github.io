import { useEffect, useRef, useState } from 'react';

/** Corner radius of the track's two turns. */
const RADIUS = 18;
/** Half-width of the arrowhead, and its length. */
const ARROW_W = 5;
const ARROW_H = 9;
/** Below this the track collapses to a single vertical connector. */
const COMPACT_BELOW = 768;

interface FrameworkLoopProps {
  label: string;
}

/**
 * The cycle track under the framework diagram: down from Outcomes, left
 * beneath the panel, and up into Opportunity Context.
 *
 * The SVG's viewBox is MEASURED rather than fixed, which is the whole
 * reason this can be an SVG at all. A fluid-width SVG normally needs
 * preserveAspectRatio="none", and that stretches everything horizontally —
 * a rounded corner becomes elliptical and an arrowhead becomes a wedge, so
 * the drawing is only correct at one width. Sizing the viewBox to the
 * element's own pixel box makes one user unit equal one CSS pixel at every
 * width, so the arcs stay circular and the arrowhead stays the shape it was
 * drawn as. That is also what makes "pixel-exact alignment" achievable at
 * all: the path can be told to end exactly where the arrowhead begins.
 */
export function FrameworkLoop({ label }: FrameworkLoopProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    /* A window listener as well as the observer, deliberately. RO
       notifications are not delivered while the document is hidden, so a
       tab resized in the background comes back with a viewBox measured at
       the old width — the SVG then renders at 1:1 with a box it no longer
       occupies, which is exactly the distortion this component exists to
       avoid. The listener catches that on the next resize; the two are
       idempotent so double-firing costs nothing. */
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { w, h } = box;
  const compact = w > 0 && w < COMPACT_BELOW;

  /* Anchored to the COLUMN CENTRES, not the panel's outer edges: the track
     leaves from under Outcomes (the 4th of four columns) and arrives under
     Opportunity Context (the 1st), so it points at the stages it actually
     connects rather than at the corners of the box. */
  const exitX = w * 0.875;
  const entryX = w * 0.125;

  const track = compact
    ? `M ${w / 2} 0 V ${h - ARROW_H}`
    : [
        `M ${exitX} 0`,
        `V ${h - RADIUS}`,
        `A ${RADIUS} ${RADIUS} 0 0 1 ${exitX - RADIUS} ${h}`,
        `H ${entryX + RADIUS}`,
        `A ${RADIUS} ${RADIUS} 0 0 1 ${entryX} ${h - RADIUS}`,
        `V ${ARROW_H}`,
      ].join(' ');

  /* Compact points DOWN (the deck reads top to bottom), full track points
     UP into the panel it is returning to. */
  const tipX = compact ? w / 2 : entryX;
  const head = compact
    ? `${tipX - ARROW_W},${h - ARROW_H} ${tipX + ARROW_W},${h - ARROW_H} ${tipX},${h}`
    : `${tipX - ARROW_W},${ARROW_H} ${tipX + ARROW_W},${ARROW_H} ${tipX},0`;

  return (
    <div className="framework-loop" ref={ref}>
      {w > 0 && (
        <svg
          className="framework-loop-svg"
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          fill="none"
          aria-hidden="true"
        >
          <path
            d={track}
            stroke="var(--color-loop-track)"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeLinecap="butt"
          />
          {/* Solid, so the head reads as a terminus rather than as more
              dashes. It shares the path's exact endpoint. */}
          <polygon points={head} fill="var(--color-loop-track)" />
        </svg>
      )}
      <span className="framework-loop-label">{label}</span>
    </div>
  );
}
