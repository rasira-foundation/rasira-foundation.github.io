import { useEffect, useRef, useState } from 'react';

/**
 * Tracks how far a section has scrolled past the top of the viewport: 0
 * while its top edge is still at or below the viewport top (not yet
 * reached / just arrived), rising to 1 once the section has fully
 * scrolled past. Drives the hero's progressive blur/desaturation as the
 * user scrolls on toward the next section.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const next = Math.min(1, Math.max(0, -rect.top / rect.height));
      setProgress(next);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}
