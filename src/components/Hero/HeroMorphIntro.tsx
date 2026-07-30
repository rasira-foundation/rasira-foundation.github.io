import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import resume from '../../assets/photos/resume.png';
import thankYou from '../../assets/photos/thank-you.png';
import youthGroup from '../../assets/photos/youth.jpg';
import archivalCutout from '../../assets/photos/Graduate.jpg';
import './heroMorphIntro.css';

type Stage = 'thankYou' | 'youth' | 'newspaper' | 'resume';

// Now the second (and last) leg of the intro sequence — HeroPaperStrips
// plays first and alone, then hands off to this. Plays through once
// (~1.9s), holds briefly on resume, then calls onComplete itself
// (there's no HeroPaperStrips running alongside anymore to signal
// completion) so the parent can morph across into the real hero collage.
const TIMINGS = {
  thankYou: 700,
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
 * A cinematic, sequential reveal of the hero's own asset set —
 * thank-you note, youth photo, graduate portrait, resume — settling on
 * the resume and holding there briefly, before handing off (via
 * onComplete, fired a little ahead of its own exit fade finishing so the
 * incoming hero collage starts appearing while this is still dissolving —
 * a cross-fade "morph" rather than a hard cut) to the real scattered hero
 * collage underneath.
 */
export function HeroMorphIntro({ onComplete }: HeroMorphIntroProps) {
  const [stage, setStage] = useState<Stage>('thankYou');

  useEffect(() => {
    let elapsed = 0;
    const schedule: [Stage, number][] = [
      ['youth', TIMINGS.thankYou],
      ['newspaper', TIMINGS.youth],
      ['resume', TIMINGS.newspaper],
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
          {stage === 'thankYou' && (
            <motion.img
              key="thank-you"
              src={thankYou}
              alt=""
              className="hero-morph-image"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: EASE }}
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

          {stage === 'resume' && (
            <motion.img
              key="resume"
              src={resume}
              alt=""
              className="hero-morph-image hero-morph-resume-img"
              initial={{ opacity: 0, scale: 0.7, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
