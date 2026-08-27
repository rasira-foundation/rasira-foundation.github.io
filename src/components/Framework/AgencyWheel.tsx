import { useState } from 'react';
import { motion } from 'framer-motion';
import { agencySpectrum } from '../../data/siteContent';
import { IN_VIEW, SPRING } from '../../lib/motion';
import './agencyWheel.css';

/* ── GEOMETRY ──
   A fixed viewBox, unlike FrameworkLoop's measured one. That component
   spanned a variable width and would have needed preserveAspectRatio="none"
   to fill it, which stretches curves into ellipses. This is a radial figure:
   it wants uniform scaling, which is exactly what the default
   preserveAspectRatio already does, so a fixed coordinate space is both
   correct and simpler.

   The coordinate space is sized close to the dial's real rendered width on
   desktop, so one user unit is roughly one pixel. That is not cosmetic: the
   arc labels are set in this space, and in a much larger viewBox every font
   size has to be inflated to survive the scale-down, which makes the numbers
   impossible to reason about.

   A WEDGE, not an annulus — the blades run to a point rather than stopping
   at an inner ring, which is what lets the dark core read as an ambient well
   bleeding out of the apex instead of as a drawn hole. */
const CX = 352;
const CY = 356;
const R = 300;
const VIEW_W = 704;
const VIEW_H = 374;

/** A true half circle: the blades fan across the full 180 degrees and the
 *  figure closes on a flat horizontal diameter. */
const START = 180;
const END = 0;
const SPAN = (START - END) / agencySpectrum.levels.length;

/* Two concentric label rails. The LONGER text goes on the LONGER arc: the
   questions run up to 23 characters while no title exceeds 19, so questions
   take the outer rail and titles the inner one.

   Both radii are derived from the longest label rather than chosen by eye.
   Across a half circle each segment is 45 degrees, giving an arc of
   0.785 * radius — half again the room of the 136-degree fan this replaced,
   which is why the labels sit comfortably now. Plex Mono advances about
   0.6em per glyph, so the outer rail clears 23 chars ("DOES THE WORLD
   RESPOND?") at 338 (265 units) and the inner clears 19 ("Pathways &
   volition") at 250 (196 units). Change a question or a title and these
   want rechecking — measure getComputedTextLength against getTotalLength.

   Concentric arcs rather than the reference's radial inner labels: at these
   angles radial text either runs upside down on the left of the fan or has
   to flip halfway across, and both read as mistakes rather than as design. */
const LEVEL_R = 338;
const TITLE_R = 250;

/** Depth of the ambient core, in the same units. */
const CORE_R = 168;

/** Rounded to 2dp. sin(180 degrees) is 1.2e-16 rather than 0 in floating
 *  point, so the flat diameter would otherwise emit a y of
 *  355.99999999999994 into the path data. Visually identical, but it makes
 *  the geometry unreadable when inspecting the DOM. */
function pt(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 100) / 100;
  return [round(CX + r * Math.cos(rad)), round(CY - r * Math.sin(rad))] as const;
}

/** A pie wedge from the apex. a0 is the larger (leftmost) angle, so a0 -> a1
 *  runs clockwise on screen, hence sweep 1. */
function wedge(a0: number, a1: number, radius = R) {
  const [x0, y0] = pt(radius, a0);
  const [x1, y1] = pt(radius, a1);
  return `M ${CX} ${CY} L ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1} Z`;
}

/** The invisible rail a label is set along, left to right. */
function arc(a0: number, a1: number, radius: number) {
  const [x0, y0] = pt(radius, a0);
  const [x1, y1] = pt(radius, a1);
  return `M ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1}`;
}

/* ── PALETTE ──
   The site's own sky, read left to right as dawn to dusk. The ordering is
   the component's argument rather than decoration: agency moves from inside
   the person ("can I?") outward into the world ("does the world respond?"),
   so the ramp runs warm and close to cool and distant. Two of these are
   already global tokens; the other two are lifted from ProductionGradient3D's
   stops, which is where this ramp actually lives. Kept local because they are
   one component's reading of an existing palette, not four new site colours. */
const BLADE = ['#d99b73', '#e8c19f', '#cddbe5', '#a4b4c4'];

export function AgencyWheel() {
  const [activeId, setActiveId] = useState(agencySpectrum.levels[0].id);
  const active = agencySpectrum.levels.find((l) => l.id === activeId)!;
  const activeIndex = agencySpectrum.levels.findIndex((l) => l.id === activeId);

  const [fanLeftX] = pt(R, START);
  const [fanRightX] = pt(R, END);

  return (
    <motion.div
      className="agency-wheel"
      /* Objects rather than variant labels. A child using labels inherits
         them from any animating motion ancestor, which is what silently
         froze body copy elsewhere in this codebase. */
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={IN_VIEW}
      transition={SPRING}
      style={{ ['--blade-active' as string]: BLADE[activeIndex] }}
    >
      {/* aria-live so keyboard and screen-reader users hear what changed as
          focus crosses the dial, instead of the readout updating silently. */}
      <div className="agency-wheel-readout" aria-live="polite">
        <p className="agency-readout-eyebrow">{active.question}</p>
        <h3 className="agency-readout-title">{active.title}</h3>
        <ul className="agency-readout-levers">
          {active.levers.map((lever) => (
            <li key={lever}>{lever}</li>
          ))}
        </ul>
      </div>

      <div className="agency-wheel-dial">
        <svg
          className="agency-wheel-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="group"
          aria-label="Agency spectrum: four levels running from capability beliefs to standing"
        >
          <defs>
            {/* One continuous sky across the whole fan rather than four
                banded fills. The blades are told apart by their labels and
                their hover state, not by hard colour edges — which is what
                keeps this reading as a spectrum rather than as a pie chart.
                Anchored to the fan's actual left and right extremes in user
                space so the ramp lands identically at every size. */}
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

            {/* The ambient well. The page is almost entirely white, so this
                deep core is the one high-contrast moment in the section. It
                fades to nothing rather than ending on an edge, so it reads as
                depth under the fan and not as a shape sitting on top of it. */}
            <radialGradient id="agency-core" gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r={CORE_R}>
              <stop offset="0" stopColor="#14120f" stopOpacity="0.97" />
              <stop offset="0.5" stopColor="#1a1714" stopOpacity="0.9" />
              <stop offset="1" stopColor="#2b2621" stopOpacity="0" />
            </radialGradient>

            {/* Everything is clipped to the fan so neither the core nor a
                scrim can spill past the rim. */}
            <clipPath id="agency-clip">
              <path d={wedge(START, END)} />
            </clipPath>
          </defs>

          <g clipPath="url(#agency-clip)">
            <path d={wedge(START, END)} fill="url(#agency-sky)" />

            {/* Scrims above the sky, below the core: inactive blades wash
                out toward the page while the active one holds full colour.
                This is the reaction — the fan visibly resolves around
                whichever level is being read. */}
            {agencySpectrum.levels.map((lvl, i) => (
              <path
                key={`scrim-${lvl.id}`}
                className={`agency-scrim${lvl.id === activeId ? ' is-active' : ''}`}
                d={wedge(START - i * SPAN, START - (i + 1) * SPAN)}
              />
            ))}

            <path d={wedge(START, END, CORE_R * 2)} fill="url(#agency-core)" pointerEvents="none" />
          </g>

          <text className="agency-core-word" x={CX} y={CY - 74} textAnchor="middle">
            {agencySpectrum.centerLabel}
          </text>
          {agencySpectrum.centerNote.map((line, i) => (
            <text key={line} className="agency-core-note" x={CX} y={CY - 50 + i * 15} textAnchor="middle">
              {line}
            </text>
          ))}

          {/* Hit areas and labels last, so nothing painted above them can
              steal the pointer. */}
          {agencySpectrum.levels.map((lvl, i) => {
            const a0 = START - i * SPAN;
            const a1 = START - (i + 1) * SPAN;
            const isActive = lvl.id === activeId;
            return (
              <g
                key={lvl.id}
                className={`agency-blade${isActive ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${lvl.title}: ${lvl.question}`}
                aria-pressed={isActive}
                onMouseEnter={() => setActiveId(lvl.id)}
                onFocus={() => setActiveId(lvl.id)}
                onClick={() => setActiveId(lvl.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(lvl.id);
                  }
                }}
              >
                <path className="agency-hit" d={wedge(a0, a1)} />
                <path id={`agency-level-${lvl.id}`} d={arc(a0, a1, LEVEL_R)} fill="none" />
                <path id={`agency-title-${lvl.id}`} d={arc(a0, a1, TITLE_R)} fill="none" />
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
      </div>

      {/* MOBILE CONTROLS. Not a duplicate for its own sake: at phone widths
          the SVG scales to about half, which would put the arc labels near
          6px. Bumping their size in user units cannot fix that, because the
          rails are a fixed arc length and the text simply overruns them.
          So below 860px the arc labels are hidden and the four questions
          become real text at a real size, in buttons that are also far
          better touch targets than a wedge slice. */}
      <div className="agency-wheel-chips">
        {agencySpectrum.levels.map((lvl, i) => (
          <button
            key={lvl.id}
            type="button"
            className={`agency-chip${lvl.id === activeId ? ' is-active' : ''}`}
            style={{ ['--chip' as string]: BLADE[i] }}
            aria-pressed={lvl.id === activeId}
            onClick={() => setActiveId(lvl.id)}
          >
            <span className="agency-chip-q">{lvl.question}</span>
            <span className="agency-chip-t">{lvl.title}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
