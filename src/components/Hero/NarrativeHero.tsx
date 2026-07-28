import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { heroScatter } from '../../data/heroScatter';
import { HeroScatterItem } from './HeroScatterItem';
import { HeroMorphIntro } from './HeroMorphIntro';
import { HeroPaperStrips } from './HeroPaperStrips';
import { HeroNarrativeCopy } from './HeroNarrativeCopy';
import './narrativeHero.css';

interface NarrativeHeroProps {
  /** Only start the morph intro's own timers once the splash has actually cleared —
   * this component is mounted (hidden behind the splash) from page load, so
   * starting on mount would let the whole sequence run out unseen. */
  splashDone: boolean;
  /** Lifted up to App.tsx so the sibling FloatingNodes section can also
   * read it (see App.tsx for why). */
  showMorphIntro: boolean;
  onMorphComplete: () => void;
}

type IntroStage = 'paperStrips' | 'cinematic';

export function NarrativeHero({ splashDone, showMorphIntro, onMorphComplete }: NarrativeHeroProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  // Local to the two-step sequence itself — HeroPaperStrips plays first
  // and alone, then hands off to the cinematic photo overlay, which in
  // turn hands off (via the onMorphComplete prop) to the real hero
  // collage. showMorphIntro is the coarse "is the sequence still running
  // at all" flag the sibling FloatingNodes section also reads; this is
  // just which half of it is currently on screen.
  const [introStage, setIntroStage] = useState<IntroStage>('paperStrips');

  const handlePaperStripsDone = useCallback(() => setIntroStage('cinematic'), []);

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
    <section className="narrative-hero">
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
          instead of the real viewport. AnimatePresence lets each stage's
          exit fade play out before it unmounts. The two stages are
          mutually exclusive and sequential: HeroPaperStrips plays alone
          first and calls handlePaperStripsDone when its one question has
          held on screen, which swaps in HeroMorphIntro; that in turn
          calls onMorphComplete a little ahead of its own exit fade
          finishing, so the hero collage starts appearing while it's still
          dissolving — a cross-fade "morph," not a jump cut. */}
      <AnimatePresence>
        {showMorphIntro && splashDone && introStage === 'paperStrips' && (
          <HeroPaperStrips key="hero-paper-strips" onCycleComplete={handlePaperStripsDone} />
        )}
        {showMorphIntro && splashDone && introStage === 'cinematic' && (
          <HeroMorphIntro key="hero-morph-intro" onComplete={onMorphComplete} />
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
