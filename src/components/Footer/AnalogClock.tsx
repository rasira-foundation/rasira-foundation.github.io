interface AnalogClockProps {
  hourDeg: number;
  minuteDeg: number;
  secondDeg: number;
}

/** Borderless hands floating over the ambient glow — no face circle, ticking live off the visitor's local clock. */
export function AnalogClock({ hourDeg, minuteDeg, secondDeg }: AnalogClockProps) {
  return (
    <svg viewBox="0 0 100 100" className="analog-clock" aria-hidden="true">
      <line className="analog-clock-hand analog-clock-hour" x1="50" y1="50" x2="50" y2="28" transform={`rotate(${hourDeg} 50 50)`} />
      <line className="analog-clock-hand analog-clock-minute" x1="50" y1="50" x2="50" y2="18" transform={`rotate(${minuteDeg} 50 50)`} />
      <line className="analog-clock-hand analog-clock-second" x1="50" y1="50" x2="50" y2="14" transform={`rotate(${secondDeg} 50 50)`} />
      <circle className="analog-clock-pivot" cx="50" cy="50" r="2.4" />
    </svg>
  );
}
