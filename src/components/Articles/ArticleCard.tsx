import { motion } from 'framer-motion';
import type { Article } from '../../lib/sheets';
import { navigateToArticle } from '../../hooks/useHashRoute';
import { getAsciiArt } from './asciiArt';

interface ArticleCardProps {
  article: Article;
  index: number;
  span: number;
  featured?: boolean;
}

export function ArticleCard({ article, index, span, featured = false }: ArticleCardProps) {
  const hasImage = Boolean(article.coverImage);

  const classNames = [
    'article-card',
    hasImage ? 'article-card--image' : 'article-card--ascii',
    featured && 'article-card--featured',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      type="button"
      className={classNames}
      style={{ gridColumn: `span ${span}` }}
      onClick={() => navigateToArticle(article.slug)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: (index % 5) * 0.06 }}
    >
      {hasImage ? (
        <>
          <img className="article-card-image" src={article.coverImage!} alt="" loading="lazy" />
          <div className="article-card-scrim" aria-hidden="true" />
          <span className="article-card-category article-card-category--on-image">{article.category}</span>
          <div className="article-card-image-foot">
            <h3 className="article-card-title article-card-title--on-image">{article.title}</h3>
            <span className="article-card-meta article-card-meta--on-image">
              {article.date && `${article.date} · `}
              {article.readTime}
            </span>
          </div>
          <span className="article-card-arrow article-card-arrow--on-image" aria-hidden="true">
            →
          </span>
        </>
      ) : (
        <>
          <span className="article-card-category">{article.category}</span>
          {!featured && (
            <pre className="article-card-ascii" aria-hidden="true">
              {getAsciiArt(article.slug)}
            </pre>
          )}
          <h3 className="article-card-title">{article.title}</h3>
          <p className="article-card-excerpt">{article.excerpt}</p>
          <div className="article-card-footrow">
            <span className="article-card-meta">
              {article.date && `${article.date} · `}
              {article.readTime}
            </span>
            <span className="article-card-arrow" aria-hidden="true">
              →
            </span>
          </div>
        </>
      )}
    </motion.button>
  );
}
