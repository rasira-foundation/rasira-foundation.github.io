interface AnalogClockProps {
  hourDeg: number;
  minuteDeg: number;
}

/** Two bare, minimal hands floating over the ambient glow — no face, no pivot cap, no second hand. */
export function AnalogClock({ hourDeg, minuteDeg }: AnalogClockProps) {
  return (
    <svg viewBox="0 0 100 100" className="analog-clock" aria-hidden="true">
      <line className="analog-clock-hand analog-clock-hour" x1="50" y1="50" x2="50" y2="22" transform={`rotate(${hourDeg} 50 50)`} />
      <line className="analog-clock-hand analog-clock-minute" x1="50" y1="50" x2="50" y2="8" transform={`rotate(${minuteDeg} 50 50)`} />
    </svg>
  );
}
