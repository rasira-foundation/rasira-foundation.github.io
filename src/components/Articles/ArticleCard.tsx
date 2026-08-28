import { motion } from 'framer-motion';
import type { Article } from '../../lib/sheets';
import { navigateToArticle } from '../../hooks/useHashRoute';
import { track } from '../../lib/analytics';
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

  // Scroll-driven blur reveal that replays in both directions. The
  // heroDone gate lives on the parent section's own opacity, so these
  // stay invisible during the intro regardless of what the observer does.
  /* Fired before navigating, not after: the hash change unmounts this card,
     and an event queued after that races the teardown. `position` is the
     card's place in the grid, which is what tells you whether the top row
     is doing all the work or people are reading down. */
  const trackClick = (destination: 'internal' | 'external') =>
    track('article_click', {
      article_slug: article.slug,
      article_title: article.title,
      article_category: article.category,
      position: index + 1,
      destination,
    });

  const motionProps = {
    className: `article-card article-card--${variant}`,
    initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: false, amount: 0.25 },
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: (index % 4) * 0.06,
    },
  };

  // Rows with a Substack/external URL link straight out to the original
  // post — no need to also paste the full content in for those to show
  // up here. Same visual card either way, just a different element/href
  // under the hood (a real anchor for the external case, so browser
  // affordances like "open in new tab" and the status-bar preview work).
  if (article.externalUrl) {
    return (
      <motion.a
        href={article.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick('external')}
        {...motionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => {
        trackClick('internal');
        navigateToArticle(article.slug);
      }}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
