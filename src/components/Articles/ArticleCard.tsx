import { motion } from 'framer-motion';
import type { Article } from '../../lib/sheets';
import { navigateToArticle } from '../../hooks/useHashRoute';
import { getAsciiArt } from './asciiArt';

type CardVariant = 'ascii' | 'text-only' | 'image-overlay' | 'bottom-text';

interface ArticleCardProps {
  article: Article;
  index: number;
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished — driven here rather than via whileInView, which could
   * fire (and permanently spend its once:true trigger) while still
   * hidden behind the splash overlay, or simply never fire reliably;
   * see the SystemFramework fix earlier this session for the exact
   * failure mode this replaced. Cards near the top of the page (this
   * grid is now the second section, right after the hero) are the ones
   * most exposed to that risk. */
  heroDone: boolean;
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

export function ArticleCard({ article, index, heroDone }: ArticleCardProps) {
  const variant = getVariant(article, index);

  const content = (
    <>
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
    </>
  );

  const motionProps = {
    className: `article-card article-card--${variant}`,
    animate: heroDone
      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
      : { opacity: 0, y: 20, filter: 'blur(8px)' },
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: heroDone ? (index % 4) * 0.06 : 0,
    },
  };

  // Rows with a Substack/external URL link straight out to the original
  // post — no need to also paste the full content in for those to show
  // up here. Same visual card either way, just a different element/href
  // under the hood (a real anchor for the external case, so browser
  // affordances like "open in new tab" and the status-bar preview work).
  if (article.externalUrl) {
    return (
      <motion.a href={article.externalUrl} target="_blank" rel="noopener noreferrer" {...motionProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type="button" onClick={() => navigateToArticle(article.slug)} {...motionProps}>
      {content}
    </motion.button>
  );
}
