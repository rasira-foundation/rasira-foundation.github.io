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

  return (
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
  );
}
