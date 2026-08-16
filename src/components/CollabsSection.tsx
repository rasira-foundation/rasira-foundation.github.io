import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { BlurRevealText } from './shared/BlurRevealElement';
import { collabsSection } from '../data/siteContent';
import './collabsSection.css';

/** Closing CTA card, rendered by App.tsx inside .collabs-slot (see
 * collabsSection.css), which just centers it with page-standard padding —
 * the scroll-reveal motion here only animates opacity/blur/y, so the two
 * never fight. Its secondary link scrolls to PartnerDonationSection's
 * #donate anchor; the only thing coupling them. */
export function CollabsSection() {
  const handleSupportClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      className="collabs-card"
      initial={{ opacity: 0, filter: 'blur(8px)', y: 24 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <BlurRevealText as="h2" className="collabs-heading">{collabsSection.heading}</BlurRevealText>
      <BlurRevealText className="collabs-body" delay={0.1}>{collabsSection.body}</BlurRevealText>
      <a className="collabs-cta" href={collabsSection.ctaMailto}>
        {collabsSection.ctaLabel}
      </a>
      <a className="collabs-support" href="#donate" onClick={handleSupportClick}>
        {collabsSection.supportPrompt}
      </a>
    </motion.div>
  );
}
