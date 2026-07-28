import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import resume from '../../assets/photos/resume.png';
import openDoor from '../../assets/photos/open-door.png';
import youthGroup from '../../assets/photos/youth.jpg';
import archivalCutout from '../../assets/photos/Graduate.jpg';
import sdg10Badge from '../../assets/photos/sdg10-badge.png';
import './heroMorphIntro.css';

type Stage = 'door' | 'youth' | 'newspaper' | 'resumeSdg';

// Now the second (and last) leg of the intro sequence — HeroPaperStrips
// plays first and alone, then hands off to this. Plays through once
// (~1.9s), holds briefly on resumeSdg, then calls onComplete itself
// (there's no HeroPaperStrips running alongside anymore to signal
// completion) so the parent can morph across into the real hero collage.
const TIMINGS = {
  door: 700,
  youth: 600,
  newspaper: 600,
  resumeHold: 700,
  exit: 550,
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface HeroMorphIntroProps {
  onComplete: () => void;
}

/**
 * A cinematic, sequential reveal of the hero's own asset set — door,
 * youth photo, graduate portrait, resume + SDG badge — settling on the
 * resume/badge pair and holding there briefly, before handing off (via
 * onComplete, fired a little ahead of its own exit fade finishing so the
 * incoming hero collage starts appearing while this is still dissolving —
 * a cross-fade "morph" rather than a hard cut) to the real scattered hero
 * collage underneath.
 */
export function HeroMorphIntro({ onComplete }: HeroMorphIntroProps) {
  const [stage, setStage] = useState<Stage>('door');

  useEffect(() => {
    let elapsed = 0;
    const schedule: [Stage, number][] = [
      ['youth', TIMINGS.door],
      ['newspaper', TIMINGS.youth],
      ['resumeSdg', TIMINGS.newspaper],
    ];

    const timers = schedule.map(([nextStage, delay]) => {
      elapsed += delay;
      return window.setTimeout(() => setStage(nextStage), elapsed);
    });

    elapsed += TIMINGS.resumeHold;
    // Fires ~200ms before the exit fade below visually finishes, so the
    // hero collage's own pop-in starts while the tail of this fade is
    // still on screen — no blank frame between the two.
    const doneTimer = window.setTimeout(onComplete, elapsed + TIMINGS.exit - 200);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="hero-morph-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: TIMINGS.exit / 1000, ease: 'easeInOut' }}
    >
      <div className="hero-morph-stage">
        <AnimatePresence>
          {stage === 'door' && (
            <motion.img
              key="door"
              src={openDoor}
              alt=""
              className="hero-morph-image hero-morph-door"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: TIMINGS.door / 1000, ease: [0.6, 0, 0.9, 0.2] }}
            />
          )}

          {stage === 'youth' && (
            <motion.img
              key="youth"
              src={youthGroup}
              alt=""
              className="hero-morph-image"
              initial={{ opacity: 0, scale: 0.85, rotateY: 0 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          )}

          {stage === 'newspaper' && (
            <motion.img
              key="newspaper"
              src={archivalCutout}
              alt=""
              className="hero-morph-image"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          )}

          {stage === 'resumeSdg' && (
            <motion.div
              key="resumeSdg"
              className="hero-morph-pair"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <motion.img
                src={resume}
                alt=""
                className="hero-morph-resume-img"
                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
              <motion.img
                src={sdg10Badge}
                alt=""
                className="hero-morph-sdg"
                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
