import { motion } from 'framer-motion';
import type { Article } from '../../lib/sheets';
import { navigateToArticle } from '../../hooks/useHashRoute';
import { getAsciiArt } from './asciiArt';

interface ArticleCardProps {
  article: Article;
  index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const hasImage = Boolean(article.coverImage);

  return (
    <motion.button
      type="button"
      className={hasImage ? 'article-card article-card--image' : 'article-card article-card--ascii'}
      onClick={() => navigateToArticle(article.slug)}
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.06 }}
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
          <div className="article-card-top">
            <span className="article-card-category">{article.category}</span>
            <h3 className="article-card-title">{article.title}</h3>
            <p className="article-card-excerpt">{article.excerpt}</p>
          </div>
          <pre className="article-card-ascii" aria-hidden="true">
            {getAsciiArt(article.slug)}
          </pre>
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
