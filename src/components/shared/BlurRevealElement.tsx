import { motion, type Variants } from 'framer-motion';
import { Fragment, type ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Per-word stagger. `hidden`/`visible` are inherited by the word spans
 * below, so the parent only has to orchestrate timing. */
const containerVariants = (delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: delay } },
});

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE },
  },
};

interface BlurRevealTextProps {
  children: string;
  className?: string;
  as?: 'p' | 'span' | 'h2' | 'h3' | 'li';
  delay?: number;
  once?: boolean;
  amount?: number;
}

/** Blur-reveals a string one WORD at a time as it scrolls into view.
 *
 * Words are wrapped in inline-block spans — a blur/transform on a plain
 * inline span would be ignored, since those properties need a block
 * formatting context to apply. The trailing space is emitted OUTSIDE the
 * span so the browser can still break lines normally; baking it into the
 * span would make each word an unbreakable unit and wreck the wrapping. */
export function BlurRevealText({
  children,
  className,
  as = 'p',
  delay = 0,
  once = false,
  amount = 0.25,
}: BlurRevealTextProps) {
  const Tag = motion[as];
  const words = children.split(' ');

  return (
    <Tag
      className={className}
      variants={containerVariants(delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span variants={wordVariants} style={{ display: 'inline-block', willChange: 'transform, filter' }}>
            {word}
          </motion.span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  );
}

interface BlurRevealElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
}

/** Container-level blur reveal, for things that aren't plain text (cards,
 * diagrams, the footer clock). For copy, prefer BlurRevealText above so
 * it reveals word by word rather than as one block.
 *
 * `once` defaults to FALSE so the reveal replays every time the element
 * enters the viewport — scrolling down and back up both re-trigger it.
 * That's also the safer default: with once:true a reveal that fires while
 * its section is still hidden (behind the splash, say) spends its only
 * trigger and the content stays stuck invisible, a bug this page has hit
 * before. once:false always recovers on the next scroll. */
export function BlurRevealElement({
  children,
  className,
  delay = 0,
  once = false,
  amount = 0.25,
}: BlurRevealElementProps) {
  const variants: Variants = {
    hidden: { filter: 'blur(8px)', opacity: 0, y: 24 },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: { duration: 1, delay, ease: EASE },
    },
  };

  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="visible" viewport={{ once, amount }}>
      {children}
    </motion.div>
  );
}
