import React from 'react';
import { motion, type Variants } from 'framer-motion';
import './blurRevealText.css';

interface BlurRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

/** Word-by-word blur-in reveal, triggered as the text scrolls into view. */
export function BlurRevealText({
  text,
  className = '',
  delay = 0,
  duration = 1.2,
  stagger = 0.04,
}: BlurRevealTextProps) {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: delay, staggerChildren: stagger },
    },
  };

  const wordVariants: Variants = {
    hidden: { filter: 'blur(12px)', opacity: 0, y: 12 },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: { duration, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={`blur-reveal ${className}`}
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span variants={wordVariants} className="blur-reveal-word">
            {word}
          </motion.span>
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </motion.div>
  );
}
