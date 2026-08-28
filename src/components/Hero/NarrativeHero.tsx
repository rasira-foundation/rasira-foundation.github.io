import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { heroScatter } from '../../data/heroScatter';
import { HeroScatterItem } from './HeroScatterItem';
import { HeroPaperStrips } from './HeroPaperStrips';
import { HeroNarrativeCopy } from './HeroNarrativeCopy';
import './narrativeHero.css';

interface NarrativeHeroProps {
  /** Only start the morph intro's own timers once the splash has actually cleared —
   * this component is mounted (hidden behind the splash) from page load, so
   * starting on mount would let the whole sequence run out unseen. */
  splashDone: boolean;
  showMorphIntro: boolean;
  onMorphComplete: () => void;
}

export function NarrativeHero({ splashDone, showMorphIntro, onMorphComplete }: NarrativeHeroProps) {
  const fieldRef = useRef<HTMLDivElement>(null);

  // The narrative paragraph stays hidden for as long as the morph intro is
  // showing, and only floats in once the whole sequence — paper strips
  // through the cinematic overlay's exit — has actually finished. If the
  // intro's already been seen this session there's nothing to wait on, so
  // this is true from the first render.
  const heroCopyReady = !showMorphIntro;

  // Skip the whole sequence for reduced-motion users — jump straight to
  // the restored hero copy instead of playing the paper strips and morph
  // photos.
  useEffect(() => {
    if (!splashDone || !showMorphIntro) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onMorphComplete();
    }
  }, [splashDone, showMorphIntro, onMorphComplete]);

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
    <section className="narrative-hero" data-section="hero">
      {/* The full-bleed background photo used to live here, but now
          renders in App.tsx (see HeroBackground.tsx) as a sibling of
          SiteHeader instead of a descendant of this section — see that
          file's comment for why. */}
      <motion.div ref={fieldRef} className="hero-scatter-field" style={{ filter: fieldFilter }}>
        {/* Scattered layout stays hidden until the whole intro sequence has
            actually finished. */}
        {!showMorphIntro &&
          heroScatter.map((item, index) => <HeroScatterItem key={item.id} item={item} index={index} />)}
      </motion.div>

      {/* Rendered as a sibling of .hero-scatter-field (not inside it) since
          that field carries a live `filter` — CSS establishes a new
          containing block for `position: fixed` descendants under filter,
          which would otherwise trap these to the field's own small box
          instead of the real viewport.

          The intro is now a single stage: the paper strips type out the
          question, then hand straight off to the hero copy. The
          mission-note beat (HeroMorphIntro) that used to sit between them
          is gone. AnimatePresence keeps the strips mounted through their
          own exit fade while HeroNarrativeCopy is already fading in, so
          the two cross-dissolve rather than cutting. */}
      <AnimatePresence>
        {showMorphIntro && splashDone && (
          <HeroPaperStrips key="hero-paper-strips" onCycleComplete={onMorphComplete} />
        )}
      </AnimatePresence>

      <div className="hero-copy">
        {/* Mounts (and so plays its own reveal) right after showMorphIntro
            flips false — i.e. right after the overlay's exit completes. */}
        {heroCopyReady && <HeroNarrativeCopy />}
      </div>
    </section>
  );
}
