import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import oneLineLogo from '../../assets/rasira-1line.svg';
import './splash.css';

type Stage = 'reveal' | 'handoff';

// Where the "*" sits within rasira-2lines.svg's own bounding box (viewBox
// 0 0 477 167), as a percentage — the clip-path circle is centered here so
// the iris opens on the star first before revealing the rest of the mark.
const STAR_CLIP_ORIGIN = '4.1% 12.1%';

const TIMINGS = {
  revealTotal: 2500,
  holdBeforeHandoff: 500,
  handoff: 950,
};

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<Stage>('reveal');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onComplete();
      return;
    }

    const t1 = window.setTimeout(() => setStage('handoff'), TIMINGS.revealTotal + TIMINGS.holdBeforeHandoff);
    const t2 = window.setTimeout(
      onComplete,
      TIMINGS.revealTotal + TIMINGS.holdBeforeHandoff + TIMINGS.handoff,
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="splash" role="presentation">
      <motion.div
        className="splash-logo-wrap"
        style={{ left: '50%', x: '-50%' }}
        animate={stage === 'handoff' ? 'handoff' : 'center'}
        variants={{
          center: { top: '50%', y: '-50%', scale: 1 },
          handoff: { top: '20px', y: '0%', scale: 0.17 },
        }}
        transition={{ duration: TIMINGS.handoff / 1000, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={twoLineLogo}
          alt=""
          className="splash-logo splash-logo--two"
          animate={{
            clipPath: [
              `circle(0% at ${STAR_CLIP_ORIGIN})`,
              `circle(6.5% at ${STAR_CLIP_ORIGIN})`,
              `circle(6.5% at ${STAR_CLIP_ORIGIN})`,
              `circle(150% at ${STAR_CLIP_ORIGIN})`,
            ],
            opacity: stage === 'handoff' ? 0 : 1,
          }}
          transition={{
            clipPath: { duration: TIMINGS.revealTotal / 1000, times: [0, 0.22, 0.5, 1], ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.5 },
          }}
        />
        <motion.img
          src={oneLineLogo}
          alt="Rasira Foundation"
          className="splash-logo splash-logo--one"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'handoff' ? 1 : 0 }}
          transition={{ duration: 0.5, delay: stage === 'handoff' ? 0.25 : 0 }}
        />
      </motion.div>

      <AnimatePresence>
        {stage === 'handoff' && (
          <motion.div
            className="splash-dawn-curtain"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: TIMINGS.handoff / 1000, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <button type="button" className="splash-skip" onClick={onComplete}>
        Skip
      </button>
    </div>
  );
}
