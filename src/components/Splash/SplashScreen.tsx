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
 * mission note here. The intro sequence's own text motion
 * (HeroPaperStrips) follows right after this unmounts (see
 * NarrativeHero.tsx). The header's own logo
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
      /* Explicitly settled, not animating in. With no `initial` this already
         rendered at full opacity, so this changes nothing today — it is here
         to keep it that way. A motion child inherits variants from any
         animating motion ancestor, and if this ever gained one, an inherited
         hidden state would fade the splash in over a background that is
         already the same colour: a pointless wait on the critical path. The
         exit fade is unaffected; it is declared separately. */
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: TIMINGS.exit / 1000, ease: 'easeInOut' }}
    >
      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </motion.div>
  );
}
