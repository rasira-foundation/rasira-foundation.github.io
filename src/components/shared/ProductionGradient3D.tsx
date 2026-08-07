import { motion } from 'framer-motion';
import './productionGradient3D.css';

/**
 * Full-document background layer standing in for the old per-section
 * gradients (.atmosphere-band, .floating-nodes, .article-hub,
 * .closing-footer — all transparent now, see their own CSS) — same exact
 * color sequence, painted once as a single gradient instead of separately
 * per section, plus two large blurred "orbs" drifting slowly on top for
 * a sense of depth.
 *
 * Absolutely positioned (not fixed) and sized to the whole document, not
 * just the viewport — .production-gradient-3d's containing block is
 * #root (position:relative, see index.css), which grows to the full
 * page height, so inset:0 spans that. That's what makes different parts
 * of the gradient correspond to the section actually on screen as you
 * scroll; position:fixed would pin the same visible band to the
 * viewport forever, which was tried and explicitly ruled out.
 *
 * The orbs drift and pulse on a continuous, time-based loop
 * (Framer's `animate` with repeat: Infinity) rather than being scroll-
 * linked — a scroll-linked version of this exact layer was built once
 * already and shipped a real bug: a scroll-derived motion value only
 * ever updates when a real scroll event fires, so anything that doesn't
 * generate one (a full-page capture tool that resizes the viewport
 * instead of scrolling it, for instance) left the color frozen at its
 * initial value. Time-based animation has no such failure mode — it
 * runs the moment this mounts, independent of scroll ever happening at
 * all.
 *
 * Homepage-only: rendered by App.tsx only outside the article-detail
 * route, which has none of these sections and keeps its own flat
 * background.
 */
export function ProductionGradient3D() {
  return (
    <div className="production-gradient-3d" aria-hidden="true">
      <div className="production-gradient-3d-base" />

      <motion.div
        className="production-gradient-3d-orb production-gradient-3d-orb--terracotta"
        animate={{ scale: [1, 1.08, 0.95, 1], x: ['0%', '3%', '-3%', '0%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="production-gradient-3d-orb production-gradient-3d-orb--blue"
        animate={{ scale: [1, 0.92, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="production-gradient-3d-footer-glow" />
    </div>
  );
}
