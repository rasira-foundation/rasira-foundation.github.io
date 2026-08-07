import { useEffect } from 'react';
import { motion } from 'framer-motion';
import './splash.css';

const TIMINGS = {
  hold: 700, // brief gradient-only hold before handing off
  exit: 500, // splash fades out after onComplete, still mounted via AnimatePresence
};

interface SplashScreenProps {
  onComplete: () => void;
}

/** Just the gradient canvas, held briefly, then handing off — no logo, no
 * mission.png here. The intro sequence's own text motion (HeroPaperStrips)
 * and mission-image beat (HeroMorphIntro) already follow right after this
 * unmounts (see NarrativeHero.tsx); putting mission.png here too made it
 * appear twice before the real hero ever showed. The header's own logo
 * fades in independently once splashDone flips (see SiteHeader's `visible`
 * prop) — no shared-element handoff with anything here. */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onComplete();
      return;
    }

    const doneTimer = window.setTimeout(onComplete, TIMINGS.hold);
    return () => window.clearTimeout(doneTimer);
  }, [onComplete]);

  return (
    <motion.div
      className="splash"
      role="presentation"
      exit={{ opacity: 0 }}
      transition={{ duration: TIMINGS.exit / 1000, ease: 'easeInOut' }}
    >
      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </motion.div>
  );
}
