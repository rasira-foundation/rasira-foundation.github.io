import { useEffect, useState } from 'react';
import './heroEyes.css';

/* Every photo in the eyes folder, picked up by the folder rather than
   imported by name. Adding or removing one needs no code change, which is
   the point — this is a set that will grow. `eager` so the URLs resolve at
   build time and Vite fingerprints them like any other asset. */
const MODULES = import.meta.glob('../../assets/photos/eyes/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

/* Sorted by path so the order is the filename order (eyes-01, -02, -03)
   rather than whatever order the glob happens to return. */
const EYES = Object.keys(MODULES)
  .sort()
  .map((k) => MODULES[k]);

/** How long each pair of eyes holds before the next fades in.
 *
 *  Down from 2600. The cycle needed to move quicker without any single pair
 *  becoming hard to take in, so most of the saving comes out of the CROSSFADE
 *  rather than out of this — see heroEyes.css, where the fade drops 0.9s to
 *  0.55s. Settled time, which is the part you actually look at, only falls
 *  from 1700ms to 1250ms while the loop gets a third shorter. */
const HOLD_MS = 1800;

/**
 * The strip of eyes set into the hero headline, between "who" and "they
 * could become". It cycles on its own, like a gif.
 *
 * The photos are cropped to the eye line at build time rather than framed
 * here with object-position. Cropping upstream means each file is a small
 * wide strip instead of a full portrait being mostly hidden, and the
 * framing is fixed rather than something that drifts whenever the strip's
 * proportions change.
 *
 * Cropping to the eyes also does something worth keeping: the photos stop
 * being portraits of identifiable people and become the thing the sentence
 * is about — looking, and being looked at.
 */
export function HeroEyes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (EYES.length < 2) return;
    /* Honoured here rather than only in CSS. A crossfade with the
       transition removed still swaps the photo abruptly every couple of
       seconds, which is the part that would bother someone who asked for
       less motion — so the cycle stops entirely instead. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % EYES.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  if (EYES.length === 0) return null;

  return (
    /* aria-hidden, and no alt text worth writing: the strip is a texture in
       the middle of a sentence, and a screen reader should read that
       sentence straight through rather than stopping to describe a
       photograph that carries no information of its own. */
    <span className="hero-eyes" aria-hidden="true">
      <span className="hero-eyes-paper" />
      {EYES.map((src, i) => (
        <img
          key={src}
          className={`hero-eyes-photo${i === index ? ' is-current' : ''}`}
          src={src}
          alt=""
          /* The first is the one on screen at load; the rest can wait. */
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </span>
  );
}
