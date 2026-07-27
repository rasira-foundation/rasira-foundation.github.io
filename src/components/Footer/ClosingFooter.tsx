import { motion } from 'framer-motion';
import { useRealtimeClock } from '../../hooks/useRealtimeClock';
import { CONTACT_EMAIL, closingNarrative } from '../../data/siteContent';
import oneLineLogo from '../../assets/rasira-1line.svg';
import './closingFooter.css';

export function ClosingFooter() {
  const clock = useRealtimeClock();

  return (
    <footer className="closing-footer">
      <div className="closing-footer-glow" aria-hidden="true" />

      <div className="closing-footer-graphic" aria-hidden="true">
        <svg viewBox="0 0 200 260" className="closing-footer-line">
          <line x1="100" y1="0" x2="100" y2="150" />
          <line x1="100" y1="150" x2="150" y2="230" />
        </svg>
        <span className="closing-footer-clock">{clock}</span>
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
        <img src={oneLineLogo} alt="Rasira Foundation" className="closing-footer-logo" />
        <span className="closing-footer-year">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
