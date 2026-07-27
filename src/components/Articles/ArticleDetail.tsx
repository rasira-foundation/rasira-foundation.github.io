import { useArticles } from './useArticles';
import { navigateHome } from '../../hooks/useHashRoute';
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
        <button type="button" className="article-detail-back" onClick={navigateHome}>
          ← Back
        </button>
        <p className="article-detail-loading">This article couldn&apos;t be found.</p>
      </main>
    );
  }

  const paragraphs = article.content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="article-detail">
      <button type="button" className="article-detail-back" onClick={navigateHome}>
        ← Back
      </button>

      <p className="article-detail-category">{article.category}</p>
      <h1 className="article-detail-title">{article.title}</h1>
      <p className="article-detail-meta">
        {article.author}
        {article.date && ` · ${article.date}`}
      </p>

      {article.coverImage && (
        <div className="article-detail-cover">
          <img src={article.coverImage} alt="" />
        </div>
      )}

      <div className="article-detail-body">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p>{article.excerpt}</p>
        )}
      </div>
    </main>
  );
}
