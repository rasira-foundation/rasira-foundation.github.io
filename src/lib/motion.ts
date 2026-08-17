import type { Transition } from 'framer-motion';

/**
 * The site's one spring. Time-based rather than physics-based: `duration`
 * and `bounce` describe what the motion should look like, where
 * stiffness/damping/mass describe the simulation that produces it.
 *
 * IMPORTANT — these two forms are mutually exclusive. Framer overrides
 * `duration` and `bounce` outright if `stiffness`, `damping` or `mass` are
 * present, silently, with no warning. Anything reaching for this constant
 * must not also pass those, or it gets a default spring and the values
 * here do nothing.
 *
 * bounce: 0 is a critically damped spring — it approaches its target and
 * settles without overshooting. That is what makes it usable for opacity
 * and colour, where an overshoot has nowhere to go: past 1 there is no
 * "more opaque", so a bouncy spring would visibly clip and hold.
 */
/** The same 0.7s, exposed on its own for useSpring — which takes spring
 * options directly rather than a Transition, so it cannot consume SPRING. */
export const SPRING_SECONDS = 0.7;

export const SPRING: Transition = {
  type: 'spring',
  duration: SPRING_SECONDS,
  bounce: 0,
  delay: 0,
};

/**
 * Scroll-variant trigger: fire when a section reaches the MIDDLE of the
 * viewport, and fire again every time it does.
 *
 * The -20% top and bottom collapses the observer's root to the centre 60%
 * of the screen, so a reveal happens once the element is genuinely being
 * looked at rather than the instant its first pixel clears the fold.
 *
 * `amount` is deliberately left at its default ("some") rather than set to
 * 0.5. The two are alternative ways of expressing "centre of viewport",
 * and stacking them breaks on tall elements: with the root already reduced
 * to 60% of the screen, anything taller than that can never have 50% of
 * itself inside it, so the trigger would never fire at all. Several
 * sections here are that tall.
 *
 * once: false — reveals replay on the way back up. That is also the safer
 * default: a once:true reveal that fires while its section is hidden (behind
 * the splash, say) spends its only trigger and the content stays invisible,
 * a bug this page has hit before.
 */
export const IN_VIEW = {
  once: false,
  margin: '-20% 0px -20% 0px',
} as const;
