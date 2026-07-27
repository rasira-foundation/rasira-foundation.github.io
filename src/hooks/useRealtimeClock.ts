import { useEffect, useState } from 'react';

/** Live clock formatted like "13:19 PM | GMT +8", ticking every second. */
export function useRealtimeClock(timeZone = 'Asia/Singapore') {
  const [label, setLabel] = useState(() => formatClock(timeZone));

  useEffect(() => {
    const id = window.setInterval(() => setLabel(formatClock(timeZone)), 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return label;
}

function formatClock(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const ampm = Number(hour) >= 12 ? 'PM' : 'AM';

  return `${hour}:${minute} ${ampm} | GMT +8`;
}
