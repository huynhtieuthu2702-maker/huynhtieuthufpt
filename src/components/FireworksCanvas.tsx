import { useEffect, useRef } from 'react';
import { soundFX } from '../utils/sound';

interface FireworksCanvasProps {
  active: boolean;
  intensity?: 'normal' | 'grand';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  radius: number;
}

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

export function FireworksCanvas({ active, intensity = 'normal' }: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    let animationId = 0;

    const createBurst = (cx: number, cy: number) => {
      const count = intensity === 'grand' ? 46 : 28;
      const burstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
        const speed = 2.2 + Math.random() * (intensity === 'grand' ? 5.5 : 4);
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.35 ? burstColor : COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 1,
          decay: 0.014 + Math.random() * 0.012,
          radius: 2.5 + Math.random() * 2.5,
        });
      }
      soundFX.playFireworkPop();
    };

    // Initial celebratory bursts
    createBurst(window.innerWidth * 0.28, window.innerHeight * 0.28);
    setTimeout(() => createBurst(window.innerWidth * 0.72, window.innerHeight * 0.25), 220);
    if (intensity === 'grand') {
      setTimeout(() => createBurst(window.innerWidth * 0.5, window.innerHeight * 0.22), 480);
    }

    const intervalMs = intensity === 'grand' ? 850 : 1400;
    const burstTimer = window.setInterval(() => {
      const cx = window.innerWidth * (0.18 + Math.random() * 0.64);
      const cy = window.innerHeight * (0.15 + Math.random() * 0.35);
      createBurst(cx, cy);
    }, intervalMs);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // subtle gravity
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(burstTimer);
      window.removeEventListener('resize', resize);
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-40"
    />
  );
}
