import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
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

        {showMorphIntro && splashDone && (
          <HeroMorphIntro
            onComplete={() => {
              sessionStorage.setItem(MORPH_INTRO_SEEN_KEY, '1');
              setShowMorphIntro(false);
            }}
          />
        )}
      </motion.div>

      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <BlurRevealText text={heroIntro.paragraph} className="hero-copy-paragraph" />
        <p className="hero-copy-tags">{heroIntro.tags.join(' / ')}</p>
      </motion.div>
    </section>
  );
}
