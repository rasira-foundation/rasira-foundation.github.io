import { useEffect, useState } from 'react';
import { fetchArticles, type Article } from '../../lib/sheets';
import { mockArticles } from '../../data/mockArticles';

interface ArticlesState {
  articles: Article[];
  loading: boolean;
  isFallback: boolean;
}

/** Fetches the public Sheet client-side; falls back to demo content if unconfigured or unreachable. */
export function useArticles(): ArticlesState {
  const [state, setState] = useState<ArticlesState>({ articles: [], loading: true, isFallback: false });

  useEffect(() => {
    let cancelled = false;

    fetchArticles()
      .then((articles) => {
        if (cancelled) return;
        setState({ articles, loading: false, isFallback: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ articles: mockArticles, loading: false, isFallback: true });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
