import { Fragment } from 'react';
import { motion, type Variants } from 'framer-motion';
import { heroIntro } from '../../data/siteContent';
import { HeroEyes } from './HeroEyes';

/** Per-word timing, shared by the paragraph and the tag line below it.
 * Named constants rather than inline numbers because the tags' start is
 * DERIVED from them — see settleTime. */
const STAGGER = 0.025;
const WORD_DURATION = 0.4;

const containerVariants = (delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER, delayChildren } },
});

const wordVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: WORD_DURATION, ease: [0.16, 1, 0.3, 1] },
  },
};

/** When a word-staggered line has finished: the last word starts after
 * (count - 1) staggers and then takes its own duration to resolve.
 * Computed rather than hardcoded so editing the hero copy cannot silently
 * desynchronise the line that follows it. */
function settleTime(wordCount: number) {
  return (wordCount - 1) * STAGGER + WORD_DURATION;
}

function Words({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {/* inline-block because blur and transform are ignored on a plain
              inline box. The trailing space is emitted OUTSIDE the span so
              the browser can still break lines normally — baking it in
              would make each word an unbreakable unit. */}
          <motion.span variants={wordVariants} className="hero-copy-word">
            {word}
          </motion.span>
          {index < words.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  );
}

/** The restored hero copy — a large serif title, then a smaller mono
 * description with its own word-by-word blur reveal, then the tags line
 * revealing the same way once the paragraph above it has fully settled.
 * Plays the instant it mounts (the parent conditionally mounts this right
 * after the cinematic overlay's exit completes, so mounting itself is
 * the trigger). */
export function HeroNarrativeCopy() {
  const paragraphWords = heroIntro.paragraph.split(' ').length;

  return (
    <motion.div
      className="hero-narrative-copy"
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* The strip is a real inline element in the heading, not a
          background — it has to sit in the text flow and wrap with it, so
          that the line breaks fall around it the way they would around a
          word. */}
      <h1 className="hero-title">
        {heroIntro.titleBefore} <HeroEyes /> {heroIntro.titleAfter}
      </h1>

      <motion.p
        className="hero-copy-paragraph"
        variants={containerVariants()}
        initial="hidden"
        animate="visible"
      >
        <Words text={heroIntro.paragraph} />
      </motion.p>

      {/* Starts exactly where the paragraph stops, rather than at a
          hand-picked delay: delayChildren is the paragraph's own settle
          time, so the two lines stay in sequence however the copy is
          edited. Same reveal as the paragraph, so the whole block reads as
          one continuous pass rather than two effects.

          A LIST of chips, not a slash-joined sentence. These are three
          separate disciplines, and the chip form says so — the same form the
          agency dial's levers use lower down, so the two read as one device
          rather than two ways of listing things. Staggering is per chip now
          rather than per word: a tag broken across its own words animated as
          three unrelated pieces of one label. */}
      <motion.ul
        className="hero-copy-tags"
        variants={containerVariants(settleTime(paragraphWords))}
        initial="hidden"
        animate="visible"
      >
        {heroIntro.tags.map((tag) => (
          <motion.li key={tag} className="hero-tag" variants={wordVariants}>
            {tag}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
