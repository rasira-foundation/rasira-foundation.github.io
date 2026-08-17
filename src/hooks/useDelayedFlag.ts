import { useEffect, useState } from 'react';

/**
 * Below this, a load is fast enough that showing anything would register
 * as a flicker rather than as feedback — roughly the threshold where a
 * wait starts being perceived as a wait at all.
 */
export const LOADING_DELAY_MS = 250;

/**
 * Goes true only once `active` has stayed true for `delay` ms.
 *
 * This is what keeps loading skeletons honest: when the data is already
 * cached or the response is quick, the flag never flips and no skeleton
 * is ever rendered. A skeleton that appears and disappears inside a
 * couple hundred milliseconds is a flash of layout, which reads worse
 * than the brief blank it was meant to replace.
 */
export function useDelayedFlag(active: boolean, delay: number = LOADING_DELAY_MS) {
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (!active) {
      setFlag(false);
      return;
    }
    const id = window.setTimeout(() => setFlag(true), delay);
    return () => window.clearTimeout(id);
  }, [active, delay]);

  return flag;
}
