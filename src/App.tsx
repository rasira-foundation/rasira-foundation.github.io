import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SplashScreen } from './components/Splash/SplashScreen';
import { SiteHeader } from './components/Header/SiteHeader';
import { NarrativeHero } from './components/Hero/NarrativeHero';
import { PillarsSection } from './components/Framework/PillarsSection';
import { SystemFramework } from './components/Framework/SystemFramework';
import { CollabsSection } from './components/CollabsSection';
import { PartnerDonationSection } from './components/PartnerDonationSection';
import { ArticleGrid } from './components/Articles/ArticleGrid';
import { ArticleDetail } from './components/Articles/ArticleDetail';
import { ClosingFooter } from './components/Footer/ClosingFooter';
import { NoiseOverlay } from './components/shared/NoiseOverlay';
import { ProductionGradient3D } from './components/shared/ProductionGradient3D';
import { useHashRoute } from './hooks/useHashRoute';
import { useScrollRestoration } from './hooks/useScrollRestoration';
import { useSectionBackground } from './hooks/useSectionBackground';
import { PageBackground } from './components/shared/PageBackground';

/* Page ground per section, in the style of Framer's Background Changer.
   Every value is an existing palette token rather than a new colour: the
   page is white throughout except the framework band, which picks up the
   recessed tone so the diagram's sand panel sits on something instead of
   floating on pure white. Sections declare these via data-bg below, and
   PageBackground crossfades between them. This map is the
   single place to change the sequence. */
const SECTION_BACKGROUNDS = {
  hero: 'var(--color-cream)',
  articles: 'var(--color-cream)',
  /* White, like the rest — NOT a tint, despite this being the section
     that wants one.

     A tint here was tried and produced a hard horizontal seam. The reason
     is structural rather than a matter of picking softer stops: this layer
     is fixed and full-viewport, while .pillars-section above it paints an
     opaque white fill that ends at a fixed DOCUMENT position. Wherever
     that section stops, the tinted layer behind it simply appears, with
     nothing to fade the join — and because the section scrolls while the
     layer does not, the edge travels up the screen as you go.

     The framework's tint lives on .system-framework instead, where it can
     fade in and out at its own top and bottom edges. See systemFramework.css. */
  framework: 'var(--color-cream)',
  closing: 'var(--color-cream)',
} as const;

const SPLASH_SEEN_KEY = 'rasira-splash-seen';
const MORPH_INTRO_SEEN_KEY = 'rasira-hero-intro-seen';

function App() {
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem(SPLASH_SEEN_KEY) !== '1');
  const [showMorphIntro, setShowMorphIntro] = useState(
    () => sessionStorage.getItem(MORPH_INTRO_SEEN_KEY) !== '1',
  );
  const route = useHashRoute();

  // Homepage only. The article route deliberately jumps to the top on
  // open (see ArticleDetail), and restoring a scroll position there would
  // fight that.
  useScrollRestoration(route.view === 'home');

  // Reads the data-bg of whichever section is crossing the middle of the
  // viewport; the crossfade itself is CSS on the ground element.
  const sectionBackground = useSectionBackground(SECTION_BACKGROUNDS.hero);

  // Progress has to be measured on the WRAPPER, not on .article-hub
  // itself: that element is position:sticky, so while it's pinned its own
  // bounding rect stays parked at top:0 and would report a constant
  // value. The wrapper keeps moving, so it's the only reliable driver for
  // the article's recede-into-depth effect.
  const layeredRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: layeredProgress } = useScroll({
    target: layeredRef,
    offset: ['start start', 'end start'],
  });
  const articleDepthScale = useTransform(layeredProgress, [0, 0.6], [1, 0.94]);
  const articleDepthOpacity = useTransform(layeredProgress, [0, 0.6], [1, 0.6]);
  // A progressive blur used to ride along with these, to sell the cards
  // receding BEHIND the photo rather than just sliding under it. Removed:
  // it made them unreadable rather than distant, and on mobile — where the
  // curtain doesn't overlap them the same way — it still ramped to its
  // full 12px and simply stayed there. Scale and opacity alone carry the
  // depth read without ever destroying the content.

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    setShowSplash(false);
  }, []);

  const handleMorphComplete = useCallback(() => {
    sessionStorage.setItem(MORPH_INTRO_SEEN_KEY, '1');
    setShowMorphIntro(false);
  }, []);

  // Lock scroll on the homepage sitting underneath while the splash is up.
  useEffect(() => {
    document.body.style.overflow = showSplash ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSplash]);

  return (
    <>
      <NoiseOverlay />

      {/* Homepage is always mounted underneath the splash. The header's own
          logo stays invisible (see visible={!showSplash} below) until the
          splash gradient itself clears, then fades in — visible again
          through the paper-strip typing and cinematic hero morph that
          follow it. */}
      {route.view === 'article' ? (
        <>
          <SiteHeader />
          <ArticleDetail slug={route.slug} />
          <ClosingFooter showClock={false} />
        </>
      ) : (
        <>
          {/* Depth background — see ProductionGradient3D.tsx. Every
              section below is transparent now; this single layer is
              what actually paints the page's color and floating orbs
              as it scrolls. */}
          <PageBackground background={sectionBackground} />
          <ProductionGradient3D />

          {/* Header lives inside the atmosphere band, which is
              transparent — ProductionGradient3D owns the color, this
              wrapper is just layout. A separate hero-only gradient
              overlay used to live here too, but it was a second gradient
              blended on top of ProductionGradient3D's own continuous one,
              capped at a fixed 100vh — since that boundary never lined up
              with ProductionGradient3D's own percentage-based stops, it
              left a visible seam where the overlay cut off. Removed; this
              band now just shows ProductionGradient3D straight through. */}
          <div className="atmosphere-band" data-bg={SECTION_BACKGROUNDS.hero}>
            <SiteHeader visible={!showSplash} />
            <NarrativeHero
              splashDone={!showSplash}
              showMorphIntro={showMorphIntro}
              onMorphComplete={handleMorphComplete}
            />
          </div>
          {/* This wrapper is what bounds the sticky pin. .article-hub is
              position:sticky, and a sticky element only stays pinned
              while its PARENT is still on screen — without a wrapper its
              parent would be the page root and it would stay stuck all
              the way to the footer. Ending the wrapper after
              PillarsSection releases it exactly once the classroom photo
              and the copy panel have finished sliding over it. */}
          <div className="layered-scroll" ref={layeredRef} data-bg={SECTION_BACKGROUNDS.articles}>
            <ArticleGrid
              heroDone={!showMorphIntro}
              depthScale={articleDepthScale}
              depthOpacity={articleDepthOpacity}
            />
            <PillarsSection heroDone={!showMorphIntro} />
          </div>
          <div data-bg={SECTION_BACKGROUNDS.framework}>
            <SystemFramework heroDone={!showMorphIntro} />
          </div>
          <div className="collabs-slot" data-bg={SECTION_BACKGROUNDS.closing}>
            <CollabsSection />
          </div>
          <PartnerDonationSection />
          <ClosingFooter />
        </>
      )}

      {/* AnimatePresence + the splash's own exit fade keeps it rendered
          (fading opacity 1 -> 0) through roughly the hero scatter items'
          settle window, instead of yanking it out the instant its internal
          handoff timer fires — no hard cut, no risk of a seam flashing
          through at the exact unmount instant. */}
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
      </AnimatePresence>
    </>
  );
}

export default App;
