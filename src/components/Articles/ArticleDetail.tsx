import { useArticles } from './useArticles';
import { navigateHome } from '../../hooks/useHashRoute';
import { parseMarkdownLite } from '../../lib/markdown';
import './articleDetail.css';

export function ArticleDetail({ slug }: { slug: string }) {
  const { articles, loading } = useArticles();
  const article = articles.find((a) => a.slug === slug);

  if (loading) {
    return (
      <main className="article-detail">
        <p className="article-detail-loading">Loading…</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="article-detail">
        <div className="article-detail-col">
          <button type="button" className="article-detail-back" onClick={navigateHome}>
            ← Back
          </button>
          <p className="article-detail-loading">This article couldn&apos;t be found.</p>
        </div>
      </main>
    );
  }

  const body = article.content ? parseMarkdownLite(article.content) : [<p key="excerpt">{article.excerpt}</p>];

  return (
    <main className="article-detail">
      <div className="article-detail-col">
        <button type="button" className="article-detail-back" onClick={navigateHome}>
          ← Back
        </button>

        <span className="article-detail-badge">{article.category}</span>
        <h1 className="article-detail-title">{article.title}</h1>
        <p className="article-detail-meta">
          {article.author}
          {article.date && ` · ${article.date}`}
          {` · ${article.readTime}`}
        </p>
      </div>

      {article.coverImage && (
        <div className="article-detail-hero">
          <img src={article.coverImage} alt="" />
        </div>
      )}

      <div className="article-detail-col article-detail-body">{body}</div>
    </main>
  );
}
