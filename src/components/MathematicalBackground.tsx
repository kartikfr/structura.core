import { useEffect, useRef } from 'react';

export const MathematicalBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    // Mathematical symbols for floating particles - subtle
    const symbols = ['√', 'Σ', '∫', 'φ', 'π', 'Δ', '∂', '∞', 'λ', 'μ'];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      symbol: string;
      opacity: number;
      size: number;
    }

    const particles: Particle[] = [];
    const numParticles = 12; // Reduced for subtlety

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15, // Slower
        vy: (Math.random() - 0.5) * 0.15,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        opacity: Math.random() * 0.06 + 0.02, // Much more subtle
        size: Math.random() * 10 + 12,
      });
    }

    // Grid lines - observatory style
    const drawGrid = () => {
      ctx.strokeStyle = 'hsla(220, 10%, 18%, 0.08)';
      ctx.lineWidth = 1;

      const gridSize = 60;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    // Subtle concentric structure
    const drawStructure = (centerX: number, centerY: number, time: number) => {
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

      for (let i = 1; i <= 5; i++) {
        const radius = (maxRadius / 5) * i;
        const opacity = 0.02 + (Math.sin(time * 0.0005 + i) * 0.01);

        ctx.strokeStyle = `hsla(168, 40%, 42%, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      // Charcoal/graphite background
      ctx.fillStyle = 'hsl(220, 10%, 6%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      // Draw subtle structure
      drawStructure(canvas.width * 0.75, canvas.height * 0.4, time);

      // Update and draw particles
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `hsla(210, 10%, 45%, ${p.opacity})`;
        ctx.font = `${p.size}px "IBM Plex Mono", monospace`;
        ctx.fillText(p.symbol, p.x, p.y);
      });

      time++;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default MathematicalBackground;
