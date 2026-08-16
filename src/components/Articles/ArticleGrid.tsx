import { useMemo, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import type { ArticleCategory } from '../../lib/sheets';
import { useArticles } from './useArticles';
import { ArticleCard } from './ArticleCard';
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
   * the heroDone gate and the two would fight over the same property. */
  depthScale?: MotionValue<number>;
  depthOpacity?: MotionValue<number>;
  /** Scroll-driven blur string, e.g. `blur(6px)`. */
  depthFilter?: MotionValue<string>;
}

export function ArticleGrid({ heroDone, depthScale, depthOpacity, depthFilter }: ArticleGridProps) {
  const { articles, loading, isFallback } = useArticles();
  const [activeTab, setActiveTab] = useState<ArticleCategory>('Highlight');
  const [isExpanded, setIsExpanded] = useState(false);

  const filtered = useMemo(
    () => (activeTab === 'Highlight' ? articles : articles.filter((a) => a.category === activeTab)),
    [articles, activeTab],
  );

  const visible = isExpanded ? filtered : filtered.slice(0, PER_ROW);
  const canExpand = filtered.length > PER_ROW;

  return (
    <motion.section
      className={isExpanded ? 'article-hub article-hub--expanded' : 'article-hub'}
      animate={{ opacity: heroDone ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: heroDone ? 'auto' : 'none' }}
    >
      {/* The depth treatment (blur / scale / fade) only makes sense while
          the classroom curtain is actually riding over these cards. Once
          expanded, the sticky pin is released and the curtain is pushed
          down past the full list, so there's nothing overlapping to
          recede behind — the scroll-linked values are swapped for static
          neutral ones rather than left running against a curtain that
          isn't there. */}
      <motion.div
        className="article-hub-inner"
        style={
          isExpanded
            ? { scale: 1, opacity: 1, filter: 'blur(0px)' }
            : { scale: depthScale, opacity: depthOpacity, filter: depthFilter }
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
          <p className="article-hub-loading">Loading articles…</p>
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
