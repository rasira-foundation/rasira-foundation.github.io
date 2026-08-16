import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './heroPaperStrips.css';

interface FrameLine {
  text: string;
  angle: number;
}

interface Frame {
  lines: FrameLine[];
}

// Only the one frame — the human-capital question, not the Indonesia
// Emas one. It's the more substantive of the two, so it gets the full
// intro slot rather than being cut for pace like the other questions
// were.
const FRAMES: Frame[] = [
  {
    lines: [
      { text: "What if human capital isn't", angle: -1.5 },
      { text: 'just about what they can do,', angle: 1 },
      { text: 'but what they believe is possible?', angle: -2 },
    ],
  },
];

const WORD_DELAY_MS = 95;
const LINE_DELAY_MS = 60;
// Longer hold than a short one-liner would need — this frame is 3 full
// lines, so it needs real time to sit and be read once fully typed, not
// just a punchy beat.
const FRAME_HOLD_MS = 1800;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface RenderedLine {
  text: string;
  showCursor: boolean;
}

interface HeroPaperStripsProps {
  /** Fires once, right after the single frame has held on screen. Drives
   * the parent's hand-off to the restored hero copy. */
  onCycleComplete: () => void;
}

/** Hand-typed "paper strip" lines — the whole intro overlay. Starts the
 * instant it's mounted, types out FRAMES' single question, then hands off
 * (via onCycleComplete) straight to the hero copy. */
export function HeroPaperStrips({ onCycleComplete }: HeroPaperStripsProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [renderedLines, setRenderedLines] = useState<RenderedLine[]>([]);

  useEffect(() => {
    // A local (non-state) counter drives the loop itself; state is only
    // ever set for rendering. Keeping the loop's control flow out of
    // React state means this effect only runs once per mount, and
    // behaves correctly under StrictMode's mount -> cleanup -> re-mount
    // double-invocation in development.
    let cancelled = false;
    let localFrameIndex = 0;
    let hasSignaledComplete = false;

    async function playSequence() {
      while (!cancelled) {
        const frame = FRAMES[localFrameIndex];
        setFrameIndex(localFrameIndex);
        const rendered: RenderedLine[] = frame.lines.map(() => ({ text: '', showCursor: false }));
        setRenderedLines([...rendered]);

        for (let i = 0; i < frame.lines.length; i++) {
          const words = frame.lines[i].text.split(' ');
          let currentText = '';

          for (let w = 0; w < words.length; w++) {
            if (cancelled) return;
            currentText += (w === 0 ? '' : ' ') + words[w];
            rendered[i] = { text: currentText, showCursor: true };
            setRenderedLines([...rendered]);
            await sleep(WORD_DELAY_MS);
          }

          if (i < frame.lines.length - 1) {
            rendered[i] = { ...rendered[i], showCursor: false };
            setRenderedLines([...rendered]);
          }
          await sleep(LINE_DELAY_MS);
        }

        await sleep(FRAME_HOLD_MS);
        if (cancelled) return;

        const wasLastFrame = localFrameIndex === FRAMES.length - 1;
        localFrameIndex = (localFrameIndex + 1) % FRAMES.length;
        if (wasLastFrame && !hasSignaledComplete) {
          hasSignaledComplete = true;
          onCycleComplete();
        }
      }
    }

    playSequence();

    return () => {
      cancelled = true;
    };
  }, [onCycleComplete]);

  const frame = FRAMES[frameIndex];

  return (
    <motion.div
      className="paper-strips"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {frame.lines.map((line, index) => {
        const rendered = renderedLines[index] || { text: '', showCursor: false };
        if (!rendered.text && !rendered.showCursor) return null;

        return (
          <div key={`${frameIndex}-${index}`} className="paper-strip" style={{ transform: `rotate(${line.angle}deg)` }}>
            {rendered.text}
            {rendered.showCursor && <span className="paper-strip-cursor">|</span>}
            <div className="paper-strip-grain" aria-hidden="true" />
          </div>
        );
      })}
    </motion.div>
  );
}
