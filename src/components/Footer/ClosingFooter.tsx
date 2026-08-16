import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocalClock } from '../../hooks/useLocalClock';
import { CONTACT_EMAIL, closingNarrative } from '../../data/siteContent';
import { AnalogClock } from './AnalogClock';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import './closingFooter.css';

interface ClosingFooterProps {
  /** The glow, clock, meta row, and giant wordmark only make sense as
   * homepage flourishes alongside the rest of the atmosphere —
   * article/detail pages render this same footer but without any of
   * that, just the contact block. */
  showClock?: boolean;
}

export function ClosingFooter({ showClock = true }: ClosingFooterProps) {
  const clock = useLocalClock();
  const footerRef = useRef<HTMLElement>(null);

  // Tied to this footer's own progress through the viewport rather than
  // the page-wide scrollYProgress — a global [0.75, 0.95] window drifts
  // out of alignment every time page height changes, which it has
  // repeatedly here. offset start/end means: 0 when the footer's top
  // first enters the bottom of the viewport, 1 once its top reaches the
  // top of the viewport.
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start start'],
  });
  // Starts at 0.4 rather than 0 on purpose: a scroll-derived value only
  // advances when scroll/rAF actually run, and when that stalls it stays
  // pinned at its FIRST entry — so a [0, 1] range would leave the glow
  // permanently absent. Starting part-way means the worst case is a
  // dimmer glow, while a normal scroll resolves it to full strength.
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);

  if (!showClock) {
    return (
      <footer className="closing-footer">
        <div className="closing-footer-contact">
          <a href={`mailto:${CONTACT_EMAIL}`} className="closing-footer-mail">
            {CONTACT_EMAIL}
          </a>
          <span className="closing-footer-year">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="closing-footer closing-footer--dark" ref={footerRef}>
      {/* The sunset wash itself is plain CSS at full strength — see
          .closing-footer-sunset for why fading the whole layer breaks
          the seam and the opaque bottom. Only the ambient glow is
          scroll-linked, which is safe in a way the gradient isn't: if
          scrollYProgress stalls (a real failure mode noted in
          ProductionGradient3D.tsx — a scroll-derived value only advances
          when scroll/rAF actually run), the worst case is a slightly
          dimmer glow, never an unreadable footer. */}
      <div className="closing-footer-sunset" aria-hidden="true">
        <motion.div className="closing-footer-sunset-glow" style={{ opacity: glowOpacity }} />
      </div>

      {/* A real 3-column grid — the old approach positioned everything by
          percentage of the footer's own height, which broke the moment
          the giant wordmark below inflated that height: every offset had
          been tuned for a much shorter box. A grid holds up regardless
          of how tall the footer gets. */}
      <motion.div
        className="closing-footer-meta"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8 }}
      >
        <div className="closing-footer-meta-col closing-footer-meta-left">
          <p>{closingNarrative.line1}</p>
          <p>{closingNarrative.line2}</p>
        </div>

        <div className="closing-footer-meta-col closing-footer-meta-center">
          <a href={`mailto:${CONTACT_EMAIL}`} className="closing-footer-mail">
            {CONTACT_EMAIL}
          </a>
          <div className="closing-footer-clock-wrap">
            <div className="closing-footer-glow" aria-hidden="true" />
            <BlurRevealElement className="closing-footer-clock-blur">
              <AnalogClock hourDeg={clock.hourDeg} minuteDeg={clock.minuteDeg} />
            </BlurRevealElement>
          </div>
        </div>

        <div className="closing-footer-meta-col closing-footer-meta-right">
          <p>{clock.digital}</p>
        </div>
      </motion.div>

      {/* Giant closing wordmark — the real two-line logo asset (not a
       * text recreation), forced white via filter since an <img> can't
       * be recolored with CSS `color`. Using the actual SVG rather than
       * approximating the letterforms means the "Foundati●n" dot styling
       * already baked into the asset just comes along for free. */}
      <motion.div
        className="closing-footer-brand"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="closing-footer-brand-asterisk" aria-hidden="true">
          *
        </span>
        <img src={twoLineLogo} alt="Rasira Foundation" className="closing-footer-brand-logo" />
      </motion.div>

      <span className="closing-footer-year closing-footer-year--homepage">© {new Date().getFullYear()}</span>
    </footer>
  );
}
