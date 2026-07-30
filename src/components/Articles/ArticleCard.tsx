import { motion } from 'framer-motion';
import type { Article } from '../../lib/sheets';
import { navigateToArticle } from '../../hooks/useHashRoute';
import { getAsciiArt } from './asciiArt';

type CardVariant = 'ascii' | 'text-only' | 'image-overlay' | 'bottom-text';

interface ArticleCardProps {
  article: Article;
  index: number;
}

// Cards with a real cover image always get the photo treatment; the rest
// cycle through the other three variants by grid position, so the row
// reads as a deliberately varied editorial layout rather than four
// identical tiles.
const TEXT_VARIANTS: CardVariant[] = ['ascii', 'text-only', 'bottom-text'];

function getVariant(article: Article, index: number): CardVariant {
  if (article.coverImage) return 'image-overlay';
  return TEXT_VARIANTS[index % TEXT_VARIANTS.length];
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const variant = getVariant(article, index);

  return (
    <motion.button
      type="button"
      className={`article-card article-card--${variant}`}
      onClick={() => navigateToArticle(article.slug)}
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.06 }}
    >
      {variant === 'image-overlay' && (
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
      )}

      {variant === 'ascii' && (
        <>
          <div className="article-card-top">
            <span className="article-card-category">{article.category}</span>
            <h3 className="article-card-title">{article.title}</h3>
          </div>
          <span className="article-card-arrow article-card-arrow--mid-right" aria-hidden="true">
            →
          </span>
          <pre className="article-card-ascii" aria-hidden="true">
            {getAsciiArt(article.slug)}
          </pre>
        </>
      )}

      {variant === 'text-only' && (
        <>
          <div className="article-card-top">
            <span className="article-card-category">{article.category}</span>
            <h3 className="article-card-title">{article.title}</h3>
          </div>
          <span className="article-card-arrow article-card-arrow--corner" aria-hidden="true">
            →
          </span>
        </>
      )}

      {variant === 'bottom-text' && (
        <>
          <span className="article-card-arrow article-card-arrow--top-right" aria-hidden="true">
            →
          </span>
          <div className="article-card-bottom">
            <span className="article-card-category">{article.category}</span>
            <h3 className="article-card-title">{article.title}</h3>
            <span className="article-card-meta">
              {article.date && `${article.date} · `}
              {article.readTime}
            </span>
          </div>
        </>
      )}
    </motion.button>
  );
}
