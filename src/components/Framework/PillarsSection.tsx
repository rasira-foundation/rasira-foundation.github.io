import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { pillars } from '../../data/siteContent';
import pillarsImage from '../../assets/photos/pillars-torn-classroom.png';
import './pillarsSection.css';

interface PillarsSectionProps {
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished, regardless of scroll position — otherwise this section's
   * own whileInView reveals could fire while it's still covered by the
   * splash overlay, "using up" their once:true trigger unseen. */
  heroDone: boolean;
}

/** Three-column intro to the framework below, with the classroom photo
 * above it running a layered parallax: the image overlaps both the
 * article cards above and this copy below, and sits behind both, so it
 * slides under them as you scroll. */
export function PillarsSection({ heroDone }: PillarsSectionProps) {
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageWrapRef,
    offset: ['start end', 'end start'],
  });

  // Translating the un-cropped image rather than the usual "oversize it
  // and crop inside a fixed-height box" parallax: this PNG's torn bottom
  // edge IS its artwork, baked into the alpha channel, so a vertical crop
  // would slice that edge off. transform doesn't affect layout, so this
  // drift can't reflow anything — it just slides the image over the
  // sections above and below.
  const imageY = useTransform(scrollYProgress, [0, 1], ['18%', '-18%']);

  return (
    <motion.section
      className="pillars-section"
      animate={{ opacity: heroDone ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: heroDone ? 'auto' : 'none' }}
    >
      {/* Torn-paper edge is baked into the PNG itself (transparent, jagged
          bottom) — no card frame or border needed, it just bleeds
          straight into the grid below. */}
      <div className="pillars-image-wrap" ref={imageWrapRef}>
        <motion.img src={pillarsImage} alt="" className="pillars-image" style={{ y: imageY }} />
      </div>

      <div className="pillars-grid">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.label}
            className="pillar-block"
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="pillar-label">
              <span className="pillar-marker" aria-hidden="true" />
              {pillar.label}
            </h3>
            {pillar.items ? (
              <ul className="pillar-body">
                {pillar.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="pillar-body">{pillar.body}</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
