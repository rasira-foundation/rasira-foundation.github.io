import './noiseOverlay.css';

const OPACITY = 0.22;
const FREQUENCY = 0.8;
const OCTAVES = 3;
const BLEND_MODE = 'difference';

/**
 * Full-viewport analog grain, sitting above every section's gradient/solid
 * fills. Static turbulence — no flicker animation, tuned and locked via the
 * (now removed) dev tuner panel.
 */
export function NoiseOverlay() {
  return (
    <div className="noise-overlay" style={{ opacity: OPACITY, mixBlendMode: BLEND_MODE }} aria-hidden="true">
      <div className="noise-overlay-grain">
        <svg width="100%" height="100%">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={FREQUENCY}
              numOctaves={OCTAVES}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix in="noise" type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
}
