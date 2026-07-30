import { motion } from 'framer-motion';
import { useLocalClock } from '../../hooks/useLocalClock';
import { CONTACT_EMAIL, closingNarrative } from '../../data/siteContent';
import { AnalogClock } from './AnalogClock';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import './closingFooter.css';

interface ClosingFooterProps {
  /** The glow, clock, and "time is ticking.." narrative only make sense
   * as homepage flourishes alongside the rest of the atmosphere —
   * article/detail pages render this same footer but without any of the
   * three, just the contact block. */
  showClock?: boolean;
}

export function ClosingFooter({ showClock = true }: ClosingFooterProps) {
  const clock = useLocalClock();

  return (
    <footer className="closing-footer">
      {showClock && (
        <>
          <div className="closing-footer-clock-wrap">
            <div className="closing-footer-glow" aria-hidden="true" />
            <BlurRevealElement className="closing-footer-clock-blur">
              <AnalogClock hourDeg={clock.hourDeg} minuteDeg={clock.minuteDeg} />
            </BlurRevealElement>
            <span className="closing-footer-digital">{clock.digital}</span>
          </div>

          <motion.p
            className="closing-footer-narrative"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8 }}
          >
            {closingNarrative.line1}
            <br />
            {closingNarrative.line2}
          </motion.p>
        </>
      )}

      <div className="closing-footer-contact">
        <a href={`mailto:${CONTACT_EMAIL}`} className="closing-footer-mail">
          {CONTACT_EMAIL}
        </a>
        <span className="closing-footer-year">© {new Date().getFullYear()}</span>
      </div>

      {/* Mobile-only duplicate of the digital readout above — desktop
       * positions the original beside the clock face via
       * .closing-footer-digital (absolute, anchored to the clock wrap).
       * Mobile instead stacks clock -> narrative -> email -> copyright ->
       * time in normal flow, which needs the readout as a later sibling
       * rather than nested inside the clock wrap; see closingFooter.css. */}
      {showClock && <span className="closing-footer-digital-mobile">{clock.digital}</span>}
    </footer>
  );
}
