import { useEffect, useRef } from 'react';

interface PriceFieldVisualProps {
  className?: string;
}

export const PriceFieldVisual = ({ className = '' }: PriceFieldVisualProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number;
    let height: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      width = rect.width;
      height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Price field simulation with enhanced detail
    let time = 0;

    // Fibonacci levels with labels
    const fibLevels = [
      { ratio: 0.236, label: '23.6%', type: 'minor' },
      { ratio: 0.382, label: '38.2%', type: 'major' },
      { ratio: 0.5, label: '50.0%', type: 'mid' },
      { ratio: 0.618, label: '61.8%', type: 'major' },
      { ratio: 0.786, label: '78.6%', type: 'minor' },
    ].map(l => ({
      ...l,
      y: height * (0.08 + l.ratio * 0.84),
      strength: l.type === 'major' ? 1 : l.type === 'mid' ? 0.8 : 0.5,
    }));

    // VWAP and POC simulation
    const vwapY = height * 0.52;
    const pocY = height * 0.48;

    // Price particles with enhanced properties
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      type: 'price' | 'volume' | 'structure';
    }

    const particles: Particle[] = [];
    const maxParticles = 80;

    // Volume profile bars (left side)
    const volumeBars = Array.from({ length: 20 }, (_, i) => ({
      y: height * (0.1 + (i / 20) * 0.8),
      width: Math.random() * 40 + 10,
      intensity: Math.random(),
    }));

    // Historical price points for the trace
    const priceHistory: { x: number; y: number }[] = [];
    const maxHistory = 150;

    const animate = () => {
      // Fade effect with slight blur feel
      ctx.fillStyle = 'hsla(220, 15%, 8%, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Draw volume profile on left (subtle)
      volumeBars.forEach((bar, i) => {
        const wave = Math.sin(time * 0.002 + i * 0.3) * 5;
        const alpha = 0.05 + bar.intensity * 0.08;
        ctx.fillStyle = `hsla(168, 30%, 40%, ${alpha})`;
        ctx.fillRect(0, bar.y - 8, bar.width + wave, 12);
      });

      // Draw structure levels with enhanced visuals
      fibLevels.forEach((level, i) => {
        const wave = Math.sin(time * 0.0015 + i * 0.5) * 2;
        const levelY = level.y + wave;

        // Level glow gradient
        const gradient = ctx.createLinearGradient(0, levelY - 15, 0, levelY + 15);
        gradient.addColorStop(0, 'hsla(168, 35%, 40%, 0)');
        gradient.addColorStop(0.5, `hsla(168, 35%, 40%, ${0.04 * level.strength})`);
        gradient.addColorStop(1, 'hsla(168, 35%, 40%, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, levelY - 15, width, 30);

        // Main level line
        ctx.strokeStyle = `hsla(168, 35%, 45%, ${0.15 + level.strength * 0.15})`;
        ctx.lineWidth = level.type === 'major' ? 1 : 0.5;
        ctx.setLineDash(level.type === 'minor' ? [4, 4] : []);
        ctx.beginPath();
        ctx.moveTo(50, levelY);
        ctx.lineTo(width - 10, levelY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Level label
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = `hsla(168, 35%, 55%, ${0.4 + level.strength * 0.3})`;
        ctx.fillText(level.label, 8, levelY + 3);
      });

      // Draw VWAP reference plane
      const vwapWave = Math.sin(time * 0.001) * 3;
      ctx.strokeStyle = 'hsla(45, 60%, 50%, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(50, vwapY + vwapWave);
      ctx.lineTo(width - 10, vwapY + vwapWave);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'hsla(45, 60%, 55%, 0.5)';
      ctx.fillText('VWAP', 12, vwapY + vwapWave + 3);

      // Draw POC marker
      ctx.strokeStyle = 'hsla(280, 40%, 50%, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, pocY);
      ctx.lineTo(width - 10, pocY);
      ctx.stroke();
      ctx.fillStyle = 'hsla(280, 40%, 55%, 0.5)';
      ctx.fillText('POC', 16, pocY + 3);

      // Spawn new particles with varied types
      if (particles.length < maxParticles && Math.random() > 0.85) {
        const type = Math.random() > 0.7 ? 'volume' : Math.random() > 0.5 ? 'structure' : 'price';
        particles.push({
          x: Math.random() * (width - 100) + 50,
          y: height * 0.5 + (Math.random() - 0.5) * height * 0.6,
          vx: (Math.random() - 0.3) * 0.8,
          vy: (Math.random() - 0.5) * 0.4,
          life: 1,
          size: type === 'volume' ? 3 : type === 'structure' ? 2 : 1.5,
          type,
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.004;

        // Attract to nearest structure level
        let nearestLevel = fibLevels[0];
        let minDist = Math.abs(p.y - fibLevels[0].y);
        fibLevels.forEach(l => {
          const dist = Math.abs(p.y - l.y);
          if (dist < minDist) {
            minDist = dist;
            nearestLevel = l;
          }
        });

        // Gravitational pull toward structure
        const pull = nearestLevel.strength * 0.0003;
        p.vy += (nearestLevel.y - p.y) * pull;

        // Damping
        p.vy *= 0.995;
        p.vx *= 0.998;

        if (p.life <= 0 || p.x < 40 || p.x > width) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.6;
        let color = `hsla(168, 35%, 55%, ${alpha})`;
        if (p.type === 'volume') color = `hsla(45, 50%, 55%, ${alpha})`;
        if (p.type === 'structure') color = `hsla(200, 40%, 60%, ${alpha})`;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Particle trail
        if (p.type === 'price') {
          ctx.strokeStyle = `hsla(168, 35%, 50%, ${alpha * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
          ctx.stroke();
        }
      }

      // Calculate current price position
      const baseY = height * 0.5;
      const priceNoise =
        Math.sin(time * 0.003) * 25 +
        Math.sin(time * 0.007 + 1) * 12 +
        Math.sin(time * 0.001) * 40;
      const currentY = baseY + priceNoise;
      const currentX = width - 30;

      // Add to price history
      priceHistory.push({ x: currentX, y: currentY });
      if (priceHistory.length > maxHistory) {
        priceHistory.shift();
      }

      // Draw price trace with gradient
      if (priceHistory.length > 2) {
        ctx.beginPath();
        ctx.moveTo(priceHistory[0].x - (maxHistory - priceHistory.length) * 2, priceHistory[0].y);

        for (let i = 1; i < priceHistory.length; i++) {
          const point = priceHistory[i];
          const xOffset = (maxHistory - priceHistory.length + i) * 2;
          ctx.lineTo(currentX - (priceHistory.length - i) * 2, point.y);
        }

        const gradient = ctx.createLinearGradient(currentX - maxHistory * 2, 0, currentX, 0);
        gradient.addColorStop(0, 'hsla(168, 35%, 50%, 0)');
        gradient.addColorStop(0.5, 'hsla(168, 35%, 50%, 0.3)');
        gradient.addColorStop(1, 'hsla(168, 35%, 55%, 0.6)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Current price glow
      const glowGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 20);
      glowGradient.addColorStop(0, 'hsla(168, 40%, 55%, 0.4)');
      glowGradient.addColorStop(1, 'hsla(168, 40%, 55%, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Current price indicator
      ctx.fillStyle = 'hsla(168, 40%, 55%, 0.9)';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright point
      ctx.fillStyle = 'hsla(168, 50%, 70%, 1)';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Price label with box
      const price = (2045.50 + priceNoise * 0.15).toFixed(2);
      ctx.font = 'bold 11px "IBM Plex Mono", monospace';
      const textWidth = ctx.measureText(price).width;

      // Label background
      ctx.fillStyle = 'hsla(168, 35%, 20%, 0.9)';
      ctx.fillRect(width - textWidth - 18, currentY - 8, textWidth + 12, 16);
      ctx.strokeStyle = 'hsla(168, 40%, 45%, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width - textWidth - 18, currentY - 8, textWidth + 12, 16);

      // Label text
      ctx.fillStyle = 'hsla(168, 45%, 65%, 1)';
      ctx.fillText(price, width - textWidth - 12, currentY + 4);

      // Draw confluence zone markers
      const confluenceY = height * 0.45;
      ctx.fillStyle = 'hsla(168, 30%, 35%, 0.15)';
      ctx.fillRect(50, confluenceY - 12, width - 60, 24);
      ctx.font = '7px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'hsla(168, 35%, 50%, 0.4)';
      ctx.fillText('CONFLUENCE', width - 75, confluenceY + 2);

      // Time axis hint
      ctx.font = '8px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'hsla(0, 0%, 60%, 0.3)';
      const timeLabels = ['5m', '10m', '15m', '20m'];
      timeLabels.forEach((label, i) => {
        const x = 60 + (i * (width - 100) / 4);
        ctx.fillText(label, x, height - 8);
      });

      // Scan line effect (with validation to prevent non-finite errors)
      const scanY = (time * 0.5) % height;
      if (isFinite(scanY) && isFinite(height) && height > 0) {
        const scanGradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        scanGradient.addColorStop(0, 'hsla(168, 35%, 50%, 0)');
        scanGradient.addColorStop(0.5, 'hsla(168, 35%, 50%, 0.03)');
        scanGradient.addColorStop(1, 'hsla(168, 35%, 50%, 0)');
        ctx.fillStyle = scanGradient;
        ctx.fillRect(0, scanY - 20, width, 40);
      }

      time++;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ background: 'transparent' }}
    />
  );
};

export default PriceFieldVisual;
