// Percentage-based positions (mapped 1:1 onto an SVG viewBox="0 0 100 100")
// for the node network in the floating program section. Adjust freely —
// the dashed connector lines and dot markers recompute from these values.

export const hubPosition = { top: 64, left: 49 };

export const spokeNodes = {
  bullets: { top: 27, left: 41 },
  measure: { top: 40, left: 55 },
  design: { top: 57, left: 66 },
} as const;

export const collabPosition = { top: 68, left: 27 };
