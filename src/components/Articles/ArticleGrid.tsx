import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import type { ArticleCategory } from '../../lib/sheets';
import { useArticles } from './useArticles';
import { ArticleCard } from './ArticleCard';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import './articleGrid.css';

const TABS: ArticleCategory[] = ['Highlight', 'Toolkit', 'Framework', 'Article'];
const PER_ROW = 4;

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
  const [isExpanded, setIsExpanded] = useState(false);

  const filtered = useMemo(
    () => (activeTab === 'Highlight' ? articles : articles.filter((a) => a.category === activeTab)),
    [articles, activeTab],
  );

  const visible = isExpanded ? filtered : filtered.slice(0, PER_ROW);
  const canExpand = filtered.length > PER_ROW;

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
          <motion.div className="article-grid" layout>
            {visible.map((article, i) => (
              <ArticleCard key={article.slug} article={article} index={i % PER_ROW} />
            ))}
          </motion.div>
        )}

        {canExpand && (
          <button type="button" className="article-hub-see-all" onClick={() => setIsExpanded((v) => !v)}>
            {isExpanded ? 'Show Less' : 'See All'}
          </button>
        )}
      </motion.div>
    </motion.section>
  );
}
