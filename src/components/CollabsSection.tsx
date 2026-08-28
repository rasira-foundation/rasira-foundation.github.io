import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { BlurRevealText } from './shared/BlurRevealElement';
import { collabsSection } from '../data/siteContent';
import './collabsSection.css';
import { IN_VIEW, SPRING } from '../lib/motion';
import { track } from '../lib/analytics';

/** Closing CTA card, rendered by App.tsx inside .collabs-slot (see
 * collabsSection.css), which just centers it with page-standard padding —
 * the scroll-reveal motion here only animates opacity/blur/y, so the two
 * never fight. Its secondary link scrolls to PartnerDonationSection's
 * #donate anchor; the only thing coupling them. */
export function CollabsSection() {
  const handleSupportClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    track('cta_click', {
      cta_id: 'support_prompt',
      cta_label: collabsSection.supportPrompt,
      destination: 'anchor',
      section_name: 'collaborate',
    });
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      className="collabs-card" data-section="collaborate"
      initial={{ opacity: 0, filter: 'blur(8px)', y: 24 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={IN_VIEW}
      transition={SPRING}
    >
      <BlurRevealText as="h2" className="collabs-heading">{collabsSection.heading}</BlurRevealText>
      <BlurRevealText className="collabs-body" delay={0.1}>{collabsSection.body}</BlurRevealText>
      <a
        className="collabs-cta"
        href={collabsSection.ctaMailto}
        onClick={() =>
          track('cta_click', {
            cta_id: 'reach_out',
            cta_label: collabsSection.ctaLabel,
            destination: 'email',
            section_name: 'collaborate',
          })
        }
      >
        {collabsSection.ctaLabel}
      </a>
      <a className="collabs-support" href="#donate" onClick={handleSupportClick}>
        {collabsSection.supportPrompt}
      </a>
    </motion.div>
  );
}
