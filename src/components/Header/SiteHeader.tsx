import { motion } from 'framer-motion';
import oneLineLogo from '../../assets/rasira-1line.svg';
import { navigateHome } from '../../hooks/useHashRoute';
import './siteHeader.css';

interface SiteHeaderProps {
  /** Stays invisible until the splash's own copy of the wordmark is about
   * to hand off. Sharing layoutId="brand-logo" with that copy means
   * Framer tracks both as one logical element and crossfades/corrects
   * their position together, instead of two independently hand-tuned
   * animations meeting at a hard cut. */
  visible?: boolean;
}

export function SiteHeader({ visible = true }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button type="button" className="site-header-logo" onClick={navigateHome} aria-label="Rasira Foundation — home">
        <motion.img
          layoutId="brand-logo"
          src={oneLineLogo}
          alt="Rasira Foundation"
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      </button>
    </header>
  );
}
