import { useEffect, useRef } from 'react';

interface Particle {
  x: number; // 0..1 across width
  baseY: number; // 0..1 down height
  depth: number; // 0.2..1, smaller = further back = slower parallax, dimmer
  radius: number;
  driftPhase: number;
  driftSpeed: number;
}

/**
 * A field of soft floating dust motes rendered on <canvas>, parallaxing at
 * different speeds by depth as the page scrolls — the "3D" micro-interaction
 * behind the narrative hero's photo scatter.
 */
export function ParticleCanvas({ scrollProgress }: { scrollProgress: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef(scrollProgress);
  progressRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 46 }, () => ({
        x: Math.random(),
        baseY: Math.random(),
        depth: 0.25 + Math.random() * 0.75,
        radius: 0.6 + Math.random() * 2.2,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.15 + Math.random() * 0.25,
      }));
    }

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        const parallax = progressRef.current * (1 - p.depth) * height * 0.35;
        const drift = reduceMotion ? 0 : Math.sin(t * p.driftSpeed + p.driftPhase) * 10 * p.depth;
        const y = p.baseY * height + parallax + drift;
        const x = p.x * width + (reduceMotion ? 0 : Math.cos(t * p.driftSpeed * 0.7 + p.driftPhase) * 8 * p.depth);

        const alpha = 0.05 + p.depth * 0.16;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.radius * 6);
        gradient.addColorStop(0, `rgba(20, 18, 15, ${alpha})`);
        gradient.addColorStop(1, 'rgba(20, 18, 15, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, p.radius * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />;
}
