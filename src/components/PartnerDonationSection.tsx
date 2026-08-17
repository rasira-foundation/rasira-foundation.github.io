import { BlurRevealElement } from './shared/BlurRevealElement';
import springLogo from '../assets/photos/spring-bw.png';
import { partnerSection, donationSection } from '../data/siteContent';
import './partnerDonationSection.css';

/** Partner (Spring Talents) and Donation cards side by side. The donation
 * card carries id="donate" — the scroll target for CollabsSection's
 * secondary link. */
export function PartnerDonationSection() {
  const { partner } = partnerSection;

  return (
    <section className="partner-donation-section">
      {/* Each label now lives immediately before its own card rather than
          in a shared two-span header row above both. That row read fine
          on desktop, but below 1024px the grid collapses to one column
          while the row stayed side by side — so "03 / Direct Support"
          ended up floating next to the Partners card instead of over the
          Direct Support one. In this order the mobile stacking is correct
          by construction, and the desktop layout is restored by placing
          the labels back onto row 1 in CSS. */}
      <div className="partner-donation-grid">
        <span className="partner-donation-label partner-donation-label--partner">
          02 / Partners in the Field
        </span>
        <BlurRevealElement className="partner-card">
          <div>
            <div className="partner-card-topbar">
              <span>{partner.role}</span>
              <a href={partner.url} target="_blank" rel="noopener noreferrer">
                {partner.urlLabel}
              </a>
            </div>
            <p className="partner-card-heading">{partner.lead}</p>
          </div>
          <img className="partner-card-logo" src={springLogo} alt="Spring" />
          <p className="partner-card-body">{partner.body}</p>
        </BlurRevealElement>

        <span className="partner-donation-label partner-donation-label--donation">
          03 / Direct Support
        </span>

        <BlurRevealElement className="donation-card" delay={0.1}>
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
            <a className="donation-cta" href={donationSection.ctaMailto}>
              {donationSection.ctaLabel}
            </a>
          </div>
        </BlurRevealElement>
      </div>
    </section>
  );
}
