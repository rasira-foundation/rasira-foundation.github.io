import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AsteriskMark } from './AsteriskMark';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import oneLineLogo from '../../assets/rasira-1line.svg';
import './splash.css';

type Stage = 'dot' | 'star' | 'logo' | 'handoff';

// Where the "*" sits within rasira-2lines.svg's own bounding box (viewBox
// 0 0 477 167), as a fraction — used to line the logo's own baked-in star
// up with the standalone dot/star mark it grows out of.
const STAR_X_FRACTION = 0.041;
const GLIDE_OFFSET_PX = 90; // how far left the mark settles before the wordmark grows in
const LOGO_WIDTH_DESKTOP_PX = 360;
const NARROW_BREAKPOINT_PX = 462; // below this, 360px + offset would overflow narrow phones
const NARROW_WIDTH_FRACTION = 0.78; // matches the CSS max-width clamp below

const TIMINGS = {
  dotHold: 400,
  expand: 900, // dot -> star: one smooth, unhurried expansion, no snap
  logoIn: 650, // starts the instant the expansion ends, no pause
  logoHold: 700,
  handoff: 950, // dawn curtain drop + logo shrinking into the navbar
};

const EXPAND_EASE = [0.16, 1, 0.3, 1] as const; // smooth expo-out, no jarring stop

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<Stage>('dot');

  // Keeps the wordmark's rendered width in sync with the CSS max-width
  // clamp on .splash-logotype-wrap, so the star-to-glyph offset math below
  // stays accurate instead of assuming the full desktop width on phones
  // (which previously pushed the wordmark off-screen and clipped it).
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

    const tStar = TIMINGS.dotHold;
    const tLogo = tStar + TIMINGS.expand;
    const tHandoff = tLogo + TIMINGS.logoIn + TIMINGS.logoHold;
    const tDone = tHandoff + TIMINGS.handoff;

    const timers = [
      window.setTimeout(() => setStage('star'), tStar),
      window.setTimeout(() => setStage('logo'), tLogo),
      window.setTimeout(() => setStage('handoff'), tHandoff),
      window.setTimeout(onComplete, tDone),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [onComplete]);

  const glided = stage !== 'dot';
  const isHandoff = stage === 'handoff';
  const logoLeftEdge = `calc(50% - ${GLIDE_OFFSET_PX + STAR_X_FRACTION * logoWidthPx}px)`;

  return (
    <motion.div
      className="splash"
      role="presentation"
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      <motion.div
        className="splash-dot"
        animate={{
          left: glided ? `calc(50% - ${GLIDE_OFFSET_PX}px)` : '50%',
          opacity: stage === 'dot' ? 1 : 0,
          scale: stage === 'dot' ? 1 : 1.8,
        }}
        transition={{ duration: TIMINGS.expand / 1000, ease: EXPAND_EASE }}
      />

      <AnimatePresence>
        {stage === 'dot' || stage === 'star' ? (
          <motion.div
            key="star-live"
            className="splash-star"
            layoutId="splash-star"
            style={{ left: `calc(50% - ${GLIDE_OFFSET_PX}px)` }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: stage === 'star' ? 1 : 0, scale: stage === 'star' ? 1 : 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TIMINGS.expand / 1000, ease: EXPAND_EASE }}
          >
            <AsteriskMark />
          </motion.div>
        ) : (
          // Invisible anchor sharing the same layoutId, positioned exactly
          // where the star sits inside the now-visible logotype — gives
          // framer a real target to FLIP the outgoing star's box toward,
          // instead of the layoutId sitting on a single element with
          // nothing to hand off to.
          <motion.div
            key="star-anchor"
            className="splash-star-anchor"
            layoutId="splash-star"
            style={{ left: `calc(50% - ${GLIDE_OFFSET_PX}px)` }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="splash-logotype-wrap"
        style={{ width: logoWidthPx }}
        animate={{
          left: isHandoff ? '50%' : logoLeftEdge,
          top: isHandoff ? '20px' : '50%',
          y: isHandoff ? '0%' : '-50%',
          scale: isHandoff ? 0.17 : 1,
        }}
        transition={{ duration: (isHandoff ? TIMINGS.handoff : TIMINGS.logoIn) / 1000, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={twoLineLogo}
          alt=""
          className="splash-logotype splash-logotype--two"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: stage === 'logo' ? 1 : stage === 'handoff' ? 0 : 0,
            y: stage === 'logo' || stage === 'handoff' ? 0 : 20,
          }}
          transition={{ duration: TIMINGS.logoIn / 1000, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.img
          layoutId="brand-logo"
          src={oneLineLogo}
          alt="Rasira Foundation"
          className="splash-logotype splash-logotype--one"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHandoff ? 1 : 0 }}
          transition={{ duration: 0.4, delay: isHandoff ? 0.3 : 0 }}
        />
      </motion.div>

      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </motion.div>
  );
}
