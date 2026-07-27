import { motion } from 'framer-motion';
import type { ScatterItem } from '../../data/heroScatter';

export function HeroScatterItem({ item, index }: { item: ScatterItem; index: number }) {
  return (
    <motion.div
      className={`scatter-item scatter-${item.kind} scatter-float-${Math.round(item.depth * 3) % 3}`}
      style={{ top: item.top, left: item.left, width: item.width }}
      initial={{ opacity: 0, scale: 0.8, y: 20, rotate: item.rotate - 5 }}
      whileInView={{ opacity: 1, scale: 1, y: 0, rotate: item.rotate }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {renderScatterContent(item)}
    </motion.div>
  );
}

function renderScatterContent(item: ScatterItem) {
  switch (item.kind) {
    case 'resume':
      return (
        <div className="scatter-resume">
          <span className="scatter-resume-title">RESUME</span>
          <span className="scatter-resume-line" />
          <span className="scatter-resume-line" />
          <span className="scatter-resume-line short" />
        </div>
      );
    case 'image':
      return <img className="scatter-image" src={item.src} alt={item.alt ?? ''} loading="lazy" />;
    case 'quote':
      return <p className="scatter-quote">{item.text}</p>;
    case 'label':
      return <p className="scatter-label">{item.text}</p>;
    default:
      return null;
  }
}
