import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import oneLineLogo from '../../assets/rasira-1line.svg';
import './splash.css';

const LOGO_WIDTH_DESKTOP_PX = 360;
const NARROW_BREAKPOINT_PX = 462; // below this, 360px would overflow narrow phones
const NARROW_WIDTH_FRACTION = 0.78; // matches the CSS max-width clamp below

const TIMINGS = {
  handoff: 1000, // wordmark reveal + hold, before the header handoff triggers
  handoffDuration: 300, // scale/slide into the header position
  exit: 500, // splash fades out after onComplete, still mounted via AnimatePresence
};

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;
const HANDOFF_EASE = [0.22, 1, 0.36, 1] as const;

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isHandoff, setIsHandoff] = useState(false);

  // Keeps the wordmark's rendered width in sync with the CSS max-width
  // clamp on .splash-logotype-wrap, matching narrativeHero's own
  // narrow-viewport handling.
  const [logoWidthPx] = useState(() => {
    if (typeof window === 'undefined') return LOGO_WIDTH_DESKTOP_PX;
    return window.innerWidth < NARROW_BREAKPOINT_PX
      ? Math.round(window.innerWidth * NARROW_WIDTH_FRACTION)
      : LOGO_WIDTH_DESKTOP_PX;
  });

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onComplete();
      return;
    }

    const handoffTimer = window.setTimeout(() => setIsHandoff(true), TIMINGS.handoff);
    const doneTimer = window.setTimeout(onComplete, TIMINGS.handoff + TIMINGS.handoffDuration);

    return () => {
      window.clearTimeout(handoffTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="splash"
      role="presentation"
      exit={{ opacity: 0 }}
      transition={{ duration: TIMINGS.exit / 1000, ease: 'easeInOut' }}
    >
      <motion.div
        className="splash-logotype-wrap"
        style={{ width: logoWidthPx }}
        animate={{
          top: isHandoff ? '20px' : '50%',
          x: '-50%',
          y: isHandoff ? '0%' : '-50%',
          scale: isHandoff ? 0.17 : 1,
        }}
        transition={{ duration: TIMINGS.handoffDuration / 1000, ease: HANDOFF_EASE }}
      >
        {/* Rendered immediately on mount — no dot/star build-up beforehand,
            the wordmark (asterisk included) is the very first thing shown. */}
        <motion.img
          src={twoLineLogo}
          alt=""
          className="splash-logotype splash-logotype--two"
          initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
          animate={{
            opacity: isHandoff ? 0 : 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          transition={{ duration: isHandoff ? 0.2 : 0.6, ease: REVEAL_EASE }}
        />
        {/* Shares layoutId="brand-logo" with the header's own logo — Framer
            tracks both as one logical element, so the handoff reads as a
            single mark gliding into the corner rather than two separately
            tuned animations meeting at a cut. */}
        <motion.img
          layoutId="brand-logo"
          src={oneLineLogo}
          alt="Rasira Foundation"
          className="splash-logotype splash-logotype--one"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHandoff ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </motion.div>
  );
}
