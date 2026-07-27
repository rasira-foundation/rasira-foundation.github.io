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

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const route = useHashRoute();
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

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
              <NarrativeHero />
              <FloatingNodes />
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
