import { motion, useMotionTemplate, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import './pageBackground.css';

/**
 * A single atmospheric wash. Positions are fractions of total page scroll.
 *
 * `range` is four points, not two: fade in from → fully in → hold until →
 * gone. Splitting the hold out from the fades is what lets neighbouring
 * layers OVERLAP — each one is still fading out while the next is already
 * fading in, so there is never a scroll position where one layer hands
 * over to another in a single frame. That overlap is the buffer that
 * removes the snap.
 *
 * `from`/`to` are the radial's centre at scroll 0 and scroll 1. The centre
 * is interpolated continuously, so the gradient drifts across the viewport
 * as you scroll instead of sitting still and merely changing strength.
 */
interface WashLayer {
  id: string;
  range: [number, number, number, number];
  peak: number;
  color: string;
  size: string;
  from: [string, string];
  to: [string, string];
}

/**
 * Every layer is a TINT over the static base, never a replacement for it.
 *
 * That is a deliberate safety property, not a stylistic one. Scroll-derived
 * values only advance while scroll and rAF actually run, and this codebase
 * has already shipped a bug where a frozen one left the page's colour stuck
 * and broke contrast for whatever was on screen. Here, a frozen value means
 * a tint sits at whatever strength it had — the page underneath is still
 * the static page colour, so text contrast can never depend on the scroll
 * position being live.
 *
 * Ranges deliberately overlap, and the hold sections are kept short: dawn
 * is still fading out at 0.42 while depth has been fading in since 0.18,
 * and depth runs to 0.88 while dusk starts at 0.58. With the fades this
 * long and the holds this brief, almost every scroll position falls inside
 * at least one active ramp — so there is essentially no stretch of the page
 * where the background is static and then suddenly is not.
 */
const LAYERS: WashLayer[] = [
  {
    id: 'dawn',
    range: [0, 0, 0.1, 0.42],
    peak: 0.5,
    color: 'rgba(193, 208, 223, 0.5)',
    size: '90vmax',
    from: ['50%', '4%'],
    to: ['38%', '26%'],
  },
  {
    id: 'depth',
    range: [0.18, 0.45, 0.55, 0.88],
    peak: 0.45,
    color: 'rgba(211, 206, 194, 0.55)',
    size: '100vmax',
    from: ['62%', '30%'],
    to: ['40%', '70%'],
  },
  {
    id: 'dusk',
    range: [0.58, 0.92, 1, 1],
    peak: 0.5,
    color: 'rgba(233, 168, 120, 0.42)',
    size: '110vmax',
    from: ['34%', '80%'],
    to: ['58%', '52%'],
  },
];

/**
 * One layer's own hooks. Split into a component rather than looped inside
 * the parent so the number of washes can change without breaking React's
 * rule that hook order stays stable across renders.
 */
function Wash({
  layer,
  progress,
  active,
}: {
  layer: WashLayer;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const scrolled = useTransform(progress, layer.range, [0, layer.peak, layer.peak, 0]);
  // Held at zero until the page's own content has mounted. Without this the
  // washes are the first thing on screen — they need no data and no layout,
  // so they paint while the hero is still resolving, and the atmosphere
  // arrives before the thing it is supposed to be atmosphere FOR.
  const opacity = useTransform(scrolled, (v) => (active ? v : 0));
  const x = useTransform(progress, [0, 1], [layer.from[0], layer.to[0]]);
  const y = useTransform(progress, [0, 1], [layer.from[1], layer.to[1]]);

  // The gradient string itself is rebuilt from motion values every frame,
  // which is what animates the radial's position. Ending on the page
  // colour at zero alpha rather than `transparent` matters: browsers
  // interpolate `transparent` through transparent BLACK, which would put a
  // grey cast through the falloff.
  const background = useMotionTemplate`radial-gradient(circle ${layer.size} at ${x} ${y}, ${layer.color} 0%, rgba(var(--color-page-rgb), 0) 70%)`;

  return <motion.div className="page-background-layer" style={{ background, opacity }} />;
}

/**
 * The page ground: a static base plus scroll-linked atmospheric washes.
 *
 * This replaces a discrete version that watched sections with an
 * IntersectionObserver and crossfaded between fixed values on a state
 * change. That approach could only ever step between states — the fade was
 * smooth, but it started when a boundary was crossed and ran on its own
 * clock, so it never corresponded to where you actually were on the page.
 * Driving opacity and gradient position straight off scrollYProgress means
 * the background is a continuous function of scroll position: scrub
 * backwards and it retraces exactly, stop halfway and it holds halfway.
 *
 * Opacity is still what animates, never the gradient property — gradients
 * are not interpolable, so stacking and fading remains the only approach
 * that does not snap.
 */
interface PageBackgroundProps {
  /** False until the main content has mounted; holds the washes at zero so
   * they never paint ahead of the hero. The static base underneath is
   * unaffected and always paints, so the page is never blank. */
  active?: boolean;
}

export function PageBackground({ active = true }: PageBackgroundProps) {
  const { scrollYProgress } = useScroll();

  /* Spring-smoothed, and this is what actually makes it feel continuous.
   *
   * Raw scrollYProgress is already a continuous function of position, but
   * it only UPDATES when a scroll event fires — and those arrive in
   * chunks, not per pixel. A mouse wheel notch jumps ~100px in one event;
   * a trackpad flick delivers coarse deltas too. Mapping opacity straight
   * off that steps the background once per event, which reads as snapping
   * even though nothing is state-driven.
   *
   * Passing it through a spring decouples the animation from the event
   * rate: the spring keeps integrating every frame toward the latest
   * scroll value, so the background moves on every painted frame rather
   * than only on the ones where a scroll event happened. Low stiffness
   * and high damping give a slow, non-springy follow — this should trail
   * the scroll slightly, not bounce past it.
   *
   * restDelta is small because these drive opacity: the spring has to
   * keep resolving well past the point where a positional animation would
   * be considered settled, or the last fraction of a fade stops short. */
  const progress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 26,
    restDelta: 0.0002,
  });

  return (
    <div className="page-background" aria-hidden="true">
      <div className="page-background-base" />
      {LAYERS.map((layer) => (
        <Wash key={layer.id} layer={layer} progress={progress} active={active} />
      ))}
    </div>
  );
}
