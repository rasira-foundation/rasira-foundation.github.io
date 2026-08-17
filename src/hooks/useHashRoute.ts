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

/* Homepage scroll restoration used to live here: navigateToArticle saved
 * window.scrollY, and an effect scrolled back to it on returning home.
 * It has moved to useScrollRestoration, which now owns this for both
 * back-navigation AND reload. Two systems writing scroll position would
 * have fought each other, and the version here had the flaw that made
 * reload fail anyway — a single requestAnimationFrame, which fires long
 * before the article fetch has grown the page tall enough to scroll to. */
export function navigateToArticle(slug: string) {
  window.location.hash = `/article/${encodeURIComponent(slug)}`;
}

export function navigateHome() {
  window.location.hash = '';
}
