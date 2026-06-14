import { useEffect, useRef } from 'react';

const PARTICLE_COUNT  = 62;
const MAX_DIST        = 155;
const HUB_COUNT       = 7;

export default function NetworkBackground() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const logicalW = () => canvas.offsetWidth;
    const logicalH = () => canvas.offsetHeight;

    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x:          Math.random() * logicalW(),
      y:          Math.random() * logicalH(),
      vx:         (Math.random() - 0.5) * 0.35,
      vy:         (Math.random() - 0.5) * 0.35,
      r:          i < HUB_COUNT ? Math.random() * 2.5 + 2.5 : Math.random() * 1.8 + 0.8,
      isHub:      i < HUB_COUNT,
      phase:      Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.018 + 0.008,
    }));

    const drawBg = () => {
      const lw = logicalW();
      const lh = logicalH();

      ctx.fillStyle = '#020B18';
      ctx.fillRect(0, 0, lw, lh);

      const g1 = ctx.createRadialGradient(lw * 0.78, lh * 0.18, 0, lw * 0.78, lh * 0.18, lw * 0.42);
      g1.addColorStop(0, 'rgba(37,99,235,0.13)');
      g1.addColorStop(1, 'rgba(37,99,235,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, lw, lh);

      const g2 = ctx.createRadialGradient(lw * 0.18, lh * 0.82, 0, lw * 0.18, lh * 0.82, lw * 0.38);
      g2.addColorStop(0, 'rgba(99,102,241,0.11)');
      g2.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, lw, lh);
    };

    const animate = () => {
      const lw = logicalW();
      const lh = logicalH();

      ctx.clearRect(0, 0, lw, lh);
      drawBg();

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > MAX_DIST) continue;

          const alpha     = (1 - dist / MAX_DIST) * 0.28;
          const isSpecial = particles[i].isHub || particles[j].isHub;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isSpecial
            ? `rgba(96,165,250,${alpha * 1.5})`
            : `rgba(37,99,235,${alpha})`;
          ctx.lineWidth = isSpecial ? 0.9 : 0.45;
          ctx.stroke();
        }
      }

      particles.forEach(p => {
        p.phase += p.phaseSpeed;
        const pulse = 1 + Math.sin(p.phase) * 0.28;
        const r     = p.r * pulse;

        if (p.isHub) {
          ctx.shadowColor = 'rgba(96,165,250,0.7)';
          ctx.shadowBlur  = 18;
        } else {
          ctx.shadowColor = 'rgba(37,99,235,0.55)';
          ctx.shadowBlur  = 8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.isHub ? `rgba(147,197,253,0.95)` : `rgba(96,165,250,0.82)`;
        ctx.fill();

        ctx.shadowBlur = 0;

        if (p.isHub) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2.8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(96,165,250,${0.12 + Math.sin(p.phase) * 0.06})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > lw) { p.vx *= -1; p.x = Math.max(0, Math.min(lw, p.x)); }
        if (p.y < 0 || p.y > lh) { p.vy *= -1; p.y = Math.max(0, Math.min(lh, p.y)); }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
}
