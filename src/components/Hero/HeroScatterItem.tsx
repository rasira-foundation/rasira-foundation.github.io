import { motion } from 'framer-motion';
import type { ScatterItem } from '../../data/heroScatter';

export function HeroScatterItem({ item, index }: { item: ScatterItem; index: number }) {
  return (
    <motion.div
      className={`scatter-item scatter-${item.kind} scatter-float-${Math.round(item.depth * 3) % 3}`}
      style={{ top: item.top, left: item.left, width: item.width }}
      initial={{ opacity: 0, scale: 0.8, y: 20, rotate: item.rotate - 5, filter: 'blur(16px)' }}
      whileInView={{ opacity: 1, scale: 1, y: 0, rotate: item.rotate, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {renderScatterContent(item)}
    </motion.div>
  );
}

function renderScatterContent(item: ScatterItem) {
  switch (item.kind) {
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
