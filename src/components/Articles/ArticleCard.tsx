import { motion } from 'framer-motion';
import type { Article } from '../../lib/sheets';
import { navigateToArticle } from '../../hooks/useHashRoute';

export function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <motion.button
      type="button"
      className="article-card"
      onClick={() => navigateToArticle(article.slug)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
    >
      <div className="article-card-body">
        <p className="article-card-excerpt">{article.excerpt || article.title}</p>
      </div>
      {article.coverImage && (
        <div className="article-card-media">
          <img src={article.coverImage} alt="" loading="lazy" />
        </div>
      )}
      <span className="article-card-arrow" aria-hidden="true">
        →
      </span>
    </motion.button>
  );
}
