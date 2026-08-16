import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { collabsSection } from '../data/siteContent';
import './collabsSection.css';

interface CollabsSectionProps {
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished — see the comment on the same prop in ArticleCard.tsx for
   * why this isn't a whileInView reveal. */
  heroDone: boolean;
}

/** Closing CTA card, rendered by App.tsx inside .collabs-slot (see
 * collabsSection.css), which just centers it with page-standard padding —
 * the scroll-reveal motion here only animates opacity/blur/y, so the two
 * never fight. Its secondary link scrolls to PartnerDonationSection's
 * #donate anchor; the only thing coupling them. */
export function CollabsSection({ heroDone }: CollabsSectionProps) {
  const handleSupportClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      className="collabs-card"
      animate={
        heroDone ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(10px)', y: 30 }
      }
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
