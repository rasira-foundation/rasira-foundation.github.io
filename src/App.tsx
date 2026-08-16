import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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

const SPLASH_SEEN_KEY = 'rasira-splash-seen';
const MORPH_INTRO_SEEN_KEY = 'rasira-hero-intro-seen';

function App() {
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem(SPLASH_SEEN_KEY) !== '1');
  const [showMorphIntro, setShowMorphIntro] = useState(
    () => sessionStorage.getItem(MORPH_INTRO_SEEN_KEY) !== '1',
  );
  const route = useHashRoute();

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
          <div className="atmosphere-band">
            <SiteHeader visible={!showSplash} />
            <NarrativeHero
              splashDone={!showSplash}
              showMorphIntro={showMorphIntro}
              onMorphComplete={handleMorphComplete}
            />
          </div>
          <ArticleGrid heroDone={!showMorphIntro} />
          <PillarsSection heroDone={!showMorphIntro} />
          <SystemFramework heroDone={!showMorphIntro} />
          <div className="collabs-slot">
            <CollabsSection heroDone={!showMorphIntro} />
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
