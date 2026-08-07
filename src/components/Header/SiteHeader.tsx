import { motion } from 'framer-motion';
import oneLineLogo from '../../assets/rasira-1line.svg';
import { navigateHome } from '../../hooks/useHashRoute';
import './siteHeader.css';

interface SiteHeaderProps {
  /** Stays invisible until the splash has actually cleared, then fades in
   * on its own — no shared-element handoff with the splash anymore, it
   * doesn't show a copy of this logo at all. */
  visible?: boolean;
}

export function SiteHeader({ visible = true }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button type="button" className="site-header-logo" onClick={navigateHome} aria-label="Rasira Foundation — home">
        <motion.img
          src={oneLineLogo}
          alt="Rasira Foundation"
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      </button>
    </header>
  );
}
