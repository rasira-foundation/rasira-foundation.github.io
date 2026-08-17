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
 * Scroll-variant trigger: reveal when a section enters the viewport, and
 * reveal again every time it re-enters.
 *
 * NO margin and NO amount, and that is a correctness requirement rather
 * than a preference.
 *
 * `whileInView` reverts an element to its `initial` state whenever it
 * leaves the observer root — that is what `once: false` means. So any
 * negative rootMargin carves out a band that is ON SCREEN but counts as
 * out of view, and content sitting there gets actively hidden while the
 * user is looking straight at it. Two versions of this shipped:
 *
 *   -20% top AND bottom  -> headings vanished in the top fifth of the
 *                           screen while scrolling down
 *   0 top, -25% bottom   -> same thing mirrored: scrolling UP, content
 *                           moves down the screen, crosses the 75% line
 *                           and disappears in the bottom quarter
 *
 * `amount` has the identical failure for the same reason: an element with
 * less than the threshold visible is "out of view" and gets reset, which
 * is exactly what happens at both edges of the screen.
 *
 * So the two settings are mutually exclusive, and this is the trade:
 *   repeat + no shrink  -> triggers early (any pixel on screen), never
 *                          hides anything visible.  <- chosen
 *   late trigger + once -> fires at the centre, never replays.
 * Nothing hides content the user can see, which is the property that
 * matters more than where exactly the reveal begins.
 *
 * once: false is also the safer default for a second reason: a once:true
 * reveal that fires while its section is hidden (behind the splash, say)
 * spends its only trigger and the content stays invisible — a bug this
 * page has hit before.
 */
export const IN_VIEW = {
  once: false,
} as const;
