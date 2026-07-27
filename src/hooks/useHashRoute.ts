import { useEffect, useState } from 'react';

export type Route =
  | { view: 'home' }
  | { view: 'article'; slug: string };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const [segment, slug] = clean.split('/');
  if (segment === 'article' && slug) {
    return { view: 'article', slug: decodeURIComponent(slug) };
  }
  return { view: 'home' };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export function navigateToArticle(slug: string) {
  window.location.hash = `/article/${encodeURIComponent(slug)}`;
}

export function navigateHome() {
  window.location.hash = '';
}
