import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { heroScatter } from '../../data/heroScatter';
import { heroIntro } from '../../data/siteContent';
import { HeroScatterItem } from './HeroScatterItem';
import { HeroMorphIntro } from './HeroMorphIntro';
import { BlurRevealText } from '../shared/BlurRevealText';
import './narrativeHero.css';

const MORPH_INTRO_SEEN_KEY = 'rasira-hero-intro-seen';

interface NarrativeHeroProps {
  /** Only start the morph intro's own timers once the splash has actually cleared —
   * this component is mounted (hidden behind the splash) from page load, so
   * starting on mount would let the whole sequence run out unseen. */
  splashDone: boolean;
}

export function NarrativeHero({ splashDone }: NarrativeHeroProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [showMorphIntro, setShowMorphIntro] = useState(
    () => sessionStorage.getItem(MORPH_INTRO_SEEN_KEY) !== '1',
  );
  // The narrative paragraph stays hidden for as long as the morph intro is
  // showing, and only floats in once the whole cinematic sequence — door
  // through exit — has actually finished (not partway through, at its own
  // text beat). If the intro's already been seen this session there's
  // nothing to wait on, so this is true from the first render.
  const heroCopyReady = !showMorphIntro;

  const handleMorphComplete = useCallback(() => {
    sessionStorage.setItem(MORPH_INTRO_SEEN_KEY, '1');
    setShowMorphIntro(false);
  }, []);

  // 0 when the field's top edge reaches the viewport top, 1 once its bottom
  // edge has too (i.e. how far it's scrolled past). Blur/desaturate ramps up
  // over just the first 30% of that, then holds, so it reads as a clean
  // top-to-bottom exit transition rather than a slow fade the whole way down.
  const { scrollYProgress } = useScroll({ target: fieldRef, offset: ['start start', 'end start'] });
  const blurPx = useTransform(scrollYProgress, [0, 0.3], [0, 8]);
  const grayscaleAmt = useTransform(scrollYProgress, [0, 0.3], [0, 0.85]);
  const brightnessAmt = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const fieldFilter = useMotionTemplate`blur(${blurPx}px) grayscale(${grayscaleAmt}) brightness(${brightnessAmt})`;

  return (
    <section className="narrative-hero">
      <motion.div ref={fieldRef} className="hero-scatter-field" style={{ filter: fieldFilter }}>
        {/* Scattered layout stays hidden until the morph intro has actually
            finished — otherwise, now that the intro's own backdrop is
            transparent, these would show through it while it plays. */}
        {!showMorphIntro &&
          heroScatter.map((item, index) => <HeroScatterItem key={item.id} item={item} index={index} />)}

        {/* AnimatePresence so the morph overlay can finish its own exit fade
            gracefully even though onComplete now fires slightly before that
            fade is visually done (see HeroMorphIntro) — without it, this
            conditional render would yank the overlay out mid-fade. */}
        <AnimatePresence>
          {showMorphIntro && splashDone && <HeroMorphIntro key="hero-morph-intro" onComplete={handleMorphComplete} />}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 15 }}
        animate={heroCopyReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <BlurRevealText text={heroIntro.paragraph} className="hero-copy-paragraph" start={heroCopyReady} />
        <p className="hero-copy-tags">{heroIntro.tags.join(' / ')}</p>
      </motion.div>
    </section>
  );
}
