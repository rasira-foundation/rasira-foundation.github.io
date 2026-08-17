import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import './pageBackground.css';

/**
 * How long the background takes to catch up to the scroll position.
 *
 * Deliberately NOT the shared SPRING_SECONDS the content reveals use, even
 * though both happen to be springs. They are different kinds of thing: a
 * reveal is a discrete animation with a start and an end, triggered once
 * when an element enters view. This is a FOLLOWER — it never starts or
 * finishes, it just trails a value that is itself changing continuously.
 * Tying them to one constant would mean retuning how the text appears in
 * order to change how closely the background tracks the scroll, which are
 * unrelated decisions. Shorter than the reveal spring so this reads as
 * tracking rather than lagging.
 */
const FOLLOW_SECONDS = 0.45;

/**
 * A single atmospheric wash.
 *
 * `range` is four points: fade in from → fully in → hold until → gone. The
 * two middle values are now equal or nearly so on every layer, which means
 * there is effectively NO hold — opacity is rising or falling at every
 * scroll position. Real plateaus were the reason the background could look
 * frozen mid-section: between two triggers there was genuinely nothing
 * changing. The four-point shape is kept because it is what lets
 * neighbouring layers overlap, each still fading out while the next fades
 * in.
 *
 * `y`, `scale` and `rotate` are the spatial motion: start/end pairs mapped
 * across the whole page, so the shape physically drifts, expands and turns
 * as you scroll rather than only changing strength.
 *
 * `float` is the ambient loop — a slow, time-based orbit that keeps the
 * layer alive while the page is stationary.
 */
interface WashLayer {
  id: string;
  range: [number, number, number, number];
  peak: number;
  /** Painted once as a static CSS background; motion is all transform. */
  background: string;
  y: [string, string];
  scale: [number, number];
  rotate: [number, number];
  float: { x: string[]; y: string[]; duration: number };
}

/**
 * PEAK STRENGTHS ARE LOW ON PURPOSE — this is the constraint that governs
 * this whole layer, not a matter of taste.
 *
 * The page is built from opaque panels that end at fixed document
 * positions: .pillars-grid, the image wrap's fill, the footer's blocks.
 * Any tint the ground carries is something those panels have an EDGE
 * against, and because they scroll while the washes do not, that edge
 * travels up the screen. Three separate rounds of "the background isn't
 * smooth" all traced back to exactly this. If a section genuinely needs a
 * visible colour of its own, it should paint it on ITSELF, where it can
 * fade at its own edges.
 *
 * Every layer is a TINT over the static base, never a replacement for it.
 * That is a safety property: scroll-derived values only advance while
 * scroll and rAF run, and this codebase has already shipped a bug where a
 * frozen one left the page's colour stuck and broke contrast. Here a
 * frozen value means a tint sits at some strength — the page underneath is
 * still the static page colour, so text contrast never depends on scroll
 * being live.
 */
const LAYERS: WashLayer[] = [
  {
    id: 'dawn',
    /* Starts at ZERO, not at peak. The first two points used to both be 0,
       which meant this wash was already at full strength on the very first
       painted frame — the colour was simply present at the top of the page
       rather than arriving, so there was nothing to see when you began
       scrolling. Fading in across the first 7% gives it an entrance, and
       the y drift and scale below run through the same stretch, so it
       floats up into place as it appears rather than switching on. */
    range: [0, 0.07, 0.14, 0.46],
    peak: 0.16,
    background:
      'radial-gradient(circle at 50% 30%, rgba(193, 208, 223, 0.5) 0%, rgba(var(--color-page-rgb), 0) 68%)',
    /* -20%, not further, and scale never below 1. The entry travel is
       bounded by the layer's own oversize: at the start of the range the
       scale is at its smallest, so that is where the element covers least,
       and a bigger negative y there pulls its bottom edge up INTO the
       viewport. -32% with scale 0.92 did exactly that (bottom edge 161px
       inside the frame). These are the largest values that still cover at
       every point in the range. */
    y: ['-20%', '24%'],
    scale: [1, 1.5],
    rotate: [0, 16],
    float: { x: ['0%', '6%', '-4%', '0%'], y: ['0%', '-5%', '4%', '0%'], duration: 19 },
  },
  {
    id: 'depth',
    range: [0.16, 0.5, 0.5, 0.9],
    peak: 0.12,
    background:
      'radial-gradient(circle at 58% 45%, rgba(211, 206, 194, 0.55) 0%, rgba(var(--color-page-rgb), 0) 70%)',
    y: ['-26%', '22%'],
    scale: [1.05, 1.55],
    rotate: [0, -19],
    float: { x: ['0%', '-7%', '5%', '0%'], y: ['0%', '4%', '-6%', '0%'], duration: 26 },
  },
  {
    id: 'dusk',
    range: [0.54, 1, 1, 1],
    peak: 0.16,
    background:
      'radial-gradient(circle at 42% 62%, rgba(233, 168, 120, 0.42) 0%, rgba(var(--color-page-rgb), 0) 70%)',
    y: ['-22%', '26%'],
    scale: [1.1, 1.6],
    rotate: [0, 13],
    float: { x: ['0%', '5%', '-6%', '0%'], y: ['0%', '-6%', '3%', '0%'], duration: 23 },
  },
];

/**
 * One layer's own hooks. Split into a component rather than looped inside
 * the parent so the number of washes can change without breaking React's
 * rule that hook order stays stable across renders.
 *
 * TWO nested elements, and the split is required rather than tidy. Framer
 * writes the whole `transform` property on any element it animates, so the
 * scroll-driven y/scale/rotate and the ambient x/y loop cannot share a
 * node — whichever wrote last would erase the other. Outer takes scroll,
 * inner takes the idle orbit, and the browser composes the two.
 */
function Wash({
  layer,
  progress,
  active,
  still,
}: {
  layer: WashLayer;
  progress: MotionValue<number>;
  active: boolean;
  still: boolean;
}) {
  const scrolled = useTransform(progress, layer.range, [0, layer.peak, layer.peak, 0]);
  // Held at zero until the page's own content has mounted, so the
  // atmosphere never paints ahead of the hero it belongs to.
  const opacity = useTransform(scrolled, (v) => (active ? v : 0));

  const y = useTransform(progress, [0, 1], layer.y);
  const scale = useTransform(progress, [0, 1], layer.scale);
  const rotate = useTransform(progress, [0, 1], layer.rotate);

  return (
    <motion.div className="page-background-layer" style={{ opacity, y, scale, rotate }}>
      <motion.div
        className="page-background-float"
        style={{ background: layer.background }}
        animate={still ? { x: '0%', y: '0%' } : { x: layer.float.x, y: layer.float.y }}
        transition={
          still
            ? { duration: 0 }
            : {
                duration: layer.float.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                // The keyframe arrays open and close on 0%, so the loop
                // joins back onto itself with no jump at the seam.
                times: [0, 0.33, 0.66, 1],
              }
        }
      />
    </motion.div>
  );
}

/**
 * The page ground: a static base plus scroll-linked atmospheric washes.
 *
 * Motion here is transform-based, not paint-based. An earlier version
 * interpolated the radial's own `circle at x% y%` through a motion
 * template — that does move the gradient, but it re-rasterises it every
 * frame, so the layer can never be handed to the compositor. Painting each
 * gradient once and moving the element with y/scale/rotate is both the
 * larger motion and the cheaper one.
 */
export function PageBackground({ active = true }: { active?: boolean }) {
  const { scrollYProgress } = useScroll();
  /* The ambient orbit runs with no user input, so it is exactly the kind
     of motion someone asking for less of it means. It has to be stopped
     HERE rather than in CSS: the global reduced-motion rule in index.css
     collapses animation-duration, which reaches CSS animations only —
     this loop is driven by Framer in JavaScript and would sail straight
     past it. The scroll-driven transforms are left alone; they only move
     when the user does. */
  const still = useReducedMotion() ?? false;

  /* Spring-smoothed, and this is what makes it feel continuous.
   *
   * Raw scrollYProgress is a continuous function of position but only
   * UPDATES when a scroll event fires, and those arrive in chunks — a
   * wheel notch is ~100px in one event. Driving anything straight off it
   * steps once per event, which reads as snapping even with no state
   * involved. The spring keeps integrating every frame toward the latest
   * value, so the background moves on every painted frame instead.
   *
   * restDelta is small because this drives opacity as well as transform:
   * the spring has to keep resolving well past where a positional
   * animation would be considered settled, or the last of a fade stops
   * short of its endpoint. */
  const progress = useSpring(scrollYProgress, {
    duration: FOLLOW_SECONDS,
    bounce: 0,
    restDelta: 0.0002,
  });

  return (
    <div className="page-background" aria-hidden="true">
      <div className="page-background-base" />
      {LAYERS.map((layer) => (
        <Wash key={layer.id} layer={layer} progress={progress} active={active} still={still} />
      ))}
    </div>
  );
}
