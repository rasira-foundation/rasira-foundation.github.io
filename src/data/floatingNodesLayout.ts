// Percentage-based positions for the content blocks in the floating
// program section. Adjust freely.

export const spokeNodes = {
  bullets: { top: 27, left: 41 },
  measure: { top: 40, left: 55 },
  design: { top: 57, left: 66 },
} as const;

export const collabPosition = { top: 68, left: 27 };

// A geometry anchor only — no hub mark renders here anymore. Kept purely
// so the single trajectory line (see FloatingNodes.tsx) still has a
// sensible endpoint to draw toward, matching where the old convergence
// point used to sit.
export const hubPosition = { top: 64, left: 49 };
