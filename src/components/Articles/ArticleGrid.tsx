import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { ArticleCategory } from '../../lib/sheets';
import { useArticles } from './useArticles';
import { ArticleCard } from './ArticleCard';
import './articleGrid.css';

const TABS: ArticleCategory[] = ['Highlight', 'Toolkit', 'Framework', 'Article'];
const PER_ROW = 4;

export function ArticleGrid() {
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
      </div>
    </section>
  );
}
