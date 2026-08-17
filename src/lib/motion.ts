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
 * Scroll-variant trigger: fire as a section rises into the reading area,
 * and fire again every time it does.
 *
 * The margin is ASYMMETRIC, and that is the whole point. It shrinks only
 * the BOTTOM of the observer root, so an element has to rise past the 75%
 * line before it counts as in view — a late trigger, which is what "centre
 * of the viewport" was asking for. The top is left at 0, so the element
 * stays in view until it has fully left the screen.
 *
 * A symmetric `-20% 0px -20% 0px` was tried and is actively broken with
 * `once: false`. Together they mean anything outside the middle 60% is "not
 * in view" and gets reverted to hidden — so a heading the user is plainly
 * looking at, sitting in the top fifth of the screen, fades back out.
 * Observed: the pillar labels and framework titles going blank while on
 * screen. With repeat enabled, the root must never be shrunk on the edge
 * the content EXITS through.
 *
 * `amount` is deliberately left at its default ("some") rather than set to
 * 0.5. The two are alternative ways of expressing a late trigger, and
 * stacking them breaks on tall elements: with the root already reduced,
 * anything taller than the remaining band can never have 50% of itself
 * inside it, so it would never fire at all. Several sections here are that
 * tall.
 *
 * once: false — reveals replay on the way back up. That is also the safer
 * default: a once:true reveal that fires while its section is hidden
 * (behind the splash, say) spends its only trigger and the content stays
 * invisible, a bug this page has hit before.
 */
export const IN_VIEW = {
  once: false,
  margin: '0px 0px -25% 0px',
} as const;
