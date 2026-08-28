import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { agencySpectrum } from '../../data/siteContent';
import { IN_VIEW, SPRING } from '../../lib/motion';
import { track } from '../../lib/analytics';
import './agencyWheel.css';

/* ── GEOMETRY ──
   Two configurations, not one with tweaks. Desktop draws a half circle;
   below 860px it becomes a full one. That cannot live in CSS: the arcs, the
   wedges and the label rails are all path data generated here, so the
   breakpoint has to reach JavaScript.

   Both use a FIXED viewBox, unlike FrameworkLoop's measured one. That
   component spanned a variable width and would have needed
   preserveAspectRatio="none" to fill it, which stretches curves into
   ellipses. A radial figure wants uniform scaling, which is what the default
   preserveAspectRatio already does.

   Each coordinate space is sized near the dial's real rendered width, so one
   user unit is roughly one pixel. That is not cosmetic: the arc labels are
   set in this space, and in a much larger viewBox every font size has to be
   inflated to survive the scale-down, which makes the numbers unreasonable
   to work with.

   WEDGES, not annuli — the blades run to a point rather than stopping at an
   inner ring, which is what lets the dark core read as an ambient well
   bleeding out of the centre rather than as a drawn hole. */
type Geom = {
  cx: number;
  cy: number;
  r: number;
  viewW: number;
  viewH: number;
  /** Angle the first blade starts at, degrees, maths convention. */
  start: number;
  /** Total sweep, clockwise on screen. 180 for the half, 360 for the full. */
  sweep: number;
  levelR: number;
  titleR: number;
  coreR: number;
  wordY: number;
  noteY: number;
};

const HALF: Geom = {
  cx: 334,
  cy: 334,
  r: 300,
  viewW: 668,
  viewH: 344,
  start: 180,
  sweep: 180,
  /* The label rails. The LONGER text goes on the LONGER arc: the questions
     run up to 23 characters and no title exceeds 19, so questions take the
     outer rail and titles the inner.

     levelR sits 14 units off the rim. That gap is the widest thing in the
     drawing — the labels ride outside the arc — so it, not the fan, sets how
     much of the viewBox the fan can occupy; keeping it tight is what lets
     the figure render large. titleR sits at 240 rather than mid-blade
     because the core gradient covers the inner third, so the colour a reader
     actually sees spans roughly 140..300. */
  levelR: 314,
  titleR: 240,
  coreR: 168,
  wordY: -74,
  noteY: -44,
};

/* The full circle gives each blade 90 degrees instead of 45, so the rails
   are twice as long and the labels sit easily. It also uses a phone's
   vertical space, which a 2:1 half circle cannot. */
const FULL: Geom = {
  cx: 282,
  cy: 282,
  r: 250,
  viewW: 564,
  viewH: 564,
  /* Starts at twelve o'clock and runs clockwise, so the four blades read in
     order from the top the way a dial is read. */
  start: 90,
  sweep: 360,
  levelR: 264,
  titleR: 185,
  coreR: 140,
  /* Centred in the disc rather than hung above a flat base. */
  wordY: -6,
  noteY: 20,
};

const COMPACT_QUERY = '(max-width: 860px)';

function useGeom(): Geom {
  /* Read synchronously in the initialiser rather than in an effect, so the
     first paint already has the right shape. An effect would render the half
     circle and swap it a frame later, which is visible. */
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(mq.matches);
    update();
    /* A window resize listener as well as the media query listener,
       deliberately. The `change` event does not fire under Chrome's device
       emulation, so the shape stayed a full circle after resizing back to a
       desktop width even though mq.matches had correctly flipped to false —
       caught while verifying this. A plain resize listener covers that, and
       the two are idempotent so double-firing costs nothing. Same fallback
       the loop component needed for ResizeObserver. */
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return compact ? FULL : HALF;
}

const polar = (g: Geom, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 100) / 100;
  return [round(g.cx + r * Math.cos(rad)), round(g.cy - r * Math.sin(rad))] as const;
};

/** A pie wedge from the centre. a0 is the larger angle, so a0 -> a1 runs
 *  clockwise on screen, hence sweep 1. largeArc is set for spans over 180,
 *  which the full circle's blades never are but a future one might be. */
function wedge(g: Geom, a0: number, a1: number, radius = g.r) {
  const [x0, y0] = polar(g, radius, a0);
  const [x1, y1] = polar(g, radius, a1);
  const largeArc = Math.abs(a0 - a1) > 180 ? 1 : 0;
  return `M ${g.cx} ${g.cy} L ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1} Z`;
}

/** The invisible rail a label is set along.
 *
 *  Flipped for blades whose midpoint sits below the horizon. Text follows a
 *  path's direction, so on the bottom of a circle a clockwise rail runs
 *  right to left and the label comes out upside down. Drawing that rail
 *  counter-clockwise instead puts it the right way up. The radius is nudged
 *  outward when flipped because the glyphs then grow toward the centre
 *  rather than away from it, and these labels belong outside the rim. */
function labelArc(g: Geom, a0: number, a1: number, radius: number, flip: boolean, lift = 0) {
  if (!flip) {
    const [x0, y0] = polar(g, radius, a0);
    const [x1, y1] = polar(g, radius, a1);
    return `M ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1}`;
  }
  const rr = radius + lift;
  const [x0, y0] = polar(g, rr, a1);
  const [x1, y1] = polar(g, rr, a0);
  return `M ${x0} ${y0} A ${rr} ${rr} 0 0 0 ${x1} ${y1}`;
}

/* ── PALETTE ──
   The site's own sky, read as dawn to dusk. The ordering is the component's
   argument rather than decoration: agency moves from inside the person
   ("can I?") outward into the world ("does the world respond?"), so the ramp
   runs warm and close to cool and distant. Two of these are already global
   tokens; the other two are lifted from ProductionGradient3D's stops, which
   is where this ramp actually lives. Kept local because they are one
   component's reading of an existing palette, not four new site colours. */
const BLADE = ['#d99b73', '#e8c19f', '#cddbe5', '#a4b4c4'];

export function AgencyWheel() {
  const g = useGeom();
  const isFull = g.sweep === 360;
  const [activeId, setActiveId] = useState(agencySpectrum.levels[0].id);

  /* The reveal is state-driven rather than a bare whileInView, for two
     reasons.
     
     FAILSAFE. The initial clip hides all but the core, and Framer writes it
     as an inline custom property that the stylesheet's fallback cannot beat.
     So if the reveal never runs — an IntersectionObserver that does not
     fire, an animation frame loop that never ticks — the dial would sit
     permanently clipped to a stub, which is worse than no animation at all.

     The timer therefore drops the clip through a CLASS rather than by
     animating to the end value. Animating would be no protection: it needs
     the same frame loop that may be the thing that failed, which is exactly
     what was observed while building this — the timer fired, the state
     changed, and the clip stayed at 24% because no frames were being
     served. A class setting clip-path:none needs nothing but the cascade.

     ONCE, not every entry. The rest of the page re-runs its reveals on each
     scroll-by, but those are fades; this is a wipe across the whole figure,
     and a diagram that redraws itself every time it passes the viewport
     reads as a glitch rather than as craft. */
  const [revealed, setRevealed] = useState(false);
  const [revealFailsafe, setRevealFailsafe] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setRevealFailsafe(true), 3500);
    return () => window.clearTimeout(id);
  }, []);
  const active = agencySpectrum.levels.find((l) => l.id === activeId)!;
  const activeIndex = agencySpectrum.levels.findIndex((l) => l.id === activeId);
  const span = g.sweep / agencySpectrum.levels.length;

  const [fanLeftX] = polar(g, g.r, 180);
  const [fanRightX] = polar(g, g.r, 0);

  return (
    <motion.div
      className={`agency-wheel${isFull ? ' agency-wheel--full' : ''}`}
      /* Objects rather than variant labels. A child using labels inherits
         them from any animating motion ancestor, which is what silently
         froze body copy elsewhere in this codebase. */
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={IN_VIEW}
      transition={SPRING}
      style={{ ['--blade-active' as string]: BLADE[activeIndex] }}
    >
      {/* Three centred rows beneath the dial, anchoring the wheel. aria-live
          so keyboard and screen-reader users hear what changed as focus
          crosses the blades, instead of the readout updating silently. */}
      <div className="agency-wheel-readout" aria-live="polite">
        <p className="agency-readout-eyebrow">{active.question}</p>
        <h3 className="agency-readout-title">{active.title}</h3>
        <ul className="agency-readout-levers">
          {active.levers.map((lever) => (
            <li key={lever} className="agency-lever">
              {lever}
            </li>
          ))}
        </ul>
      </div>

      {/* The reveal wipes outward from the core rather than fading the whole
          figure in. It sits on the CONTAINER, not on the SVG, because the
          full circle's colour is a CSS conic layer behind the SVG — an SVG
          mask would leave that layer untouched and the wipe would only
          apply to half the drawing. A clip-path on the wrapper catches both.

          It starts at 24% rather than 0 so the core is already inside the
          circle on the first frame: "Agency" reads immediately and the
          spectrum grows out from under it, which is the order asked for. A
          wipe from nothing would instead reveal the word a sliver at a time,
          which looks like a loading bar rather than a diagram drawing
          itself.

          The origin differs by shape — the half circle's centre is at its
          flat base, the full circle's is the middle of the box — so it is a
          variable set per breakpoint in the stylesheet. */}
      <motion.div
        className={`agency-wheel-dial${revealFailsafe ? ' is-reveal-failsafe' : ''}`}
        initial={{ ['--reveal' as string]: '24%' }}
        animate={{ ['--reveal' as string]: revealed ? '125%' : '24%' }}
        onViewportEnter={() => setRevealed(true)}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        {/* The full circle's colour is a CONIC gradient, and it has to be a
            CSS one on an element behind the SVG, because SVG has no conic
            gradient of its own. It cannot be the linear gradient the half
            circle uses either: there the blades run left to right so a
            horizontal ramp lands on them in order, but around a circle the
            blades are quadrants and a horizontal ramp would put the coolest
            colour on the second blade and the warmest on the fourth,
            reversing the argument the palette is making. */}
        {isFull && <div className="agency-wheel-conic" aria-hidden="true" />}

        <svg
          className="agency-wheel-svg"
          viewBox={`0 0 ${g.viewW} ${g.viewH}`}
          role="group"
          aria-label="Agency spectrum: four levels running from capability beliefs to standing"
        >
          <defs>
            {!isFull && (
              /* One continuous sky across the whole fan rather than four
                 banded fills. The blades are told apart by their labels and
                 their hover state, not by hard colour edges, which is what
                 keeps this reading as a spectrum rather than a pie chart.
                 Anchored to the fan's real extremes in user space so the ramp
                 lands identically at every size. */
              <linearGradient
                id="agency-sky"
                gradientUnits="userSpaceOnUse"
                x1={fanLeftX}
                y1={0}
                x2={fanRightX}
                y2={0}
              >
                {BLADE.map((c, i) => (
                  <stop key={c} offset={i / (BLADE.length - 1)} stopColor={c} />
                ))}
              </linearGradient>
            )}

            {/* The ambient well. The page is almost entirely white, so this
                deep core is the one high-contrast moment in the section. It
                fades to nothing rather than ending on an edge, so it reads as
                depth under the dial and not as a shape sitting on top. */}
            <radialGradient id="agency-core" gradientUnits="userSpaceOnUse" cx={g.cx} cy={g.cy} r={g.coreR}>
              <stop offset="0" stopColor="#14120f" stopOpacity="0.97" />
              <stop offset="0.5" stopColor="#1a1714" stopOpacity="0.9" />
              <stop offset="1" stopColor="#2b2621" stopOpacity="0" />
            </radialGradient>

            <clipPath id="agency-clip">
              {isFull ? (
                <circle cx={g.cx} cy={g.cy} r={g.r} />
              ) : (
                <path d={wedge(g, g.start, g.start - g.sweep)} />
              )}
            </clipPath>
          </defs>

          <g clipPath="url(#agency-clip)">
            {!isFull && <path d={wedge(g, g.start, g.start - g.sweep)} fill="url(#agency-sky)" />}

            {/* Scrims above the colour, below the core: inactive blades wash
                out toward the page while the active one holds full colour.
                This is the reaction — the dial visibly resolves around
                whichever level is being read. */}
            {agencySpectrum.levels.map((lvl, i) => (
              <path
                key={`scrim-${lvl.id}`}
                className={`agency-scrim${lvl.id === activeId ? ' is-active' : ''}`}
                d={wedge(g, g.start - i * span, g.start - (i + 1) * span)}
              />
            ))}

            <circle cx={g.cx} cy={g.cy} r={g.coreR * 2} fill="url(#agency-core)" pointerEvents="none" />
          </g>

          <text className="agency-core-word" x={g.cx} y={g.cy + g.wordY} textAnchor="middle">
            {agencySpectrum.centerLabel}
          </text>
          {/* One <text> with tspans, and the line gap in EM rather than user
              units. The note's size changes between breakpoints, and a fixed
              unit gap that looked right at one size collapsed into the line
              above it at another. */}
          <text className="agency-core-note" x={g.cx} y={g.cy + g.noteY} textAnchor="middle">
            {agencySpectrum.centerNote.map((line, i) => (
              <tspan key={line} x={g.cx} dy={i === 0 ? 0 : '1.4em'}>
                {line}
              </tspan>
            ))}
          </text>

          {/* Hit areas and labels last, so nothing painted above can steal
              the pointer from them. */}
          {agencySpectrum.levels.map((lvl, i) => {
            const a0 = g.start - i * span;
            const a1 = g.start - (i + 1) * span;
            const mid = (a0 + a1) / 2;
            /* Below the horizon the label has to be drawn along a reversed
               rail or it comes out upside down. */
            const flip = Math.sin((mid * Math.PI) / 180) < 0;
            const isActive = lvl.id === activeId;
            return (
              <g
                key={lvl.id}
                className={`agency-blade${isActive ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${lvl.title}: ${lvl.question}`}
                aria-pressed={isActive}
                /* Hover changes the blade but is NOT reported. Sweeping a
                   cursor across the dial would fire a dozen events in a
                   second and drown the deliberate picks in noise, while
                   telling you nothing about intent. Only a click or a
                   keyboard activation counts as someone choosing to read a
                   level. */
                onMouseEnter={() => setActiveId(lvl.id)}
                onFocus={() => setActiveId(lvl.id)}
                onClick={() => {
                  track('framework_level_select', {
                    level_title: lvl.title,
                    level_question: lvl.question,
                    method: 'click',
                  });
                  setActiveId(lvl.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    track('framework_level_select', {
                      level_title: lvl.title,
                      level_question: lvl.question,
                      method: 'keyboard',
                    });
                    setActiveId(lvl.id);
                  }
                }}
              >
                <path className="agency-hit" d={wedge(g, a0, a1)} />
                <path id={`agency-level-${lvl.id}`} d={labelArc(g, a0, a1, g.levelR, flip, 20)} fill="none" />
                <path id={`agency-title-${lvl.id}`} d={labelArc(g, a0, a1, g.titleR, flip, 14)} fill="none" />
                <text className="agency-blade-level">
                  <textPath href={`#agency-level-${lvl.id}`} startOffset="50%" textAnchor="middle">
                    {lvl.question}
                  </textPath>
                </text>
                <text className="agency-blade-title">
                  <textPath href={`#agency-title-${lvl.id}`} startOffset="50%" textAnchor="middle">
                    {lvl.title}
                  </textPath>
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}
