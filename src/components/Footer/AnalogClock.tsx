interface AnalogClockProps {
  hourDeg: number;
  minuteDeg: number;
}

/** Two bare hands over the ambient glow — no face, no outline, no pivot
 * cap. They rotate about the exact centre of a square viewBox, so the
 * pivot is the geometric centre of the element and they stay centred at
 * any rendered size without offsets.
 *
 * Stroke weight is set in real pixels via `vector-effect:
 * non-scaling-stroke` (see the CSS) rather than being multiplied by
 * however large the wrapper happens to be. */
export function AnalogClock({ hourDeg, minuteDeg }: AnalogClockProps) {
  return (
    <svg viewBox="0 0 100 100" className="analog-clock" aria-hidden="true">
      <line className="analog-clock-hand analog-clock-hour" x1="50" y1="50" x2="50" y2="26" transform={`rotate(${hourDeg} 50 50)`} />
      <line className="analog-clock-hand analog-clock-minute" x1="50" y1="50" x2="50" y2="10" transform={`rotate(${minuteDeg} 50 50)`} />
    </svg>
  );
}
