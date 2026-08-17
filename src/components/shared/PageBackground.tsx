import { useEffect, useRef, useState } from 'react';
import './pageBackground.css';

/** Must match the transition duration in pageBackground.css. Used only as
 * a fallback timer — see the note on `settle` below. */
const FADE_MS = 800;

interface PageBackgroundProps {
  /** Any valid CSS background value: a colour, or a full gradient. */
  background: string;
}

/**
 * The page ground, crossfaded between values by stacking two full-screen
 * layers and animating opacity — never by animating the background itself.
 *
 * That distinction is the whole reason this component exists. Browsers can
 * interpolate `background-color` between two solid colours, so a single
 * layer with a CSS transition looks fine as long as every value is a flat
 * colour — which is what this used to be. But gradients are not
 * interpolable: swap a `linear-gradient` for a `radial-gradient`, or even
 * change a stop, and the browser has no defined midpoint, so it snaps.
 * Fading one layer over another sidesteps that entirely: opacity is always
 * interpolable, whatever is painted underneath, and it composites on the
 * GPU rather than repainting each frame.
 *
 * Two layers, not a growing stack: the incoming value is painted on the
 * top layer at opacity 0, faded to 1, and then promoted to the bottom
 * layer so the top is free again for the next change.
 */
export function PageBackground({ background }: PageBackgroundProps) {
  const [base, setBase] = useState(background);
  const [incoming, setIncoming] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const settle = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (background === base) return;

    setIncoming(background);
    setVisible(false);

    // Two frames, not one. The incoming layer has to be painted at opacity
    // 0 before opacity 1 is set, or the browser coalesces both into a
    // single style change, sees no starting value to animate from, and
    // applies the result instantly — the exact hard cut this is meant to
    // avoid. One rAF queues the paint; the second runs after it.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setVisible(true));
    });

    // transitionend is the natural signal to promote the layer, but it
    // never fires when the transition is suppressed (reduced motion) or
    // when the tab is backgrounded mid-fade — which would strand the
    // component one change behind forever. This guarantees the promotion.
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      setBase(background);
      setIncoming(null);
      setVisible(false);
    }, FADE_MS + 60);

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [background, base]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  return (
    <div className="page-background" aria-hidden="true">
      <div className="page-background-layer" style={{ background: base }} />
      {incoming !== null && (
        <div
          className="page-background-layer page-background-layer--incoming"
          style={{ background: incoming, opacity: visible ? 1 : 0 }}
        />
      )}
    </div>
  );
}
