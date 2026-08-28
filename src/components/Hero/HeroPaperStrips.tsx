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

/** The face the strips are typed in, and the longest a load is worth
 *  waiting for before starting anyway. */
const STRIP_FONT = "36px 'Square Peg'";
const FONT_WAIT_CAP_MS = 1200;

/**
 * Resolve once Square Peg can actually be drawn with.
 *
 * Without this the strips begin typing in the browser's default cursive —
 * Comic Sans, Apple Chancery, whatever the platform picks — and snap into
 * the handwriting face mid-sentence. The stylesheet asks for display=swap,
 * which is the right default everywhere else on this page, but it is
 * exactly wrong here: this text is ANIMATED, so the swap lands in the
 * middle of the animation and the letters already typed visibly change
 * shape. Nothing else on the page shows the difference so plainly, because
 * nothing else is being drawn a character at a time while the font arrives.
 *
 * It became visible after the move to rasira.foundation, and the domain is
 * the reason: Chrome partitions its HTTP cache by top-level site, so the
 * fonts that had been cached under the old origin were not reused under the
 * new one and every visit started cold again.
 *
 * Capped, because a font that never arrives must not hold the intro
 * hostage. Past the cap it types in the fallback, which is the behaviour we
 * have today — the cap can only make things better, never worse.
 */
async function waitForStripFont(): Promise<void> {
  if (!document.fonts?.check) return;
  /* POLLING check(), not awaiting load(). load() resolves immediately when
     no @font-face rule matches the family yet — and on this page that is
     the normal state at intro time, because the font stylesheet is fetched
     asynchronously (the media="print" swap in index.html) so the rule may
     not exist when this runs. Awaiting load() would therefore return at
     once and defeat the whole guard. check() answers the question actually
     being asked — can this be drawn with right now — and stays false until
     both the stylesheet and the file have arrived. */
  const deadline = performance.now() + FONT_WAIT_CAP_MS;
  while (!document.fonts.check(STRIP_FONT) && performance.now() < deadline) {
    await sleep(50);
  }
}

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
      /* Before the first character, not before each frame. The splash is
         still on screen at this point and its own hold overlaps the wait,
         so in the common case this costs no visible time at all. */
      await waitForStripFont();
      if (cancelled) return;

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
