import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { ArticleCategory } from '../../lib/sheets';
import { useArticles } from './useArticles';
import { ArticleCard } from './ArticleCard';
import './articleGrid.css';

const TABS: ArticleCategory[] = ['Highlight', 'Toolkit', 'Framework', 'Article'];

// Asymmetrical rhythm, columns out of a 12-col grid: one wide feature
// followed by a row of smaller pieces, repeating — frog.co/designmind style.
const SPAN_PATTERN = [7, 5, 4, 4, 4];
const HIGHLIGHT_SPAN = 6; // clean 2x2: two 6-of-12 cards per row

export function ArticleGrid() {
  const { articles, loading, isFallback } = useArticles();
  const [activeTab, setActiveTab] = useState<ArticleCategory>('Highlight');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => (activeTab === 'Highlight' ? articles : articles.filter((a) => a.category === activeTab)),
    [articles, activeTab],
  );

  // Highlight's collapsed view is a fixed 2x2 (4 cards, top row featured);
  // every other tab — and Highlight once "See All" is clicked — keeps the
  // asymmetric flow.
  const isHighlightPreview = activeTab === 'Highlight' && !showAll;
  const previewCount = activeTab === 'Highlight' ? 4 : 3;
  const visible = showAll ? filtered : filtered.slice(0, previewCount);

  return (
    <section className="article-hub">
      <div className="article-hub-inner">
        <nav className="article-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === activeTab ? 'article-tab active' : 'article-tab'}
              onClick={() => {
                setActiveTab(tab);
                setShowAll(false);
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
          <motion.div className={isHighlightPreview ? 'article-grid article-grid--2x2' : 'article-grid'} layout>
            {visible.map((article, i) => (
              <ArticleCard
                key={article.slug}
                article={article}
                index={i}
                span={isHighlightPreview ? HIGHLIGHT_SPAN : SPAN_PATTERN[i % SPAN_PATTERN.length]}
                featured={isHighlightPreview && i < 2}
              />
            ))}
          </motion.div>
        )}

        {!showAll && filtered.length > previewCount && (
          <button type="button" className="article-hub-see-all" onClick={() => setShowAll(true)}>
            See All
          </button>
        )}
      </div>
    </section>
  );
}
