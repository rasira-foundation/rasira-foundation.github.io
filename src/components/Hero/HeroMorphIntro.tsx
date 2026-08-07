import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import mission from '../../assets/photos/mission.png';
import './heroMorphIntro.css';

// mission.png is now the only hero asset — the old thank-you/graduate
// stage sequence is gone, so this holds briefly on mission alone before
// calling onComplete so the parent can morph across into the real hero
// collage.
const TIMINGS = {
  missionHold: 1200,
  exit: 550,
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface HeroMorphIntroProps {
  onComplete: () => void;
}

/**
 * A brief cinematic hold on the mission note, then a full fade-out —
 * driven by local state (isExiting) rather than AnimatePresence's `exit`
 * prop, so the fade is finished and mission is entirely gone *before*
 * onComplete fires and the real hero content starts appearing, instead
 * of the two overlapping.
 */
export function HeroMorphIntro({ onComplete }: HeroMorphIntroProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), TIMINGS.missionHold);
    const doneTimer = window.setTimeout(onComplete, TIMINGS.missionHold + TIMINGS.exit);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="hero-morph-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: TIMINGS.exit / 1000, ease: 'easeInOut' }}
    >
      <div className="hero-morph-stage">
        <motion.img
          src={mission}
          alt=""
          className="hero-morph-image"
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        />
      </div>
    </motion.div>
  );
}
