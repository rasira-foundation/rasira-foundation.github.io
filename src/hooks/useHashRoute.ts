import { useEffect, useState } from 'react';

export type Route =
  | { view: 'home' }
  | { view: 'article'; slug: string };

const HOME_SCROLL_KEY = 'rasira-home-scroll';

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

  // Restore the homepage scroll position (saved in navigateToArticle) once
  // we land back on "/" — from the in-app Back link or the browser's own
  // back button, both of which fire a hashchange.
  useEffect(() => {
    if (route.view !== 'home') return;
    const saved = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!saved) return;
    sessionStorage.removeItem(HOME_SCROLL_KEY);
    requestAnimationFrame(() => {
      window.scrollTo({ top: Number(saved), behavior: 'instant' });
    });
  }, [route.view]);

  return route;
}

export function navigateToArticle(slug: string) {
  sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
  window.location.hash = `/article/${encodeURIComponent(slug)}`;
}

export function navigateHome() {
  window.location.hash = '';
}
