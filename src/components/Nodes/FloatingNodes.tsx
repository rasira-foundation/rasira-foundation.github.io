import { useLayoutEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { AsteriskMark } from '../Splash/AsteriskMark';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import { CONTACT_EMAIL, programAims, floatingNodes, collabPrompt } from '../../data/siteContent';
import { hubPosition, spokeNodes, collabPosition } from '../../data/floatingNodesLayout';
import './floatingNodes.css';

// Sequence: connector lines draw in first, then the dots/central anchor pop
// in as the lines finish, then the text/CTA content settles in last.
const LINE_STAGGER = 0.12;
const NODE_DELAY = 0.35;
const TEXT_DELAY = 0.9;

type Point = { top: number; left: number };

function distance(a: Point, b: Point) {
  return Math.hypot(a.left - b.left, a.top - b.top);
}

// The viewBox is 100x100 abstract units stretched non-uniformly
// (preserveAspectRatio="none") across the field's real ~1132x720px
// content box, so 1 viewBox unit is roughly 9px on screen (splitting the
// difference between the ~11.3px/unit horizontal and ~7.2px/unit
// vertical scale) — not exact for every line's angle or viewport size,
// but close enough for a "small gap before the dot" that a fixed
// viewBox-unit offset can't get exactly right anyway.
const PX_PER_UNIT = 9;

// Returns a point `gapPx` short of `to`, along the line from `from` to
// `to` — used to pull a line's endpoint back before it actually reaches
// a dot or card, instead of drawing straight into it.
function pullBack(from: Point, to: Point, gapPx: number): Point {
  const gap = gapPx / PX_PER_UNIT;
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const length = Math.hypot(dx, dy);
  if (length <= gap) return from;
  const ratio = (length - gap) / length;
  return { left: from.left + dx * ratio, top: from.top + dy * ratio };
}

const lineContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: LINE_STAGGER } },
};

// Framer's `pathLength` shorthand reveals a path by taking over
// stroke-dasharray entirely, which makes it impossible to keep an actual
// repeating dash pattern (4 4) visible during/after the draw. Animating
// stroke-dashoffset by hand instead lets the "4 4" dash stay constant while
// the line still visibly draws outward from the hub.
function lineVariants(length: number): Variants {
  return {
    hidden: { strokeDashoffset: length },
    visible: { strokeDashoffset: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };
}

// Spoke lines stop ~15px short of the dot they'd otherwise touch.
const DOT_GAP_PX = 15;

// Extra padding (in real px) around the pill's own measured rect before
// masking the line out — a small margin so the line stops just short of
// the glass surface rather than exactly at its pixel edge.
const PILL_MASK_PAD_PX = 8;

interface MaskRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function FloatingNodes() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLAnchorElement>(null);
  const [pillMask, setPillMask] = useState<MaskRect | null>(null);

  // Measures the pill's real rendered box and converts it into the SVG's
  // own 0-100 coordinate space (which maps 1:1 to percentage-of-field,
  // since the viewBox is exactly "0 0 100 100" over a 100%-sized <svg>) —
  // an exact figure from the real DOM, not an estimate, so the line is
  // guaranteed to clip at the pill's actual edge regardless of viewport
  // size or how much the CTA text itself changes the pill's width.
  //
  // A fixed pull-back distance can't do this reliably: pulling the line's
  // endpoint back *toward the hub* happens to move it further into the
  // pill's footprint in this layout (the hub sits roughly in the
  // direction the pill extends from its own anchor point), not away from
  // it — so a distance-based approximation was clipping the wrong thing.
  useLayoutEffect(() => {
    function measure() {
      const field = fieldRef.current;
      const pill = pillRef.current;
      if (!field || !pill) return;
      const fieldRect = field.getBoundingClientRect();
      const pillRect = pill.getBoundingClientRect();
      if (fieldRect.width === 0 || fieldRect.height === 0) return;
      setPillMask({
        x: ((pillRect.left - fieldRect.left - PILL_MASK_PAD_PX) / fieldRect.width) * 100,
        y: ((pillRect.top - fieldRect.top - PILL_MASK_PAD_PX) / fieldRect.height) * 100,
        width: ((pillRect.width + PILL_MASK_PAD_PX * 2) / fieldRect.width) * 100,
        height: ((pillRect.height + PILL_MASK_PAD_PX * 2) / fieldRect.height) * 100,
      });
    }

    measure();
    // The pill itself floats in via BlurRevealElement's own translateY
    // reveal (whileInView, scroll-triggered — not necessarily right at
    // mount), which shifts its measured rect until that settles. Re-check
    // a few times to catch wherever it actually lands, rather than
    // permanently locking the mask to a mid-animation position.
    const settleTimers = [200, 600, 1200, 2200].map((delay) => window.setTimeout(measure, delay));
    window.addEventListener('resize', measure);
    return () => {
      settleTimers.forEach(window.clearTimeout);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const bulletsStart = pullBack(hubPosition, spokeNodes.bullets, DOT_GAP_PX);
  const measureStart = pullBack(hubPosition, spokeNodes.measure, DOT_GAP_PX);
  const designStart = pullBack(hubPosition, spokeNodes.design, DOT_GAP_PX);

  const bulletsLen = distance(bulletsStart, hubPosition);
  const measureLen = distance(measureStart, hubPosition);
  const designLen = distance(designStart, hubPosition);
  const collabLen = distance(collabPosition, hubPosition);

  return (
    <section className="floating-nodes">
      <div className="floating-nodes-field" ref={fieldRef}>
        <motion.svg
          className="node-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          variants={lineContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
        >
          {pillMask && (
            <defs>
              <mask id="node-line-pill-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <rect x={pillMask.x} y={pillMask.y} width={pillMask.width} height={pillMask.height} fill="black" />
              </mask>
            </defs>
          )}
          <motion.line
            className="node-line"
            strokeDasharray="2 4"
            variants={lineVariants(bulletsLen)}
            x1={bulletsStart.left}
            y1={bulletsStart.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          <motion.line
            className="node-line"
            strokeDasharray="2 4"
            variants={lineVariants(measureLen)}
            x1={measureStart.left}
            y1={measureStart.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          <motion.line
            className="node-line"
            strokeDasharray="2 4"
            variants={lineVariants(designLen)}
            x1={designStart.left}
            y1={designStart.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          {/* The trajectory line — the path toward the CTA, called out in a
              distinct accent color so it reads as the primary route through
              the diagram. Terminates at the exact same hub coordinate as
              every other spoke, so all four still meet at one point. */}
          <motion.line
            className="node-line node-line--trajectory"
            strokeDasharray="2 4"
            variants={lineVariants(collabLen)}
            x1={collabPosition.left}
            y1={collabPosition.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
            mask={pillMask ? 'url(#node-line-pill-mask)' : undefined}
          />
        </motion.svg>

        <NodeDot position={spokeNodes.bullets} floatClass="node-float-0" delay={NODE_DELAY} />
        <NodeDot position={spokeNodes.measure} floatClass="node-float-1" delay={NODE_DELAY + 0.08} />
        <NodeDot position={spokeNodes.design} floatClass="node-float-2" delay={NODE_DELAY + 0.16} />

        <div className="node-content-wrap node-hub-wrap node-drift-1" style={hubPosition}>
          <BlurRevealElement className="node-hub-blur-wrap" delay={NODE_DELAY + 0.1} once={false} amount={0.4}>
            <div className="node-hub">
              <AsteriskMark className="node-hub-mark" />
            </div>
          </BlurRevealElement>
        </div>

        <div
          className="node-content-wrap node-drift-0"
          style={{ top: `${spokeNodes.bullets.top - 12}%`, left: `${spokeNodes.bullets.left - 24}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY} once={false} amount={0.4}>
            <div className="node-content node-bullets">
              <h3>{programAims.heading}</h3>
              <ul>
                {programAims.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </BlurRevealElement>
        </div>

        <div
          className="node-content-wrap node-drift-2"
          style={{ top: `${spokeNodes.measure.top - 5}%`, left: `${spokeNodes.measure.left + 3}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY + 0.1} once={false} amount={0.4}>
            <p className="node-content node-measure">
              <BoldLeadText node={floatingNodes[0]} />
            </p>
          </BlurRevealElement>
        </div>

        <div
          className="node-content-wrap node-drift-1"
          style={{ top: `${spokeNodes.design.top + 2}%`, left: `${spokeNodes.design.left + 3}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY + 0.2} once={false} amount={0.4}>
            <p className="node-content node-design">
              <BoldLeadText node={floatingNodes[1]} />
            </p>
          </BlurRevealElement>
        </div>

        <div
          className="node-content-wrap node-drift-0"
          style={{ top: `${collabPosition.top - 3}%`, left: `${collabPosition.left + 2}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY + 0.05} once={false} amount={0.4}>
            <div className="node-content node-collab-group">
              <a ref={pillRef} href={`mailto:${CONTACT_EMAIL}`} className="node-collab-pill">
                <h2>{collabPrompt.heading}</h2>
              </a>
              <p className="node-collab-sub">{collabPrompt.sub}</p>
            </div>
          </BlurRevealElement>
        </div>
      </div>
    </section>
  );
}

function NodeDot({
  position,
  floatClass,
  delay = 0,
}: {
  position: { top: number; left: number };
  floatClass: string;
  delay?: number;
}) {
  return (
    <span className={`node-dot-wrap ${floatClass}`} style={{ top: `${position.top}%`, left: `${position.left}%` }}>
      <motion.span
        className="node-dot"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </span>
  );
}

// Splits into a heading-sized lead line ("We measure") and a smaller
// monospace body line for the rest — matching node-bullets' own
// h3 + mono-ul hierarchy, rather than one uniformly-sized sentence.
function BoldLeadText({ node }: { node: (typeof floatingNodes)[number] }) {
  const leadIndex = node.text.indexOf(node.boldLead);
  if (leadIndex === -1) return <>{node.text}</>;

  const before = node.text.slice(0, leadIndex);
  const after = node.text.slice(leadIndex + node.boldLead.length);
  return (
    <>
      <span className="node-lead">
        {before}
        <strong>{node.boldLead}</strong>
      </span>
      <span className="node-lead-body">{after}</span>
    </>
  );
}
