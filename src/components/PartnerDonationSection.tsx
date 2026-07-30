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
      <div className="partner-donation-header">
        <span>02 / Partners in the Field</span>
        <span>03 / Direct Support</span>
      </div>
      <div className="partner-donation-grid">
        <div className="partner-card">
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
        </div>

        <div id="donate" className="donation-card">
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
        </div>
      </div>
    </section>
  );
}
