const PATTERNS = [
  `┌───┐     ┌───┐
│ □ │ ──▶ │ □ │
└───┘     └───┘
   │         │
   ▼         ▼
┌───┐     ┌───┐
│ □ │ ──▶ │ □ │
└───┘     └───┘`,
  `▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓░░░░░
▓▓▓▓▓▓▓░░░░░░░
▓▓▓▓▓░░░░░░░░░
▓▓▓░░░░░░░░░░░`,
  `    \\   |   /
     \\  |  /
 ─ ─ ─  *  ─ ─ ─
     /  |  \\
    /   |   \\`,
];

/** Picks a deterministic ASCII diagram for image-less article cards. */
export function getAsciiArt(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PATTERNS[hash % PATTERNS.length];
}
