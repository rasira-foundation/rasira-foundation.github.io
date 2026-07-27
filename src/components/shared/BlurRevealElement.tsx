import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface BlurRevealElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
}

/** Generic blur-in reveal for containers (cards, node text, diagrams) — same language as BlurRevealText, one block at a time instead of word-by-word. */
export function BlurRevealElement({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.25,
}: BlurRevealElementProps) {
  const variants: Variants = {
    hidden: { filter: 'blur(8px)', opacity: 0, y: 24 },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="visible" viewport={{ once, amount }}>
      {children}
    </motion.div>
  );
}
