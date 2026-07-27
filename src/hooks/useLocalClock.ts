import { useEffect, useState } from 'react';

export interface LocalClock {
  digital: string; // "13:19 PM | GMT +8"
  hourDeg: number;
  minuteDeg: number;
  secondDeg: number;
}

/** Live analog + digital clock driven by the visitor's own system time zone. */
export function useLocalClock(): LocalClock {
  const [clock, setClock] = useState(() => computeClock());

  useEffect(() => {
    const id = window.setInterval(() => setClock(computeClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return clock;
}

function computeClock(): LocalClock {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hour12 = hours % 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return {
    digital: `${hh}:${mm} ${ampm} | ${formatGmtOffset(now)}`,
    hourDeg: hour12 * 30 + minutes * 0.5,
    minuteDeg: minutes * 6 + seconds * 0.1,
    secondDeg: seconds * 6,
  };
}

function formatGmtOffset(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return minutes === 0 ? `GMT ${sign}${hours}` : `GMT ${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}
