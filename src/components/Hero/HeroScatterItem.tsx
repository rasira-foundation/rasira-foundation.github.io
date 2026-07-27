import { motion } from 'framer-motion';
import type { ScatterItem } from '../../data/heroScatter';

export function HeroScatterItem({ item }: { item: ScatterItem }) {
  return (
    <motion.div
      className={`scatter-item scatter-${item.kind} scatter-float-${Math.round(item.depth * 3) % 3}`}
      style={{ top: item.top, left: item.left, width: item.width }}
      initial={{ opacity: 0, y: 46, rotate: item.rotate - 6 }}
      whileInView={{ opacity: 1, y: 0, rotate: item.rotate }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.9, delay: item.depth * 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {renderScatterContent(item)}
    </motion.div>
  );
}

function renderScatterContent(item: ScatterItem) {
  switch (item.kind) {
    case 'resume':
      return (
        <div className="scatter-card scatter-resume-card">
          <span className="scatter-resume-title">RESUME</span>
          <span className="scatter-resume-line" />
          <span className="scatter-resume-line" />
          <span className="scatter-resume-line short" />
        </div>
      );
    case 'photo':
      return (
        <div className="scatter-card scatter-photo-card">
          <div className="scatter-photo-surface" />
          {item.caption && <span className="scatter-photo-caption">{item.caption}</span>}
        </div>
      );
    case 'quote':
      return <p className="scatter-quote">{item.text}</p>;
    case 'label':
      return <p className="scatter-label">{item.text}</p>;
    case 'door':
      return (
        <svg viewBox="0 0 60 90" className="scatter-door" aria-hidden="true">
          <rect x="6" y="4" width="48" height="82" rx="2" fill="#8b8f92" />
          <rect x="10" y="8" width="40" height="74" rx="1" fill="#efe9de" />
          <circle cx="42" cy="46" r="2.2" fill="#8b8f92" />
        </svg>
      );
    case 'sdg':
      return (
        <div className="scatter-sdg" aria-label="Sustainable Development Goal 10: Reduced Inequalities">
          <span className="scatter-sdg-number">10</span>
          <span className="scatter-sdg-label">REDUCED INEQUALITIES</span>
        </div>
      );
    default:
      return null;
  }
}
