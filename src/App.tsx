import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/Splash/SplashScreen';
import { SiteHeader } from './components/Header/SiteHeader';
import { NarrativeHero } from './components/Hero/NarrativeHero';
import { FloatingNodes } from './components/Nodes/FloatingNodes';
import { ArticleGrid } from './components/Articles/ArticleGrid';
import { ArticleDetail } from './components/Articles/ArticleDetail';
import { ClosingFooter } from './components/Footer/ClosingFooter';
import { NoiseOverlay } from './components/shared/NoiseOverlay';
import { useHashRoute } from './hooks/useHashRoute';

const SPLASH_SEEN_KEY = 'rasira-splash-seen';

function App() {
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem(SPLASH_SEEN_KEY) !== '1');
  const route = useHashRoute();

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    setShowSplash(false);
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
          splash's copy hands off to it via a shared layoutId. */}
      {route.view === 'article' ? (
        <>
          <SiteHeader />
          <ArticleDetail slug={route.slug} />
          <ClosingFooter />
        </>
      ) : (
        <>
          {/* Header lives inside the atmosphere band so the sky gradient
              runs continuously from the very top of the viewport, with
              no seam behind the sticky nav. FloatingNodes is its own
              section (Section 2) with its own gradient, picking up at
              the exact color .atmosphere-band ends on — no shared
              wrapper needed for that continuity, just matched color
              stops on each side. */}
          <div className="atmosphere-band">
            <SiteHeader visible={!showSplash} />
            <NarrativeHero splashDone={!showSplash} />
          </div>
          <FloatingNodes />
          <ArticleGrid />
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
