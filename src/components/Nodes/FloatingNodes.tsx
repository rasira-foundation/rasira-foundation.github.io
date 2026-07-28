import { useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import { CONTACT_EMAIL, programAims, floatingNodes, collabPrompt } from '../../data/siteContent';
import { spokeNodes, collabPosition, hubPosition } from '../../data/floatingNodesLayout';
import './floatingNodes.css';

const TEXT_DELAY = 0.9;

type Point = { top: number; left: number };

function distance(a: Point, b: Point) {
  return Math.hypot(a.left - b.left, a.top - b.top);
}

// The viewBox is 100x100 abstract units stretched non-uniformly
// (preserveAspectRatio="none") across the field's real content box, so 1
// viewBox unit is roughly 9px on screen — not exact for every line's angle
// or viewport size, but close enough for a "small gap before the dot"
// that a fixed viewBox-unit offset can't get exactly right anyway.
const PX_PER_UNIT = 9;

// Returns a point `gapPx` short of `to`, along the line from `from` to
// `to` — used to pull a spoke line's endpoint back before it actually
// reaches its dot, instead of drawing straight into it.
function pullBack(from: Point, to: Point, gapPx: number): Point {
  const gap = gapPx / PX_PER_UNIT;
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const length = Math.hypot(dx, dy);
  if (length <= gap) return from;
  const ratio = (length - gap) / length;
  return { left: from.left + dx * ratio, top: from.top + dy * ratio };
}

// Spoke lines stop ~15px short of the dot they'd otherwise touch.
const DOT_GAP_PX = 15;

const lineContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Framer's `pathLength` shorthand reveals a path by taking over
// stroke-dasharray entirely, which makes it impossible to keep an actual
// repeating dash pattern (2 4) visible during/after the draw. Animating
// stroke-dashoffset by hand instead lets the dash stay constant while the
// line still visibly draws outward.
function lineVariants(length: number): Variants {
  return {
    hidden: { strokeDashoffset: length },
    visible: { strokeDashoffset: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };
}

interface FloatingNodesProps {
  /** Stays hidden while the hero's cinematic intro is still playing,
   * regardless of scroll position — the section's own whileInView reveals
   * would otherwise fire early if someone scrolls down mid-intro. */
  heroDone: boolean;
}

export function FloatingNodes({ heroDone }: FloatingNodesProps) {
  const fieldRef = useRef<HTMLDivElement>(null);

  const bulletsStart = pullBack(hubPosition, spokeNodes.bullets, DOT_GAP_PX);
  const measureStart = pullBack(hubPosition, spokeNodes.measure, DOT_GAP_PX);
  const designStart = pullBack(hubPosition, spokeNodes.design, DOT_GAP_PX);

  const bulletsLen = distance(bulletsStart, hubPosition);
  const measureLen = distance(measureStart, hubPosition);
  const designLen = distance(designStart, hubPosition);

  return (
    // The gradient background lives on this outer <section> and must stay
    // permanently opaque — animating opacity here would fade the gradient
    // itself out along with the content, leaving a flat cream gap where
    // Section 1's gradient should continue uninterrupted. Only the inner
    // content wrapper below fades, so the background wash never breaks.
    <section className="floating-nodes">
      <motion.div
        className="floating-nodes-field"
        ref={fieldRef}
        animate={{ opacity: heroDone ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: heroDone ? 'auto' : 'none' }}
      >
        {/* The 3 spoke lines pull back short of their own dot. The
            trajectory line that used to run to the "Collabs with us?" CTA
            has been removed entirely (not just masked) — it kept reading
            as a distracting line running behind/through the pill however
            it was clipped. once: true (rather than false) so these draw
            in once and stay put, instead of re-triggering their
            hidden/visible variants — and so visibly flashing away and
            redrawing — every time the section scrolls past the 40%
            viewport threshold. */}
        <motion.svg
          className="node-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          variants={lineContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
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
        </motion.svg>

        <NodeDot position={spokeNodes.bullets} floatClass="node-float-0" delay={0.35} />
        <NodeDot position={spokeNodes.measure} floatClass="node-float-1" delay={0.43} />
        <NodeDot position={spokeNodes.design} floatClass="node-float-2" delay={0.51} />

        <div
          className="node-content-wrap node-drift-0"
          style={{ top: `${spokeNodes.bullets.top - 12}%`, left: `${spokeNodes.bullets.left - 24}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY} amount={0.4}>
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
          <BlurRevealElement delay={TEXT_DELAY + 0.1} amount={0.4}>
            <p className="node-content node-measure">
              <BoldLeadText node={floatingNodes[0]} />
            </p>
          </BlurRevealElement>
        </div>

        <div
          className="node-content-wrap node-drift-1"
          style={{ top: `${spokeNodes.design.top + 2}%`, left: `${spokeNodes.design.left + 3}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY + 0.2} amount={0.4}>
            <p className="node-content node-design">
              <BoldLeadText node={floatingNodes[1]} />
            </p>
          </BlurRevealElement>
        </div>

        <div
          className="node-content-wrap node-drift-0"
          style={{ top: `${collabPosition.top - 3}%`, left: `${collabPosition.left + 2}%` }}
        >
          <BlurRevealElement delay={TEXT_DELAY + 0.05} amount={0.4}>
            <div className="node-content node-collab-group">
              <a href={`mailto:${CONTACT_EMAIL}`} className="node-collab-pill">
                <h2>{collabPrompt.heading}</h2>
              </a>
              <p className="node-collab-sub">{collabPrompt.sub}</p>
            </div>
          </BlurRevealElement>
        </div>
      </motion.div>
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
        viewport={{ once: true, amount: 0.4 }}
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
