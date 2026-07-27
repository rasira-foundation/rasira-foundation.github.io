import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AsteriskMark } from './AsteriskMark';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import './splash.css';

type Stage = 'mark' | 'logo' | 'transition';

const TIMINGS = {
  markToLogo: 1100,
  logoToTransition: 1800,
  transitionToDone: 800,
};

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<Stage>('mark');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onComplete();
      return;
    }

    const t1 = window.setTimeout(() => setStage('logo'), TIMINGS.markToLogo);
    const t2 = window.setTimeout(() => setStage('transition'), TIMINGS.markToLogo + TIMINGS.logoToTransition);
    const t3 = window.setTimeout(
      onComplete,
      TIMINGS.markToLogo + TIMINGS.logoToTransition + TIMINGS.transitionToDone,
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="splash" role="presentation">
      <div className="splash-content">
        <AnimatePresence mode="wait">
          {stage === 'mark' && (
            <motion.div
              key="mark"
              className="splash-mark"
              initial={{ opacity: 0, scale: 0.5, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AsteriskMark />
            </motion.div>
          )}

          {stage !== 'mark' && (
            <motion.img
              key="logo"
              src={twoLineLogo}
              alt="Rasira Foundation"
              className="splash-logo"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {stage === 'transition' && (
          <motion.div
            className="splash-dawn-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: TIMINGS.transitionToDone / 1000, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </div>
  );
}
