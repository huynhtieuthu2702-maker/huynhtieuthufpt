import { useEffect, useRef } from 'react';

interface StarPoint {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  hue: string;
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const starColors = ['#FFFFFF', '#BAE6FD', '#A5F3FC', '#C7D2FE', '#FDE68A'];
    const count = Math.min(180, Math.floor((width * height) / 9500));

    const stars: StarPoint[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.7 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 0.14 - 0.06,
      vy: (Math.random() - 0.5) * 0.1 + 0.04,
      alpha: 0.35 + Math.random() * 0.65,
      twinkleSpeed: 0.012 + Math.random() * 0.025,
      phase: Math.random() * Math.PI * 2,
      hue: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    let animId = 0;
    let time = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const drawFrame = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Soft drifting cosmic nebula glows
      const glow1X = width * (0.2 + Math.sin(time * 0.002) * 0.04);
      const glow1Y = height * (0.25 + Math.cos(time * 0.0018) * 0.04);
      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 10, glow1X, glow1Y, width * 0.42);
      grad1.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
      grad1.addColorStop(0.5, 'rgba(59, 130, 246, 0.07)');
      grad1.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * (0.82 + Math.cos(time * 0.0015) * 0.04);
      const glow2Y = height * (0.72 + Math.sin(time * 0.0022) * 0.04);
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 10, glow2X, glow2Y, width * 0.45);
      grad2.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      grad2.addColorStop(0.5, 'rgba(139, 92, 246, 0.07)');
      grad2.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      for (const s of stars) {
        if (!prefersReduced) {
          s.x += s.vx;
          s.y += s.vy;
          s.phase += s.twinkleSpeed;

          if (s.x < -4) s.x = width + 4;
          if (s.x > width + 4) s.x = -4;
          if (s.y < -4) s.y = height + 4;
          if (s.y > height + 4) s.y = -4;
        }

        const twinkle = 0.55 + 0.45 * Math.sin(s.phase);
        ctx.save();
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.fillStyle = s.hue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!prefersReduced) {
        animId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#030712] via-[#08122E] to-[#0E1638]"
    >
      {/* Subtle Sci-Fi Orbital Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(34, 211, 238, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 211, 238, 0.14) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
