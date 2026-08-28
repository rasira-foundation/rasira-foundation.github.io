import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SplashScreen } from './components/Splash/SplashScreen';
import { SiteHeader } from './components/Header/SiteHeader';
import { NarrativeHero } from './components/Hero/NarrativeHero';
import { PillarsSection } from './components/Framework/PillarsSection';
import { SystemFramework } from './components/Framework/SystemFramework';
import { CollabsSection } from './components/CollabsSection';
import { ConstellationDivider } from './components/shared/ConstellationDivider';
import { PartnerDonationSection } from './components/PartnerDonationSection';
import { ArticleGrid } from './components/Articles/ArticleGrid';
import { ArticleDetail } from './components/Articles/ArticleDetail';
import { ClosingFooter } from './components/Footer/ClosingFooter';
import { NoiseOverlay } from './components/shared/NoiseOverlay';
import { ProductionGradient3D } from './components/shared/ProductionGradient3D';
import { useHashRoute } from './hooks/useHashRoute';
import { useScrollRestoration } from './hooks/useScrollRestoration';
import { PageBackground } from './components/shared/PageBackground';
import { initSectionTracking, rescanSections, track, trackPageView } from './lib/analytics';

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

  /* When the page began, so the splash can report how long it actually
     held someone. Read once at mount rather than from performance.now() at
     completion, so a slow bundle is counted as part of the wait — that is
     the number worth knowing. */
  const startedAt = useRef(performance.now());

  const handleSplashComplete = useCallback(() => {
    /* Whether the splash ran at all is the more interesting half: it only
       shows once per session, so a returning visitor skips it entirely, and
       a splash_complete with skipped=true is what distinguishes "sat
       through the intro" from "came straight in". */
    track('splash_complete', {
      duration_seconds: Math.round((performance.now() - startedAt.current) / 100) / 10,
      skipped: false,
    });
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    setShowSplash(false);
  }, []);

  /* The splash is skipped outright on a second visit within the session,
     so there is no completion handler to hang this off. */
  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_SEEN_KEY) === '1') {
      track('splash_complete', { duration_seconds: 0, skipped: true });
    }
    initSectionTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* GA4 sends one page_view on load and nothing after. Opening an article
     only changes the hash, so without this every article read would be
     folded into the homepage and the article count would always be zero. */
  useEffect(() => {
    if (route.view === 'article') {
      trackPageView(`/article/${route.slug}`, `Article: ${route.slug}`);
    } else {
      trackPageView('/', 'Rasira Foundation | Home');
    }
    /* The tree swaps between the two views, so the observed elements are
       replaced and have to be picked up again. */
    const id = window.setTimeout(rescanSections, 300);
    return () => window.clearTimeout(id);
  }, [route]);

  const handleMorphComplete = useCallback(() => {
    /* The funnel's second step. Fired when the hero intro finishes rather
       than when React mounts, because that is the first moment the visitor
       can actually read anything — the gap between splash_complete and this
       is where someone who bounced during the intro disappears. */
    track('home_view');
    sessionStorage.setItem(MORPH_INTRO_SEEN_KEY, '1');
    setShowMorphIntro(false);
  }, []);

  /* Keeps the document canvas matching the splash for as long as the
     splash is up — see the note in main.tsx and the critical CSS in
     index.html. The class starts on (set synchronously in the document, so
     it applies to the very first paint) and comes off only once the splash
     has finished, which is what stops a mismatched strip showing wherever
     the fixed splash does not reach. */
  useEffect(() => {
    document.documentElement.classList.toggle('pre-mount', showSplash);
  }, [showSplash]);

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
          <PageBackground active={!showSplash} />
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
          {/* This wrapper is what bounds the sticky pin. .article-hub is
              position:sticky, and a sticky element only stays pinned
              while its PARENT is still on screen — without a wrapper its
              parent would be the page root and it would stay stuck all
              the way to the footer. Ending the wrapper after
              PillarsSection releases it exactly once the classroom photo
              and the copy panel have finished sliding over it. */}
          <div className="layered-scroll" ref={layeredRef}>
            <ArticleGrid
              heroDone={!showMorphIntro}
              depthScale={articleDepthScale}
              depthOpacity={articleDepthOpacity}
            />
            <PillarsSection heroDone={!showMorphIntro} />
          </div>
          <SystemFramework heroDone={!showMorphIntro} />
          {/* One rule, opening the Collabs block rather than bracketing it.
              A second below turned out to be one mark too many: it sat
              between two blocks that already read as separate, and the pair
              framed the copy like a plaque instead of just starting it. */}
          <ConstellationDivider />
          <div className="collabs-slot">
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
