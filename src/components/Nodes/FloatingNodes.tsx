import { motion } from 'framer-motion';
import { AsteriskMark } from '../Splash/AsteriskMark';
import { CONTACT_EMAIL, programAims, floatingNodes, collabPrompt } from '../../data/siteContent';
import { hubPosition, spokeNodes, collabPosition } from '../../data/floatingNodesLayout';
import './floatingNodes.css';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-15% 0px' },
} as const;

export function FloatingNodes() {
  return (
    <section className="floating-nodes">
      <div className="floating-nodes-field">
        <svg className="node-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1={spokeNodes.bullets.left} y1={spokeNodes.bullets.top} x2={hubPosition.left} y2={hubPosition.top} />
          <line x1={spokeNodes.measure.left} y1={spokeNodes.measure.top} x2={hubPosition.left} y2={hubPosition.top} />
          <line x1={spokeNodes.design.left} y1={spokeNodes.design.top} x2={hubPosition.left} y2={hubPosition.top} />
          <line x1={collabPosition.left} y1={collabPosition.top} x2={hubPosition.left} y2={hubPosition.top} />
        </svg>

        <NodeDot position={spokeNodes.bullets} floatClass="node-float-0" />
        <NodeDot position={spokeNodes.measure} floatClass="node-float-1" />
        <NodeDot position={spokeNodes.design} floatClass="node-float-2" />

        <motion.div className="node-hub node-float-0" style={hubPosition} {...fadeUp} transition={{ duration: 0.8 }}>
          <AsteriskMark className="node-hub-mark" />
        </motion.div>

        <motion.div
          className="node-content node-bullets"
          style={{ top: `${spokeNodes.bullets.top - 12}%`, left: `${spokeNodes.bullets.left - 24}%` }}
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h3>{programAims.heading}</h3>
          <ul>
            {programAims.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          className="node-content node-measure"
          style={{ top: `${spokeNodes.measure.top - 5}%`, left: `${spokeNodes.measure.left + 3}%` }}
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <BoldLeadText node={floatingNodes[0]} />
        </motion.p>

        <motion.p
          className="node-content node-design"
          style={{ top: `${spokeNodes.design.top + 2}%`, left: `${spokeNodes.design.left + 3}%` }}
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <BoldLeadText node={floatingNodes[1]} />
        </motion.p>

        <motion.a
          href={`mailto:${CONTACT_EMAIL}`}
          className="node-content node-collab"
          style={{ top: `${collabPosition.top - 5}%`, left: `${collabPosition.left - 18}%` }}
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <h2>{collabPrompt.heading}</h2>
          <p>{collabPrompt.sub}</p>
        </motion.a>
      </div>
    </section>
  );
}

function NodeDot({ position, floatClass }: { position: { top: number; left: number }; floatClass: string }) {
  return <span className={`node-dot ${floatClass}`} style={{ top: `${position.top}%`, left: `${position.left}%` }} />;
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
