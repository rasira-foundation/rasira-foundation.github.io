import { useCallback, useEffect, useState } from 'react';
import { SplashScreen } from './components/Splash/SplashScreen';
import { SiteHeader } from './components/Header/SiteHeader';
import { NarrativeHero } from './components/Hero/NarrativeHero';
import { FloatingNodes } from './components/Nodes/FloatingNodes';
import { ArticleGrid } from './components/Articles/ArticleGrid';
import { ArticleDetail } from './components/Articles/ArticleDetail';
import { ClosingFooter } from './components/Footer/ClosingFooter';
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
      <div className="noise-overlay" />

      {/* Homepage is always mounted so the splash's own opacity fade reveals
          it directly underneath — a real cross-fade, not a hard swap. */}
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
              no seam behind the sticky nav. */}
          <div className="atmosphere-band">
            <SiteHeader />
            <NarrativeHero />
            <FloatingNodes />
          </div>
          <ArticleGrid />
          <ClosingFooter />
        </>
      )}

      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    </>
  );
}

export default App;
