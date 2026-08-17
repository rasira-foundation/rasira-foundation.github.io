import { useEffect, useSyncExternalStore } from 'react';
import { ensureArticles, getSnapshot, subscribe, type ArticlesSnapshot } from '../../lib/articleStore';

/**
 * Reads the shared article store; falls back to demo content if the Sheet
 * is unconfigured or unreachable.
 *
 * This used to own the fetch itself, with local state, which meant every
 * mount started a new request and every mount began at `loading: true` —
 * so returning to the homepage from an article re-fetched and re-rendered
 * a list the app already had. The store now dedupes in-flight requests,
 * caches across reloads, and only republishes when the content actually
 * changed. See lib/articleStore.ts.
 *
 * useSyncExternalStore rather than useState + useEffect: both the grid and
 * the detail page read this, and they have to see the same snapshot in the
 * same render pass.
 */
export function useArticles(): ArticlesSnapshot {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    // A no-op when the cache is warm and inside its freshness window,
    // which is the case that makes Back instant.
    ensureArticles();
  }, []);

  return snapshot;
}
