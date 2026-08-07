import { useRef, type RefObject } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import { CollabsSection } from '../CollabsSection';
import { programAims, floatingNodes } from '../../data/siteContent';
import { spokeNodes, hubPosition } from '../../data/floatingNodesLayout';
import starmapUrl from '../../assets/starmapConstellation.svg';
import './floatingNodes.css';

const TEXT_DELAY = 0.9;

type Point = { top: number; left: number };

// The viewBox is 100x100 abstract units stretched non-uniformly
// (preserveAspectRatio="none") across the field's real content box, so 1
// viewBox unit is roughly 9px on screen — not exact for every line's angle
// or viewport size, but close enough for a "small gap before the marker"
// that a fixed viewBox-unit offset can't get exactly right anyway.
const PX_PER_UNIT = 9;

// Returns a point `gapPx` short of `to`, along the line from `from` to
// `to` — used to pull a spoke line's endpoint back before it actually
// reaches its marker, instead of drawing straight into it.
function pullBack(from: Point, to: Point, gapPx: number): Point {
  const gap = gapPx / PX_PER_UNIT;
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const length = Math.hypot(dx, dy);
  if (length <= gap) return from;
  const ratio = (length - gap) / length;
  return { left: from.left + dx * ratio, top: from.top + dy * ratio };
}

// Spoke lines stop ~15px short of the marker they'd otherwise touch.
const DOT_GAP_PX = 15;

const lineContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Now that the lines are solid rather than dashed, framer's own pathLength
// shorthand can draw the reveal directly — no need to hand-roll a
// stroke-dashoffset animation just to keep a repeating dash pattern intact.
const lineRevealVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

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
        <Starfield fieldRef={fieldRef} />

        {/* The 3 spoke lines pull back short of their own marker. The
            trajectory line that used to run to the "Collabs with us?" CTA
            has been removed entirely (not just masked) — it kept reading
            as a distracting line running behind/through the pill however
            it was clipped. once: true (rather than false) so these draw
            in once and stay put, instead of re-triggering their
            hidden/visible variants — and so visibly flashing away and
            redrawing — every time the section scrolls past the 40%
            viewport threshold. vectorEffect="non-scaling-stroke" keeps the
            1px stroke crisp regardless of the viewBox's non-uniform
            stretch across the field's real box. */}
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
            vectorEffect="non-scaling-stroke"
            variants={lineRevealVariants}
            x1={bulletsStart.left}
            y1={bulletsStart.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          <motion.line
            className="node-line"
            vectorEffect="non-scaling-stroke"
            variants={lineRevealVariants}
            x1={measureStart.left}
            y1={measureStart.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          <motion.line
            className="node-line"
            vectorEffect="non-scaling-stroke"
            variants={lineRevealVariants}
            x1={designStart.left}
            y1={designStart.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
        </motion.svg>

        <NodeMarker shape="diamond" position={spokeNodes.bullets} floatClass="node-float-0" delay={0.35} />
        <NodeMarker shape="ring" position={spokeNodes.measure} floatClass="node-float-1" delay={0.43} />
        <NodeMarker shape="sparkle" position={spokeNodes.design} floatClass="node-float-2" delay={0.51} />

        {/* Origin mark at the exact point the three trails converge —
            same wrapper-carries-placement pattern as NodeMarker, so
            framer's scale pop on the inner span never fights the
            wrapper's centering transform. Delayed until the lines have
            mostly finished drawing into it. */}
        <span
          className="node-hub-mark-wrap"
          style={{ top: `${hubPosition.top}%`, left: `${hubPosition.left}%` }}
          aria-hidden="true"
        >
          <motion.span
            className="node-hub-mark"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Sparkle size={26} />
          </motion.span>
        </span>

        <div
          className="node-content-wrap node-content-wrap--bullets node-drift-0"
          style={{ top: `calc(${spokeNodes.bullets.top - 12}% + 70px)`, left: `${spokeNodes.bullets.left - 32}%` }}
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
      </motion.div>

      {/* Collabs card — normal document flow, not part of the field's
          fixed-height percentage system above. It used to be positioned
          absolutely at hubPosition.top% + 70px, but that field is capped
          at 800px tall and the card itself runs ~300-340px, so anchoring
          it that far down the field pushed its bottom edge past the
          field's own box — overlapping whatever section came next. Normal
          flow with a fixed margin-top can never do that. */}
      <div className="floating-nodes-collabs-slot">
        <CollabsSection />
      </div>
    </section>
  );
}

// Real star-catalog artwork (src/assets/starmapConstellation.svg — a
// trimmed copy with its black backdrop circle and white canvas rect
// stripped out, leaving only the white star points) rendered as two
// layers at different scale/blur, each scroll-linked to a different
// parallax rate — the "far" layer moves less than the "near" one as the
// section scrolls through view, which is what actually reads as depth
// rather than just two flat blurred images. First in DOM order (and
// un-z-indexed, like every other layer in this field) so it paints
// behind everything that follows it, purely by DOM order rather than a
// stacking hack. The wrapper's own mask fades it out behind the text
// columns so the sky reads only in the empty space around them.
function Starfield({ fieldRef }: { fieldRef: RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ target: fieldRef, offset: ['start end', 'end start'] });
  const farY = useTransform(scrollYProgress, [0, 1], [-24, 24]);
  const nearY = useTransform(scrollYProgress, [0, 1], [-52, 52]);

  return (
    <div className="node-starfield" aria-hidden="true">
      {/* scale lives in the motion `style` prop, not the CSS class — once
          any x/y/scale/rotate motion value is set here, framer manages the
          element's `transform` itself each frame and a separate CSS
          `transform` rule on the same element gets silently overridden. */}
      <motion.div
        className="node-starfield-layer node-starfield-layer--far"
        style={{ backgroundImage: `url(${starmapUrl})`, y: farY, scale: 0.82 }}
      />
      <motion.div
        className="node-starfield-layer node-starfield-layer--near"
        style={{ backgroundImage: `url(${starmapUrl})`, y: nearY, scale: 1.04 }}
      />
    </div>
  );
}

function NodeMarker({
  shape,
  position,
  floatClass,
  delay = 0,
}: {
  shape: 'diamond' | 'ring' | 'sparkle';
  position: { top: number; left: number };
  floatClass: string;
  delay?: number;
}) {
  return (
    <span
      className={`node-marker-wrap ${floatClass}`}
      style={{ top: `${position.top}%`, left: `${position.left}%` }}
    >
      <motion.span
        className="node-marker"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <MarkerIcon shape={shape} />
      </motion.span>
    </span>
  );
}

function MarkerIcon({ shape }: { shape: 'diamond' | 'ring' | 'sparkle' }) {
  if (shape === 'diamond') {
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
        <rect x="2.2" y="2.2" width="7.6" height="7.6" transform="rotate(45 6 6)" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  if (shape === 'ring') {
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="4.3" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="6" cy="6" r="1.3" fill="currentColor" />
      </svg>
    );
  }
  return <Sparkle size={12} />;
}

// Shared four-point sparkle glyph — used for the "design" marker, the
// larger hub mark, and the scattered background stars, so all three read
// as the same visual language at different scales.
function Sparkle({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M6 0C6.4 3.3 8.7 5.6 12 6C8.7 6.4 6.4 8.7 6 12C5.6 8.7 3.3 6.4 0 6C3.3 5.6 5.6 3.3 6 0Z" />
    </svg>
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
