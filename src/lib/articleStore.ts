import { fetchArticles, type Article } from './sheets';
import { mockArticles } from '../data/mockArticles';

export interface ArticlesSnapshot {
  articles: Article[];
  loading: boolean;
  isFallback: boolean;
}

const SESSION_KEY = 'rasira-articles-cache';

/** How long a cached list is treated as current. Inside this window,
 * mounting a component that needs articles costs no network at all —
 * which is what makes going Back from an article instant. Outside it, the
 * cache is still served immediately and refreshed in the background. */
const FRESH_FOR_MS = 5 * 60 * 1000;

let snapshot: ArticlesSnapshot = { articles: [], loading: true, isFallback: false };
let fetchedAt = 0;
let inFlight: Promise<void> | null = null;

const listeners = new Set<() => void>();

/* Hydrate synchronously at module load, before React's first render, so a
   reload paints the list on the very first frame instead of flashing a
   loading state and then reflowing when the response lands. */
try {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) {
    const cached = JSON.parse(raw) as { articles: Article[]; isFallback: boolean; at: number };
    if (Array.isArray(cached.articles) && cached.articles.length > 0) {
      snapshot = { articles: cached.articles, loading: false, isFallback: cached.isFallback };
      fetchedAt = cached.at ?? 0;
    }
  }
} catch {
  /* Private mode, quota, or malformed JSON — fall through to fetching. */
}

function publish(next: ArticlesSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function persist(articles: Article[], isFallback: boolean) {
  fetchedAt = Date.now();
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ articles, isFallback, at: fetchedAt }));
  } catch {
    /* Not being able to cache is not a failure worth surfacing. */
  }
}

/**
 * Fetches at most once at a time, and at most once per freshness window.
 *
 * The dedupe matters as much as the caching: useArticles is mounted by
 * both the grid and the detail page, so without it a single
 * home -> article -> home round trip fired three identical requests.
 */
export function ensureArticles(): void {
  if (inFlight) return;
  if (snapshot.articles.length > 0 && Date.now() - fetchedAt < FRESH_FOR_MS) return;

  inFlight = fetchArticles()
    .then((articles) => {
      // Only publish when the payload actually differs. A background
      // refresh that returns the same list must not re-render the grid —
      // that would restart every card's reveal animation for no reason,
      // which is exactly the "reloading the content again" this is meant
      // to avoid. "Something new" is the only thing that updates the UI.
      const changed = JSON.stringify(articles) !== JSON.stringify(snapshot.articles);
      if (changed || snapshot.loading) {
        publish({ articles, loading: false, isFallback: false });
      }
      persist(articles, false);
    })
    .catch(() => {
      // Only fall back to demo content if there is nothing to show. A
      // failed background refresh must never replace a good cached list.
      if (snapshot.articles.length === 0) {
        publish({ articles: mockArticles, loading: false, isFallback: true });
      }
    })
    .finally(() => {
      inFlight = null;
    });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): ArticlesSnapshot {
  return snapshot;
}
