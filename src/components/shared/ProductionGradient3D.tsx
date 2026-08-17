import { motion, useScroll, useTransform } from 'framer-motion';
import './productionGradient3D.css';

/**
 * Full-document background layer standing in for the old per-section
 * gradients (.atmosphere-band, .floating-nodes, .article-hub,
 * .closing-footer — all transparent now, see their own CSS) — same exact
 * color sequence, painted once as a single gradient instead of separately
 * per section, plus two large blurred "orbs" drifting on top for a sense
 * of depth.
 *
 * Absolutely positioned (not fixed) and sized to the whole document, not
 * just the viewport — .production-gradient-3d's containing block is
 * #root (position:relative, see index.css), which grows to the full
 * page height, so inset:0 spans that. That's what makes different parts
 * of the gradient correspond to the section actually on screen as you
 * scroll; position:fixed would pin the same visible band to the
 * viewport forever, which was tried and explicitly ruled out.
 *
 * .production-gradient-3d-base's own colors are NOT scroll-linked, and
 * that's deliberate: a scroll-linked version of this whole layer (colors
 * interpolated off scrollYProgress) was built once already and shipped a
 * real bug — a scroll-derived motion value only ever updates when a real
 * scroll event fires, so anything that doesn't generate one (a full-page
 * capture tool that resizes the viewport instead of scrolling it, for
 * instance) left the *color* frozen at its initial value, breaking
 * contrast for whatever was on screen. The static base gradient below has
 * no such failure mode — it's plain CSS, correct from first paint
 * regardless of whether scrolling ever happens.
 *
 * A fixed, viewport-relative wash whose opacity ramped in with scroll
 * (transparent -> terracotta -> near-black) used to live here too, as an
 * "ambient" layer on top of the base gradient. It was removed: because it
 * was pinned to the *viewport* rather than a document position, its
 * terracotta band was already at ~85% opacity by just 35% scroll depth —
 * meaning it sat over whatever section happened to be on screen at that
 * point (Article grid / Pillars / System Framework), bleeding orange
 * across content that's meant to stay flat warm beige. The base gradient
 * below now does this job instead, confined to an actual document
 * position (the tail of Partner Donation, just before the footer) rather
 * than a scroll-progress fraction that drifts with page length.
 *
 * The orbs' scroll-linked drift (y, via useScroll/useTransform) is a
 * separate, still-safe use of scroll: if scrollYProgress ever did freeze
 * at 0 (see above), the affected orb just sits at its normal static
 * position — inert, not broken — while the page's actual color/contrast
 * stays governed by the untouched static gradient. Their scale/x pulse
 * stays time-based (Framer's `animate` with repeat: Infinity), same as
 * before, layered on the same elements without conflict since y and
 * x/scale are combined into one transform internally.
 *
 * Homepage-only: rendered by App.tsx only outside the article-detail
 * route, which has none of these sections and keeps its own flat
 * background.
 */
export function ProductionGradient3D() {
  const { scrollYProgress } = useScroll();
  const terracottaY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const blueY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  // Soft radial vignette hanging from the top of the VIEWPORT, washing in
  // over the first 15% of the page. Because it fades in rather than out,
  // a stalled scroll value (see the note above) leaves it simply absent —
  // the page still reads correctly off the static base gradient below.
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  // The cool-grey/blue hero sky. This used to be baked into
  // .production-gradient-3d-base as a hard #cdd6de band across the top
  // 13% of the document; it's now its own viewport-pinned layer that
  // fades out as you scroll past the hero, leaving the flat beige base.
  const heroSkyOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <>
      {/* ORDER IS LOAD-BEARING. All three layers here are positioned with
          z-index:auto, so they paint in DOM order — the document-sized
          base must come FIRST or its solid beige fill paints straight
          over the two viewport-pinned layers below and both vanish. (The
          page content still lands on top of all three: the hero, header
          and article hub are themselves positioned and come later in
          App.tsx.) */}
      <div className="production-gradient-3d" aria-hidden="true">
        <div className="production-gradient-3d-base" />

        <motion.div
          className="production-gradient-3d-orb production-gradient-3d-orb--terracotta"
          style={{ y: terracottaY }}
          animate={{ scale: [1, 1.08, 0.95, 1], x: ['0%', '3%', '-3%', '0%'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="production-gradient-3d-orb production-gradient-3d-orb--blue"
          style={{ y: blueY }}
          animate={{ scale: [1, 0.92, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="production-gradient-3d-footer-glow" />
      </div>

      {/* Both of these are fixed rather than document-sized, which is why
          they are separate elements from the layer above: making
          .production-gradient-3d itself fixed is a bug that has already
          shipped here once (it pins one band of the gradient to the
          viewport forever). */}
      <motion.div
        className="production-gradient-vignette"
        style={{ opacity: vignetteOpacity }}
        aria-hidden="true"
      />

      {/* Cool-grey/blue hero sky, pinned to the top of the viewport and
          faded out by scroll. Unlike the vignette, this one fades OUT — so
          a stalled scroll value leaves it fully present rather than
          absent, which is the safe direction here, since the hero is
          designed around it being there. The slow breathing motion is a
          CSS keyframe on the inner element (background-position), not a
          motion value, so it keeps running on its own clock even if scroll
          never fires. */}
      <motion.div className="hero-sky" style={{ opacity: heroSkyOpacity }} aria-hidden="true">
        <div className="hero-sky-wash" />
      </motion.div>
    </>
  );
}
