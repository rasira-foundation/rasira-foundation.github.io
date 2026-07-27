import React from 'react';
import { motion, type Variants } from 'framer-motion';
import './blurRevealText.css';

interface BlurRevealTextProps {
  text: string;
  className?: string;
  /** Plays the reveal once this flips true — gates it to a specific
   * moment (e.g. the hero morph intro finishing) rather than firing the
   * instant this mounts. Defaults to true for standalone use. */
  start?: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } },
};

const wordVariants: Variants = {
  hidden: { opacity: 0.2, filter: 'blur(8px)', y: 6 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/** Word-by-word blur-to-clear reveal that plays on its own once `start`
 * flips true — a scripted entrance, not something tied to scroll position
 * or requiring the user to scroll for it to play out. */
export function BlurRevealText({ text, className = '', start = true }: BlurRevealTextProps) {
  const words = text.split(' ');

  return (
    <motion.p
      className={`blur-reveal ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={start ? 'visible' : 'hidden'}
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span variants={wordVariants} className="blur-reveal-word">
            {word}
          </motion.span>
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </motion.p>
  );
}
