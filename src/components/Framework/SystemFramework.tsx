import { motion } from 'framer-motion';
import { BlurRevealText } from '../shared/BlurRevealElement';
import { systemFramework } from '../../data/siteContent';
import './systemFramework.css';

interface SystemFrameworkProps {
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished, regardless of scroll position — see PillarsSection. */
  heroDone: boolean;
}

/** The public-framework diagram: eyebrow/title/subtitle, then 4 "packet"
 * cards (Person Profile -> Evidence in Action -> Decisions & Development
 * -> Outcomes) connected by arrows, a dashed feedback-loop curve back
 * from Outcomes to Evidence in Action, and a disclaimer note. Each card
 * has a notched top edge (clip-path) and a placeholder media block —
 * real photography/illustration per stage can replace that block later,
 * it's just the card's own accent color for now. Text color/size is
 * fixed and explicit on every variant (dark ink at 16px for body copy),
 * not dependent on whatever's behind the card. */
export function SystemFramework({ heroDone }: SystemFrameworkProps) {
  return (
    <motion.section
      className="system-framework"
      animate={{ opacity: heroDone ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: heroDone ? 'auto' : 'none' }}
    >
      <div className="framework-inner">
        {/* Just a spacing wrapper now — each .framework-box below carries
            its own explicit background and text color, so nothing here
            needs to guarantee contrast against ProductionGradient3D
            itself. */}
        <div className="framework-card">
          <div className="framework-diagram">
            {systemFramework.boxes.map((box, index) => (
              <motion.div
                key={box.title}
                className={`framework-box framework-box--${box.variant}`}
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="framework-box-body">
                  <BlurRevealText as="h3" className="framework-box-title" delay={index * 0.1}>{box.title}</BlurRevealText>
                  <div className="framework-box-meta">
                    <span className="framework-box-tag">[{box.tag}]</span>
                    <span className="framework-box-step">{`0${index + 1} / 0${systemFramework.boxes.length}`}</span>
                  </div>
                  <div className="framework-box-divider" aria-hidden="true">
                    <span className="framework-box-divider-dot" />
                  </div>
                  <ul className="framework-box-items">
                    {box.items.map((item, itemIndex) => (
                      <BlurRevealText as="li" key={item} delay={index * 0.1 + itemIndex * 0.06}>
                        {`${item}${itemIndex < box.items.length - 1 ? '/' : '.'}`}
                      </BlurRevealText>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="framework-feedback">
            <svg className="framework-feedback-svg" viewBox="0 0 1004 64" fill="none" aria-hidden="true">
              {/* Orthogonal, not a bezier: down the right side, straight
                  across, then up into the first card. Square corners
                  (miter joins) match the rectangular language of the
                  cards above rather than softening it with a curve. */}
              <path
                d="M 980 8 L 980 46 L 20 46 L 20 8"
                stroke="#1c1917"
                strokeWidth="1"
                strokeDasharray="4 4"
                fill="none"
                strokeLinecap="square"
                strokeLinejoin="miter"
                opacity="0.55"
                markerEnd="url(#framework-feedback-arrow)"
              />
              <defs>
                <marker
                  id="framework-feedback-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M2 1L8 5L2 9"
                    fill="none"
                    stroke="#1c1917"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.55"
                  />
                </marker>
              </defs>
            </svg>
            <p className="framework-feedback-label">{systemFramework.feedbackLabel}</p>
          </div>
        </div>

        <p className="framework-note">{systemFramework.note}</p>
      </div>
    </motion.section>
  );
}
