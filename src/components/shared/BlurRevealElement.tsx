import { motion, type Variants } from 'framer-motion';
import { Fragment, type ReactNode } from 'react';
import { IN_VIEW, SPRING } from '../../lib/motion';


/** Per-word stagger. `hidden`/`visible` are inherited by the word spans
 * below, so the parent only has to orchestrate timing. */
const containerVariants = (delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: delay } },
});

/* 12px, up from 8px. The blur was being applied correctly but barely
   registered: with a critically damped spring (bounce: 0) most of the
   travel happens in the first third of the duration, so a small blur is
   already gone before the eye catches it. A deeper starting blur is what
   makes the reveal read as words resolving into focus rather than simply
   fading in. */
const wordVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: SPRING,
  },
};

interface BlurRevealTextProps {
  children: string;
  className?: string;
  as?: 'p' | 'span' | 'h2' | 'h3' | 'li';
  delay?: number;
  once?: boolean;
  /** Overrides IN_VIEW's default. Left undefined so the shared
   * centre-of-viewport margin governs on its own — setting both a margin
   * and an amount can make tall elements untriggerable. */
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
  amount,
}: BlurRevealTextProps) {
  const Tag = motion[as];
  const words = children.split(' ');

  return (
    <Tag
      className={className}
      variants={containerVariants(delay)}
      initial="hidden"
      whileInView="visible"
      /* inherit={false} is REQUIRED, not tidiness.
       *
       * These components use variant LABELS ("hidden"/"visible"), and
       * Framer propagates variant changes from any animating motion
       * ancestor down to motion descendants. Several of these sit as
       * direct children of a motion.div that runs its own reveal with
       * OBJECT props — so there is no matching label to inherit, and the
       * child never leaves "hidden". Symptom: body copy stuck invisible
       * while headings a few pixels away were fine. The headings only
       * worked by accident, because a plain <h3> sat between them and the
       * animating parent and broke the propagation chain.
       *
       * This opts out of that inheritance so the component's own
       * whileInView governs, wherever it is mounted. */
      inherit={false}
      viewport={amount === undefined ? { ...IN_VIEW, once } : { ...IN_VIEW, once, amount }}
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
  /** Overrides IN_VIEW's default. Left undefined so the shared
   * centre-of-viewport margin governs on its own — setting both a margin
   * and an amount can make tall elements untriggerable. */
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
  amount,
}: BlurRevealElementProps) {
  const variants: Variants = {
    hidden: { filter: 'blur(8px)', opacity: 0, y: 24 },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: { ...SPRING, delay },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      /* See the note in BlurRevealText above — without this, a reveal
         mounted directly inside another animating motion component never
         leaves its hidden variant. */
      inherit={false}
      viewport={amount === undefined ? { ...IN_VIEW, once } : { ...IN_VIEW, once, amount }}
    >
      {children}
    </motion.div>
  );
}
