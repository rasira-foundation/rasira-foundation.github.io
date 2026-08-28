import { BlurRevealElement } from './shared/BlurRevealElement';
import { track } from '../lib/analytics';
import springLogo from '../assets/photos/spring-bw.png';
import { partnerSection, donationSection } from '../data/siteContent';
import './partnerDonationSection.css';

/** Partner (Spring Talents) and Donation cards side by side. The donation
 * card carries id="donate" — the scroll target for CollabsSection's
 * secondary link. */
export function PartnerDonationSection() {
  const { partner } = partnerSection;

  return (
    <section className="partner-donation-section" data-section="partner_and_support">
      {/* Direct Support comes FIRST in the DOM, and that is what puts it on
          the left on desktop and first in the stack on mobile — the two
          have to agree, so the order is set here rather than by reordering
          in CSS.

          Each label sits immediately before its own card rather than in a
          shared header row above both. That row read fine on desktop, but
          below 1024px the grid collapses to one column while the row stayed
          side by side, leaving a label floating beside the wrong card. In
          this order the mobile stacking is correct by construction, and the
          desktop header strip is restored by placing the labels back onto
          row 1 in CSS. */}
      <div className="partner-donation-grid">
        <span className="partner-donation-label partner-donation-label--donation">
          Direct Support
        </span>

        <BlurRevealElement className="donation-card">
          <span id="donate" />
          <div className="donation-card-grain" aria-hidden="true" />
          <div className="donation-card-content">
            <div>
              <div className="donation-card-topbar">
                <span>{donationSection.eyebrow}</span>
                <span>{donationSection.eyebrowSub}</span>
              </div>
              <p className="donation-card-heading">{donationSection.lead}</p>
              <p className="donation-card-body">{donationSection.body}</p>
            </div>
            <a
              className="donation-cta"
              href={donationSection.ctaMailto}
              onClick={() =>
                track('cta_click', {
                  cta_id: 'support_fieldwork',
                  cta_label: donationSection.ctaLabel,
                  destination: 'email',
                  section_name: 'partner_and_support',
                })
              }
            >
              {donationSection.ctaLabel}
            </a>
          </div>
        </BlurRevealElement>

        <span className="partner-donation-label partner-donation-label--partner">
          Partners in the Field
        </span>
        <BlurRevealElement className="partner-card" delay={0.1}>
          <div>
            <div className="partner-card-topbar">
              <span>{partner.role}</span>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('outbound_click', {
                    link_url: partner.url,
                    link_label: partner.urlLabel,
                    section_name: 'partner_and_support',
                  })
                }
              >
                {partner.urlLabel}
              </a>
            </div>
            <p className="partner-card-heading">{partner.lead}</p>
          </div>
          <img className="partner-card-logo" src={springLogo} alt="Spring" />
          <p className="partner-card-body">{partner.body}</p>
        </BlurRevealElement>
      </div>
    </section>
  );
}
