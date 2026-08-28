import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useLocalClock } from '../../hooks/useLocalClock';
import { CONTACT_EMAIL, closingNarrative } from '../../data/siteContent';
import { AnalogClock } from './AnalogClock';
import { BlurRevealElement } from '../shared/BlurRevealElement';
import twoLineLogo from '../../assets/rasira-2lines.svg';
import './closingFooter.css';
import { IN_VIEW, SPRING, SPRING_SECONDS } from '../../lib/motion';
import { track } from '../../lib/analytics';

interface ClosingFooterProps {
  /** The glow, clock, meta row, and giant wordmark only make sense as
   * homepage flourishes alongside the rest of the atmosphere —
   * article/detail pages render this same footer but without any of
   * that, just the contact block. */
  showClock?: boolean;
}

export function ClosingFooter({ showClock = true }: ClosingFooterProps) {
  const clock = useLocalClock();
  const footerRef = useRef<HTMLElement>(null);

  // Tied to this footer's own progress through the viewport rather than
  // the page-wide scrollYProgress — a global [0.75, 0.95] window drifts
  // out of alignment every time page height changes, which it has
  // repeatedly here. offset start/end means: 0 when the footer's top
  // first enters the bottom of the viewport, 1 once its top reaches the
  // top of the viewport.
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start start'],
  });
  // Starts at 0.4 rather than 0 on purpose: a scroll-derived value only
  // advances when scroll/rAF actually run, and when that stalls it stays
  // pinned at its FIRST entry — so a [0, 1] range would leave the glow
  // permanently absent. Starting part-way means the worst case is a
  // dimmer glow, while a normal scroll resolves it to full strength.
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);
  // The sunset itself washes in over the page's beige as you scroll into
  // the footer. Same fail-safe reasoning as the glow: it starts at 0.35
  // rather than 0, so a stalled scroll leaves a muted sunset rather than
  // no sunset at all. Fading THIS layer is safe in a way fading the whole
  // wash wasn't — the base .closing-footer-sunset underneath is not
  // scroll-linked and keeps the bottom dark, so the white wordmark can
  // never end up sitting on bare beige.
  const sunsetOpacity = useTransform(scrollYProgress, [0.05, 0.75], [0.35, 1]);

  /* The wordmark's float needs its OWN scroll range. The footer progress
     above is measured from the footer's top edge and completes once that
     edge reaches the top of the viewport — but the wordmark sits near the
     footer's bottom, so by the time it is on screen that value has long
     since pinned at 1 and would drive nothing.
     'start end' -> 'center center': 0 when the wordmark's top first enters
     the bottom of the viewport, 1 when it reaches the middle. */
  const brandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: brandProgress } = useScroll({
    target: brandRef,
    offset: ['start end', 'center center'],
  });
  /* Spring-smoothed for the same reason as the page background: raw scroll
     progress only updates when a scroll event fires, and those arrive in
     wheel-sized chunks, so binding straight to it steps rather than
     glides. */
  const brandFloat = useSpring(brandProgress, {
    duration: SPRING_SECONDS,
    bounce: 0,
    restDelta: 0.0002,
  });
  const brandY = useTransform(brandFloat, [0, 1], [90, 0]);
  const brandScale = useTransform(brandFloat, [0, 1], [0.94, 1]);

  if (!showClock) {
    return (
      <footer className="closing-footer">
        <div className="closing-footer-contact">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="closing-footer-mail"
            onClick={() =>
              track('cta_click', {
                cta_id: 'footer_email',
                cta_label: CONTACT_EMAIL,
                destination: 'email',
                section_name: 'footer',
              })
            }
          >
            {CONTACT_EMAIL}
          </a>
          <span className="closing-footer-year">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="closing-footer closing-footer--dark" data-section="footer" ref={footerRef}>
      {/* SKY — everything the sunset happens in. Splitting the footer into
          sky + base is what guarantees the wordmark below sits on flat
          charcoal like the reference, WITHOUT having to guess at what
          percentage of the footer the wordmark starts. The sky's gradient
          resolves to exactly #3a3a38 at its own 100%, and the base block
          is that same flat #3a3a38 — so the join is seamless by
          construction and survives any change to the wordmark's height. */}
      <div className="closing-footer-sky">
        {/* Two stacked layers, on purpose. The base is plain CSS at full
            strength and contributes nothing at the top but lands on the
            same charcoal at the bottom — that's what makes it safe to
            scroll-fade the warm layer on top of it. Fading a SINGLE
            combined wash (the earlier approach) also faded its opaque
            bottom, letting the page's beige show through behind white
            text; and if scrollYProgress stalls — a real failure mode noted
            in ProductionGradient3D.tsx, since a scroll-derived value only
            advances when scroll/rAF actually run — the worst case here is
            a muted sunset rather than an unreadable footer. */}
        <div className="closing-footer-sunset" aria-hidden="true">
          <motion.div className="closing-footer-sunset-warm" style={{ opacity: sunsetOpacity }} />
          <div className="closing-footer-sunset-drift" />
        </div>

        <motion.div
          className="closing-footer-meta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={IN_VIEW}
          transition={SPRING}
        >
          <div className="closing-footer-meta-col closing-footer-meta-left">
            <p>{closingNarrative.line1}</p>
            <p>{closingNarrative.line2}</p>
          </div>

          <div className="closing-footer-meta-col closing-footer-meta-center">
            <div className="closing-footer-clock-wrap">
              <motion.div className="closing-footer-glow" style={{ opacity: glowOpacity }} aria-hidden="true" />
              <BlurRevealElement className="closing-footer-clock-blur">
                <AnalogClock hourDeg={clock.hourDeg} minuteDeg={clock.minuteDeg} />
              </BlurRevealElement>
            </div>
          </div>

          <div className="closing-footer-meta-col closing-footer-meta-right">
            <p>{clock.digital}</p>
          </div>
        </motion.div>
      </div>

      {/* BASE — flat charcoal, the exact color the sky's gradient ends on. */}
      <div className="closing-footer-base">
        {/* Giant closing wordmark — the real two-line logo asset (not a
         * text recreation), forced white via filter since an <img> can't
         * be recolored with CSS `color`. Using the actual SVG rather than
         * approximating the letterforms means the "Foundati●n" dot styling
         * already baked into the asset just comes along for free. */}
        {/* Opacity stays on the whileInView reveal while the float comes
            from scroll — deliberately split rather than driving both off
            scroll progress.

            A scroll-derived value only advances while scroll and rAF
            actually run, and this file already documents that failure
            elsewhere. If opacity were scroll-bound, a frozen value would
            leave the wordmark permanently invisible. Bound to a reveal, the
            worst case is it simply animates in; the float is then free to
            fail safe too, since a stuck y offset is inert rather than
            broken. The two never collide: opacity is not a transform, so
            Framer's animate prop and the style motion values below are
            writing different properties. */}
        <motion.div
          ref={brandRef}
          className="closing-footer-brand"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={IN_VIEW}
          transition={SPRING}
          style={{ y: brandY, scale: brandScale }}
        >
          <img src={twoLineLogo} alt="Rasira Foundation" className="closing-footer-brand-logo" />
        </motion.div>

        {/* Year first, then the email UNDER it — the email used to sit in
            the meta row above the clock, which the reference doesn't show
            at all; it belongs down here in the sign-off. */}
        <div className="closing-footer-signoff">
          <span className="closing-footer-year closing-footer-year--homepage">© {new Date().getFullYear()}</span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="closing-footer-mail"
            onClick={() =>
              track('cta_click', {
                cta_id: 'footer_email',
                cta_label: CONTACT_EMAIL,
                destination: 'email',
                section_name: 'footer',
              })
            }
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
