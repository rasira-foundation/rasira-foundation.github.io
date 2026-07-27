import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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
  const [splashDone, setSplashDone] = useState(() => sessionStorage.getItem(SPLASH_SEEN_KEY) === '1');
  const route = useHashRoute();
  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    setSplashDone(true);
  }, []);

  return (
    <>
      <div className="noise-overlay" />

      <AnimatePresence>{!splashDone && <SplashScreen onComplete={handleSplashComplete} />}</AnimatePresence>

      {splashDone && (
        <>
          <SiteHeader />
          {route.view === 'article' ? (
            <ArticleDetail slug={route.slug} />
          ) : (
            <>
              <div className="atmosphere-band">
                <NarrativeHero />
                <FloatingNodes />
              </div>
              <ArticleGrid />
            </>
          )}
          <ClosingFooter />
        </>
      )}
    </>
  );
}

export default App;
