import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useArticles } from './useArticles';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import { navigateHome } from '../../hooks/useHashRoute';
import { parseMarkdownLite } from '../../lib/markdown';
import './articleDetail.css';

const entrance = {
  initial: { opacity: 0, y: 18, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

/** Stands in for the article while it loads, laid out to the same shape it
 * will resolve into — badge row, two title lines, meta line, hero block.
 * Replaces a bare "Loading…" line, which flashed a single line of text and
 * then reflowed the whole page as the real content arrived. The blocks are
 * aria-hidden and the region is announced via role/aria-busy instead, so a
 * screen reader hears one "loading" rather than a list of empty boxes. */
export function ArticleDetailSkeleton() {
  return (
    <main className="article-detail" role="status" aria-busy="true" aria-label="Loading article">
      <div className="article-detail-col article-detail-skeleton" aria-hidden="true">
        <div className="article-detail-topbar">
          <span className="skeleton-block skeleton-back" />
        </div>
        <span className="skeleton-block skeleton-title" />
        <span className="skeleton-block skeleton-title skeleton-title--short" />
        {/* Mirrors the real meta row: badge first, then the byline. */}
        <div className="article-detail-meta">
          <span className="skeleton-block skeleton-badge" />
          <span className="skeleton-block skeleton-meta" />
        </div>
      </div>
      <div className="article-detail-hero" aria-hidden="true">
        <span className="skeleton-block skeleton-hero" />
      </div>
    </main>
  );
}

export function ArticleDetail({ slug }: { slug: string }) {
  const { articles, loading } = useArticles();
  const article = articles.find((a) => a.slug === slug);
  const showSkeleton = useDelayedFlag(loading);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (loading) {
    // Nothing at all until the load has been slow enough to be worth
    // acknowledging — see useDelayedFlag. A skeleton that appears and
    // vanishes inside a couple of hundred milliseconds is a flash of
    // layout, which reads worse than the brief blank it replaced.
    return showSkeleton ? <ArticleDetailSkeleton /> : <main className="article-detail" />;
  }

  if (!article) {
    return (
      <main className="article-detail">
        <div className="article-detail-col">
          <button
            type="button"
            className="article-detail-back"
            onClick={navigateHome}
            aria-label="Back to articles"
          >
            <span aria-hidden="true">←</span>
          </button>
          <p className="article-detail-loading">This article couldn&apos;t be found.</p>
        </div>
      </main>
    );
  }

  const body = article.content ? parseMarkdownLite(article.content) : [<p key="excerpt">{article.excerpt}</p>];

  return (
    // key={slug} forces a remount (and so a fresh entrance transition) even
    // when navigating directly from one article to another, not just from
    // the home grid.
    <motion.main key={slug} className="article-detail" {...entrance}>
      <div className="article-detail-col">
        <div className="article-detail-topbar">
          <button
            type="button"
            className="article-detail-back"
            onClick={navigateHome}
            aria-label="Back to articles"
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>

        <h1 className="article-detail-title">{article.title}</h1>

        {/* The category badge leads this row, sitting to the left of the
            contributor — it belongs with the article's attribution rather
            than up in the nav strip beside Back.

            Separate spans rather than one interpolated string so the
            separators can be hidden from screen readers; they would
            otherwise be read out as "bullet" between every field. */}
        <p className="article-detail-meta">
          <span className="article-detail-badge">{article.category}</span>
          <span className="article-detail-author">{article.author}</span>
          {article.date && (
            <>
              <span aria-hidden="true">•</span>
              <time>{article.date}</time>
            </>
          )}
          <span aria-hidden="true">•</span>
          <span>{article.readTime}</span>
        </p>
      </div>

      {article.coverImage && (
        <div className="article-detail-hero">
          <img src={article.coverImage} alt="" />
        </div>
      )}

      <div className="article-detail-col article-detail-body">{body}</div>
    </motion.main>
  );
}
