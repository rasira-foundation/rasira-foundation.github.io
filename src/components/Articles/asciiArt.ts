/**
 * Placeholder diagrams for article cards that have no cover image.
 *
 * Two rules every pattern has to keep, because the grid depends on them:
 *
 * 1. EXACTLY 5 LINES. The card reserves that height, so a 4- or 6-line
 *    pattern makes one card in a row sit at a different height from its
 *    siblings.
 * 2. AT MOST ~16 COLUMNS. .article-card-ascii is `white-space: pre` with
 *    `overflow: hidden`, so anything wider is silently clipped at the card
 *    edge rather than wrapping — it just looks broken on narrow cards.
 *
 * Both are verified by a test rather than trusted; see asciiArt.test.ts.
 *
 * Subjects deliberately stay in the register the site is about — measuring,
 * mapping paths, reach, signal over time — rather than being decorative
 * shapes, so a card without a photo still reads as belonging here.
 */
const PATTERNS = [
  // Flow: one state handing off to another.
  `┌───┐     ┌───┐
│ □ │ ──▶ │ □ │
└───┘     └───┘
   │         │
   ▼         ▼`,

  // Gradient / dither: a distribution thinning out.
  `▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓░░░░░
▓▓▓▓▓▓▓░░░░░░░
▓▓▓▓▓░░░░░░░░░
▓▓▓░░░░░░░░░░░`,

  // Starburst: a single point radiating.
  `    \\   |   /
     \\  |  /
 ─ ─ ─  *  ─ ─ ─
     /  |  \\
    /   |   \\`,

  // Ascending bars: measurement over time.
  `        ▄ █
      ▄ █ █
    ▄ █ █ █
  ▄ █ █ █ █
──────────────`,

  // Scatter: observations against an axis.
  `│    ·   ·
│  ·   ·  ·
│ ·  ·   ·
│·   ·  ·
└─────────────`,

  // Branching: one route opening into several.
  `      ┌──────
      │
──────┼──────
      │
      └──────`,

  // Reach: a centre and the ring it touches.
  `    · · ·
  ·       ·
 ·    ●    ·
  ·       ·
    · · ·`,

  // Signal: change sampled across an interval.
  `·  ·  ·  ·  ·
 ╲╱ ╲╱ ╲╱ ╲╱
 ╱╲ ╱╲ ╱╲ ╱╲
·  ·  ·  ·  ·
──────────────`,

  // Network: nodes and the links between them.
  `  ○───────○
  │╲     ╱│
  │  ╲ ╱  │
  │  ╱ ╲  │
  ○───────○`,

  // Steps: progress reached in stages.
  `            ┌─
         ┌──┘
      ┌──┘
   ┌──┘
───┘`,
];

/** How many placeholder diagrams exist. Exported for the test. */
export const ASCII_PATTERN_COUNT = PATTERNS.length;

/**
 * Picks a deterministic ASCII diagram for image-less article cards.
 *
 * Deterministic on the slug rather than random: a card has to keep the same
 * diagram across re-renders and reloads, or it would flicker between shapes
 * whenever the grid re-renders (expanding See All, a background refresh of
 * the article list).
 */
export function getAsciiArt(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PATTERNS[hash % PATTERNS.length];
}
