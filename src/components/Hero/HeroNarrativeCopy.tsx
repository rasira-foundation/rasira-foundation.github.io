import { Fragment } from 'react';
import { motion, type Variants } from 'framer-motion';
import { heroIntro } from '../../data/siteContent';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025 } },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

/** The restored main hero paragraph — word-by-word blur reveal, playing
 * the instant it mounts (the parent conditionally mounts this right
 * after the cinematic overlay's exit completes, so mounting itself is
 * the trigger). */
export function HeroNarrativeCopy() {
  const words = heroIntro.paragraph.split(' ');

  return (
    <motion.div
      className="hero-narrative-copy"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.p className="hero-copy-paragraph" variants={containerVariants} initial="hidden" animate="visible">
        {words.map((word, index) => (
          <Fragment key={index}>
            <motion.span variants={wordVariants} className="hero-copy-word">
              {word}
            </motion.span>
            {index < words.length - 1 && ' '}
          </Fragment>
        ))}
      </motion.p>
      <p className="hero-copy-tags">{heroIntro.tags.join(' / ')}</p>
    </motion.div>
  );
}
