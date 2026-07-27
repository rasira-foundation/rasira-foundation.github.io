import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AsteriskMark } from './AsteriskMark';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import './splash.css';

type Stage = 'dot' | 'star' | 'logo' | 'fadeOut';

// Where the "*" sits within rasira-2lines.svg's own bounding box (viewBox
// 0 0 477 167), as a fraction — used to line the logo's own baked-in star
// up with the standalone dot/star mark it grows out of.
const STAR_X_FRACTION = 0.041;
const GLIDE_OFFSET_PX = 90; // how far left the dot glides before morphing
const LOGO_WIDTH_PX = 360;

const TIMINGS = {
  dotHold: 500,
  glide: 800, // spec: 800ms cubic-bezier(0.65, 0, 0.35, 1)
  starHold: 300,
  logoIn: 700,
  logoHold: 800,
  fadeOut: 1000, // spec: clean 1000ms cross-fade into the homepage
};

const GLIDE_EASE = [0.65, 0, 0.35, 1] as const;

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<Stage>('dot');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onComplete();
      return;
    }

    const tStar = TIMINGS.dotHold;
    const tLogo = tStar + TIMINGS.glide + TIMINGS.starHold;
    const tFadeOut = tLogo + TIMINGS.logoIn + TIMINGS.logoHold;
    const tDone = tFadeOut + TIMINGS.fadeOut;

    const timers = [
      window.setTimeout(() => setStage('star'), tStar),
      window.setTimeout(() => setStage('logo'), tLogo),
      window.setTimeout(() => setStage('fadeOut'), tFadeOut),
      window.setTimeout(onComplete, tDone),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [onComplete]);

  const glided = stage !== 'dot';
  const logoLeftEdge = `calc(50% - ${GLIDE_OFFSET_PX + STAR_X_FRACTION * LOGO_WIDTH_PX}px)`;

  return (
    <motion.div
      className="splash"
      role="presentation"
      animate={{ opacity: stage === 'fadeOut' ? 0 : 1 }}
      transition={{ duration: TIMINGS.fadeOut / 1000, ease: 'easeInOut' }}
      style={{ pointerEvents: stage === 'fadeOut' ? 'none' : 'auto' }}
    >
      <motion.div
        className="splash-dot"
        animate={{
          left: glided ? `calc(50% - ${GLIDE_OFFSET_PX}px)` : '50%',
          opacity: stage === 'dot' || stage === 'star' ? 1 : 0,
          scale: stage === 'dot' ? 1 : 0.4,
        }}
        transition={{ left: { duration: TIMINGS.glide / 1000, ease: GLIDE_EASE }, opacity: { duration: 0.3 } }}
      />

      <motion.div
        className="splash-star"
        initial={{ opacity: 0 }}
        animate={{
          left: `calc(50% - ${GLIDE_OFFSET_PX}px)`,
          opacity: stage === 'star' ? 1 : 0,
        }}
        transition={{ left: { duration: TIMINGS.glide / 1000, ease: GLIDE_EASE }, opacity: { duration: 0.4 } }}
      >
        <AsteriskMark />
      </motion.div>

      <div className="splash-logotype-wrap" style={{ left: logoLeftEdge, width: LOGO_WIDTH_PX }}>
        <motion.img
          src={twoLineLogo}
          alt="Rasira Foundation"
          className="splash-logotype"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: stage === 'logo' || stage === 'fadeOut' ? 1 : 0,
            y: stage === 'logo' || stage === 'fadeOut' ? 0 : 20,
          }}
          transition={{ duration: TIMINGS.logoIn / 1000, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </motion.div>
  );
}
