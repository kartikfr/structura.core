import { useEffect, useRef } from 'react';

interface StructuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const StructuraLogo = ({ size = 'md', animated = true, className = '' }: StructuraLogoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions = {
    sm: 32,
    md: 48,
    lg: 72,
  };

  const dim = dimensions[size];

  useEffect(() => {
    if (!animated) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dim * dpr;
    canvas.height = dim * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;
    let animationId: number | null = null;
    const centerX = dim / 2;
    const centerY = dim / 2;
    const phi = 1.618033988749895; // Golden ratio

    const animate = () => {
      ctx.clearRect(0, 0, dim, dim);

      // Golden spiral - the core mathematical symbol
      ctx.strokeStyle = 'hsl(168, 35%, 45%)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const spiralPoints = 120;
      for (let i = 0; i <= spiralPoints; i++) {
        const angle = (i / spiralPoints) * Math.PI * 4;
        const r = Math.pow(phi, angle / (Math.PI * 2)) * 2;
        const x = centerX + Math.cos(angle + time * 0.01) * r;
        const y = centerY + Math.sin(angle + time * 0.01) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Outer boundary circle
      ctx.strokeStyle = 'hsla(168, 35%, 45%, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dim * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      // Fibonacci rectangles hint - intersecting lines
      const fibScale = dim * 0.35;
      ctx.strokeStyle = 'hsla(168, 35%, 45%, 0.25)';
      ctx.lineWidth = 0.5;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - fibScale);
      ctx.lineTo(centerX, centerY + fibScale);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(centerX - fibScale, centerY);
      ctx.lineTo(centerX + fibScale, centerY);
      ctx.stroke();

      // Golden ratio points on the spiral - pulsing nodes
      const nodeAngles = [Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2, Math.PI * 2.5];
      nodeAngles.forEach((baseAngle, i) => {
        const r = Math.pow(phi, baseAngle / (Math.PI * 2)) * 2;
        const angle = baseAngle + time * 0.01;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        const pulse = 0.5 + 0.5 * Math.sin(time * 0.05 + i);
        ctx.fillStyle = `hsla(168, 35%, 55%, ${0.4 + pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center point - the anchor
      const centerPulse = 0.5 + 0.5 * Math.sin(time * 0.03);
      ctx.fillStyle = `hsla(168, 35%, 60%, ${0.7 + centerPulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Phi symbol overlay hint using tiny arcs
      ctx.strokeStyle = 'hsla(168, 35%, 50%, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dim * 0.25, -Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [dim, animated]);

  if (!animated) {
    // Static SVG version
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        className={className}
        fill="none"
      >
        {/* Golden spiral path */}
        <path
          d="M24 24 C24 20, 28 16, 32 16 C38 16, 42 22, 42 28 C42 38, 32 46, 20 46 C6 46, -4 32, -4 18 C-4 0, 12 -12, 30 -12"
          stroke="hsl(168, 35%, 45%)"
          strokeWidth="1.5"
          fill="none"
          transform="translate(2, 2) scale(0.9)"
        />
        {/* Outer circle */}
        <circle cx="24" cy="24" r="20" stroke="hsla(168, 35%, 45%, 0.3)" strokeWidth="1" fill="none" />
        {/* Cross lines */}
        <line x1="24" y1="8" x2="24" y2="40" stroke="hsla(168, 35%, 45%, 0.25)" strokeWidth="0.5" />
        <line x1="8" y1="24" x2="40" y2="24" stroke="hsla(168, 35%, 45%, 0.25)" strokeWidth="0.5" />
        {/* Center point */}
        <circle cx="24" cy="24" r="2.5" fill="hsl(168, 35%, 55%)" />
        {/* Node points */}
        <circle cx="28" cy="20" r="1.5" fill="hsla(168, 35%, 55%, 0.7)" />
        <circle cx="20" cy="28" r="1.5" fill="hsla(168, 35%, 55%, 0.7)" />
        <circle cx="32" cy="28" r="1.5" fill="hsla(168, 35%, 55%, 0.7)" />
      </svg>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={dim}
      height={dim}
      className={className}
      style={{ width: dim, height: dim }}
    />
  );
};

export default StructuraLogo;
