import { motion } from 'framer-motion';
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
    <footer className="closing-footer closing-footer--dark">
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
