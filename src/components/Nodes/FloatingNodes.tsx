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

export function FloatingNodes() {
  const bulletsLen = distance(spokeNodes.bullets, hubPosition);
  const measureLen = distance(spokeNodes.measure, hubPosition);
  const designLen = distance(spokeNodes.design, hubPosition);
  const collabLen = distance(collabPosition, hubPosition);

  return (
    <section className="floating-nodes">
      <div className="floating-nodes-field">
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
          <motion.line
            className="node-line"
            strokeDasharray="4 4"
            variants={lineVariants(bulletsLen)}
            x1={spokeNodes.bullets.left}
            y1={spokeNodes.bullets.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          <motion.line
            className="node-line"
            strokeDasharray="4 4"
            variants={lineVariants(measureLen)}
            x1={spokeNodes.measure.left}
            y1={spokeNodes.measure.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          <motion.line
            className="node-line"
            strokeDasharray="4 4"
            variants={lineVariants(designLen)}
            x1={spokeNodes.design.left}
            y1={spokeNodes.design.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
          />
          {/* The trajectory line — the path toward the CTA, called out in a
              distinct accent color so it reads as the primary route through
              the diagram. Terminates at the exact same hub coordinate as
              every other spoke, so all four still meet at one point. */}
          <motion.line
            className="node-line node-line--trajectory"
            strokeDasharray="4 4"
            variants={lineVariants(collabLen)}
            x1={collabPosition.left}
            y1={collabPosition.top}
            x2={hubPosition.left}
            y2={hubPosition.top}
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
              <a href={`mailto:${CONTACT_EMAIL}`} className="node-collab-pill">
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

function BoldLeadText({ node }: { node: (typeof floatingNodes)[number] }) {
  const leadIndex = node.text.indexOf(node.boldLead);
  if (leadIndex === -1) return <>{node.text}</>;

  const before = node.text.slice(0, leadIndex);
  const after = node.text.slice(leadIndex + node.boldLead.length);
  return (
    <>
      {before}
      <strong>{node.boldLead}</strong>
      {after}
    </>
  );
}
