import { motion } from 'framer-motion';
import { useLocalClock } from '../../hooks/useLocalClock';
import { CONTACT_EMAIL, closingNarrative } from '../../data/siteContent';
import { AnalogClock } from './AnalogClock';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import './closingFooter.css';

export function ClosingFooter() {
  const clock = useLocalClock();

  return (
    <footer className="closing-footer">
      <div className="closing-footer-glow" aria-hidden="true" />

      <div className="closing-footer-clock-wrap">
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

      <div className="closing-footer-contact">
        <a href={`mailto:${CONTACT_EMAIL}`} className="closing-footer-mail">
          {CONTACT_EMAIL}
        </a>
        <span className="closing-footer-year">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
