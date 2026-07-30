import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { collabsSection } from '../data/siteContent';
import './collabsSection.css';

/** Glass card closing the constellation — rendered by FloatingNodes
 * inside .floating-nodes-collabs-slot, which anchors it centered below
 * the diagram's convergence point (that wrapper owns positioning; the
 * scroll-reveal motion here only animates opacity/blur/y, so the two
 * never fight). Its secondary link scrolls to PartnerDonationSection's
 * #donate anchor; the only thing coupling them. */
export function CollabsSection() {
  const handleSupportClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      className="collabs-card"
      initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="collabs-heading">{collabsSection.heading}</h2>
      <p className="collabs-body">{collabsSection.body}</p>
      <a className="collabs-cta" href={collabsSection.ctaMailto}>
        {collabsSection.ctaLabel}
      </a>
      <a className="collabs-support" href="#donate" onClick={handleSupportClick}>
        {collabsSection.supportPrompt}
      </a>
    </motion.div>
  );
}
