import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import resume from '../../assets/photos/resume.png';
import openDoor from '../../assets/photos/open-door.png';
import youthGroup from '../../assets/photos/youth-group.png';
import archivalCutout from '../../assets/photos/archival-cutout.png';
import sdg10Badge from '../../assets/photos/sdg10-badge.png';
import './heroMorphIntro.css';

type Stage = 'door' | 'youth' | 'newspaper' | 'resumeSdg' | 'text' | 'exit';

const TIMINGS = {
  door: 400,
  youth: 350,
  newspaper: 350,
  resumeSdg: 400,
  text: 500,
  exit: 300,
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface HeroMorphIntroProps {
  onComplete: () => void;
}

/**
 * A cinematic, sequential reveal of the hero's own asset set — door,
 * youth photo, archival cutout, resume + SDG badge — settling on the
 * headline before handing off to the normal scattered hero collage
 * (which finishes its own entrance unseen behind this opaque overlay,
 * so there's no double-animation once it clears).
 */
export function HeroMorphIntro({ onComplete }: HeroMorphIntroProps) {
  const [stage, setStage] = useState<Stage>('door');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      onComplete();
      return;
    }

    let elapsed = 0;
    const schedule: [Stage, number][] = [
      ['youth', TIMINGS.door],
      ['newspaper', TIMINGS.youth],
      ['resumeSdg', TIMINGS.newspaper],
      ['text', TIMINGS.resumeSdg],
      ['exit', TIMINGS.text],
    ];

    const timers = schedule.map(([nextStage, delay]) => {
      elapsed += delay;
      return window.setTimeout(() => setStage(nextStage), elapsed);
    });
    // Fires 150ms before the exit fade visually finishes, so the hero
    // scatter items' own pop-in starts while the very tail of the text
    // fade-out is still on screen — no blank frame between the two.
    const doneTimer = window.setTimeout(onComplete, elapsed + TIMINGS.exit - 150);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const isExiting = stage === 'exit';

  return (
    <motion.div
      className="hero-morph-intro"
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: TIMINGS.exit / 1000, ease: 'easeInOut' }}
      style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
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
              transition={{ duration: 0.3, ease: EASE }}
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
              transition={{ duration: 0.3, ease: EASE }}
            />
          )}

          {stage === 'resumeSdg' && (
            <motion.div
              key="resumeSdg"
              className="hero-morph-pair"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.img
                src={resume}
                alt=""
                className="hero-morph-resume-img"
                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
              />
              <motion.img
                src={sdg10Badge}
                alt=""
                className="hero-morph-sdg"
                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.08, ease: EASE }}
              />
            </motion.div>
          )}

          {(stage === 'text' || stage === 'exit') && (
            <motion.div
              key="text"
              className="hero-morph-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="hero-morph-headline">
                <motion.span
                  initial={{ filter: 'blur(6px)', opacity: 0, y: 12 }}
                  animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  Indonesia Emas 2045?
                </motion.span>
              </div>
              <div className="hero-morph-subline">
                <motion.span
                  initial={{ filter: 'blur(6px)', opacity: 0, y: 12 }}
                  animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
                >
                  time is ticking..
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
