export interface ScatterItem {
  id: string;
  kind: 'image' | 'quote' | 'label';
  top: string;
  left: string;
  rotate: number;
  depth: number; // 0 (far/slow) .. 1 (near/fast) — drives parallax + entry order
  zIndex: number;
  width?: string;
  src?: string;
  alt?: string;
  text?: string;
}

// Empty — the resting hero view is just the full-bleed photo background
// (see .hero-bg-canvas in narrativeHero.css) and the knockout title text,
// no paper-cutout collage on top of it.
export const heroScatter: ScatterItem[] = [];
