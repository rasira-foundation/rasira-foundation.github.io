import { motion } from 'framer-motion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { heroScatter } from '../../data/heroScatter';
import { heroIntro } from '../../data/siteContent';
import { HeroScatterItem } from './HeroScatterItem';
import { BlurRevealText } from '../shared/BlurRevealText';
import './narrativeHero.css';

export function NarrativeHero() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();

  // Photos hold sharp through the first ~40% of the field scrolling past,
  // then progressively blur/desaturate as the reader scrolls toward the nodes.
  const exitProgress = Math.min(1, Math.max(0, (progress - 0.4) / 0.6));

  return (
    <section className="narrative-hero">
      <div
        ref={ref}
        className="hero-scatter-field"
        style={{
          filter: `blur(${exitProgress * 8}px) grayscale(${exitProgress * 0.85}) brightness(${1 - exitProgress * 0.1})`,
        }}
      >
        {heroScatter.map((item, index) => (
          <HeroScatterItem key={item.id} item={item} index={index} />
        ))}
      </div>

      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <BlurRevealText text={heroIntro.paragraph} className="hero-copy-paragraph" />
        <p className="hero-copy-tags">{heroIntro.tags.join(' / ')}</p>
      </motion.div>
    </section>
  );
}
