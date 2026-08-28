import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type MotionValue } from 'framer-motion';
import type { ArticleCategory } from '../../lib/sheets';
import { useArticles } from './useArticles';
import { ArticleCard } from './ArticleCard';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import { SectionHeading } from '../shared/SectionHeading';
import { articleSection } from '../../data/siteContent';
import './articleGrid.css';
import { track } from '../../lib/analytics';

const TABS: ArticleCategory[] = ['Highlight', 'Toolkit', 'Framework', 'Article'];
const PER_ROW = 4;

/** Survives the article round trip; see the note on isExpanded below. */
const EXPANDED_KEY = 'rasira-articles-expanded';

const EASE = [0.16, 1, 0.3, 1] as const;
/** Shared by the grid and the button so the container's height change and
 * the button's move are one motion rather than two that nearly match. */
const GRID_TRANSITION = { duration: 0.5, ease: EASE } as const;
const CARD_TRANSITION = { duration: 0.35, ease: EASE } as const;

interface ArticleGridProps {
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished, regardless of scroll position — see PillarsSection. Also
   * passed down to each ArticleCard so their own reveal doesn't rely on
   * whileInView (see the comment on that prop in ArticleCard.tsx). */
  heroDone: boolean;
  /** Scroll-driven "recede into depth" as the classroom curtain slides
   * over this section. Applied to the inner wrapper rather than the
   * <section> itself, because the section already animates opacity for
   * the heroDone gate and the two would fight over the same property.
   *
   * Scale and opacity only — there was a scroll-driven blur here too, and
   * it's gone. It made the cards genuinely unreadable rather than just
   * distant, and worst of all on mobile, where the curtain doesn't ride
   * over them the same way but the blur still ramped to its full 12px and
   * stayed there. */
  depthScale?: MotionValue<number>;
  depthOpacity?: MotionValue<number>;
}

/** One row of placeholder cards, built on the same .article-grid so it
 * inherits the real border-collapse layout and 3:4 card ratio — the row
 * that arrives is the same size as the row that was standing in for it,
 * so nothing reflows underneath. aria-hidden with the region announced
 * once via role/aria-busy, rather than four empty boxes read out. */
function ArticleGridSkeleton() {
  return (
    <div className="article-grid" role="status" aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: PER_ROW }, (_, i) => (
        <div className="article-card article-card--skeleton" key={i} aria-hidden="true">
          <span className="skeleton-block skeleton-card-category" />
          <span className="skeleton-block skeleton-card-title" />
          <span className="skeleton-block skeleton-card-title skeleton-card-title--short" />
        </div>
      ))}
    </div>
  );
}

export function ArticleGrid({ heroDone, depthScale, depthOpacity }: ArticleGridProps) {
  const { articles, loading, isFallback } = useArticles();
  const showSkeleton = useDelayedFlag(loading);
  const [activeTab, setActiveTab] = useState<ArticleCategory>('Highlight');
  /* Expanded/collapsed survives navigating into an article and back.
   *
   * This is not only a convenience. useScrollRestoration puts the page
   * back where it was, and a restored scroll position only means anything
   * if the page is the same HEIGHT it was — collapsing the grid on return
   * removes rows above the saved offset, so the restore lands somewhere
   * else entirely, or gets clamped because the document is now shorter
   * than the position it is trying to reach. The two have to agree.
   *
   * sessionStorage rather than component state for the same reason the
   * scroll position uses it: the grid unmounts entirely on the article
   * route, so nothing in React survives the round trip. Read lazily in the
   * initialiser so the very first render is already correct and the list
   * never flashes collapsed before expanding. */
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return sessionStorage.getItem(EXPANDED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(EXPANDED_KEY, isExpanded ? '1' : '0');
    } catch {
      /* Private mode or quota — losing the preference is not worth an error. */
    }
  }, [isExpanded]);

  const filtered = useMemo(
    () => (activeTab === 'Highlight' ? articles : articles.filter((a) => a.category === activeTab)),
    [articles, activeTab],
  );

  const visible = isExpanded ? filtered : filtered.slice(0, PER_ROW);
  const canExpand = filtered.length > PER_ROW;

  /* Collapsing removes rows ABOVE the button, so the page shortens under
     the viewport and the button lands somewhere else entirely. This used to
     scroll to the top of the SECTION, which fixed the disorientation but
     overshot — you pressed a control at the bottom of the list and were
     thrown up to the first article. Returning to the button keeps you where
     you were acting.
     Only on collapse: expanding adds rows BELOW the button, so nothing
     above it moves and the page does not need to chase anything. */
  const collapsing = useRef(false);

  const handleToggle = () => {
    collapsing.current = isExpanded;
    setIsExpanded((v) => {
      /* Reported from inside the updater so the value logged is the one
         actually committed, not a stale read of the previous render. */
      track('article_list_toggle', { action: v ? 'collapse' : 'expand' });
      return !v;
    });
  };

  useEffect(() => {
    if (!collapsing.current) return;
    collapsing.current = false;
    /* Waits out the grid's own layout animation rather than firing on the
       next frame. Two reasons a single rAF was wrong: the grid animates its
       height over GRID_TRANSITION, so one frame later the button is still
       mid-flight and scrollIntoView would chase a transient position; and
       rAF does not fire at all in a backgrounded tab, so the scroll would
       simply never happen. A timer still fires there (throttled, which is
       harmless when nobody is looking). */
    const id = window.setTimeout(
      () => buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      GRID_TRANSITION.duration * 1000,
    );
    return () => window.clearTimeout(id);
  }, [isExpanded]);

  // Sticky offset, measured rather than declared — this is what makes the
  // classroom curtain work on a phone.
  //
  // `top: 0` pins the TOP edge, which is right while the section fits the
  // viewport (desktop): the whole card row holds still and the photo
  // scrolls up over it. On a narrow screen the cards stack far taller than
  // the screen, so a top pin anchors the top and parks See All below the
  // fold forever.
  //
  // `bottom: 0` is NOT the fix, though it looks like it should be. Sticky
  // `bottom` pulls an element UP into view early and releases it once its
  // natural position catches up — so it lets go before the photo ever
  // arrives, which is exactly why the curtain never appeared here.
  //
  // Pinning the BOTTOM edge of an over-tall element needs a negative top,
  // and that value depends on the element's own height, which CSS cannot
  // express. Hence measuring. Math.min(0, …) means the formula covers both
  // cases with no breakpoint: it resolves to 0 whenever the section fits.
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const measure = () => setStickyTop(Math.min(0, window.innerHeight - el.offsetHeight));
    measure();
    // The height changes with the card images loading and with See All
    // expanding, neither of which fires a resize event.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className={isExpanded ? 'article-hub article-hub--expanded' : 'article-hub'}
      data-section="articles"
      animate={{ opacity: heroDone ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      /* top must be 0 while expanded. .article-hub--expanded switches this
         to position:relative, and on a relatively-positioned element a
         negative top is not a sticky anchor — it is a layout offset, so
         the measured value would drag the whole section bodily up over
         the hero above it. */
      style={{ pointerEvents: heroDone ? 'auto' : 'none', top: isExpanded ? 0 : stickyTop }}
    >
      {/* The depth treatment only makes sense while the classroom curtain
          is actually riding over these cards. Once expanded, the sticky
          pin is released and the curtain is pushed down past the full
          list, so there's nothing overlapping to recede behind — the
          scroll-linked values are swapped for static neutral ones rather
          than left running against a curtain that isn't there. */}
      <motion.div
        className="article-hub-inner"
        style={
          isExpanded
            ? { scale: 1, opacity: 1 }
            : { scale: depthScale, opacity: depthOpacity }
        }
      >
        <nav className="article-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === activeTab ? 'article-tab active' : 'article-tab'}
              onClick={() => {
                setActiveTab(tab);
                setIsExpanded(false);
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {isFallback && (
          <p className="article-hub-notice">
            Showing demo content — connect a published Google Sheet (VITE_SHEET_ID) to publish live articles.
          </p>
        )}

        {/* The heading sits INSIDE the frame, as its title bar. The frame
            itself moved off .article-grid and onto this wrapper so the
            heading is inside it — which also keeps the heading present in
            the loading and empty states, where there is no grid to hang it
            on. See the border-collapse note in the stylesheet: the wrapper
            now draws the top and left edges, the cards still draw the
            right and bottom, and the rule under the heading is what closes
            it off from the first row. */}
        <div className="article-hub-panel">
          <SectionHeading title={articleSection.title} subtitle={articleSection.subtitle} />

          {loading ? (
          /* Nothing at all until the fetch has been slow enough to be
             worth acknowledging (see useDelayedFlag). This is the state
             you land in coming Back from an article, where the articles
             are usually already in memory — so in the common case no
             placeholder is rendered and there is nothing to flash. */
          showSkeleton && <ArticleGridSkeleton />
        ) : visible.length === 0 ? (
          <p className="article-hub-loading">Nothing published in this category yet.</p>
        ) : (
          /* `layout` on the grid animates its own height as rows are added
             or removed, so the button below and the whole page beneath it
             slide rather than jumping.

             mode="popLayout" is what makes collapsing look right: it pulls
             exiting cards out of layout flow immediately, so the remaining
             cards begin closing up straight away instead of waiting for the
             exit animation to finish and then snapping. */
          <motion.div className="article-grid" layout transition={GRID_TRANSITION}>
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((article, i) => (
                <motion.div
                  key={article.slug}
                  layout
                  className="article-grid-cell"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{
                    ...CARD_TRANSITION,
                    /* Only the NEWLY revealed cards stagger. The first row
                       is already on screen when you press See All, so
                       delaying it would restart an animation on cards that
                       never moved. */
                    delay: isExpanded && i >= PER_ROW ? (i - PER_ROW) * 0.06 : 0,
                  }}
                >
                  <ArticleCard article={article} index={i % PER_ROW} />
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {canExpand && (
          /* layout so the button rides the grid's height change rather than
             being teleported to its new position on the next frame. */
          <motion.button
            ref={buttonRef}
            layout
            transition={GRID_TRANSITION}
            type="button"
            className="article-hub-see-all"
            onClick={handleToggle}
          >
            {isExpanded ? 'Show Less' : 'See All'}
          </motion.button>
        )}
      </motion.div>
    </motion.section>
  );
}
