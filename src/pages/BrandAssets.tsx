import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Static SVG Logo Component for export
const LogoSVG = ({ size = 512 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background */}
    <rect width="512" height="512" fill="#0F1012" rx="24" />

    {/* Outer circle */}
    <circle
      cx="256"
      cy="256"
      r="200"
      stroke="hsl(168, 35%, 45%)"
      strokeWidth="2"
      strokeOpacity="0.3"
      fill="none"
    />

    {/* Golden spiral path - approximated */}
    <path
      d="M256 256 
         C256 240, 272 224, 288 224 
         C320 224, 344 248, 344 280 
         C344 328, 304 368, 248 368 
         C176 368, 120 312, 120 240 
         C120 152, 184 88, 272 88
         C376 88, 456 168, 456 272"
      stroke="hsl(168, 35%, 45%)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />

    {/* Cross lines */}
    <line x1="256" y1="96" x2="256" y2="416" stroke="hsl(168, 35%, 45%)" strokeWidth="1" strokeOpacity="0.25" />
    <line x1="96" y1="256" x2="416" y2="256" stroke="hsl(168, 35%, 45%)" strokeWidth="1" strokeOpacity="0.25" />

    {/* Phi arc hint */}
    <path
      d="M256 256 A128 128 0 0 1 340 180"
      stroke="hsl(168, 35%, 50%)"
      strokeWidth="1"
      strokeOpacity="0.15"
      fill="none"
    />

    {/* Node points on spiral */}
    <circle cx="288" cy="240" r="6" fill="hsl(168, 35%, 55%)" fillOpacity="0.8" />
    <circle cx="320" cy="280" r="6" fill="hsl(168, 35%, 55%)" fillOpacity="0.7" />
    <circle cx="280" cy="340" r="6" fill="hsl(168, 35%, 55%)" fillOpacity="0.6" />
    <circle cx="180" cy="280" r="6" fill="hsl(168, 35%, 55%)" fillOpacity="0.5" />
    <circle cx="200" cy="160" r="6" fill="hsl(168, 35%, 55%)" fillOpacity="0.4" />

    {/* Center point */}
    <circle cx="256" cy="256" r="10" fill="hsl(168, 35%, 55%)" />

    {/* Inner glow */}
    <circle cx="256" cy="256" r="8" fill="hsl(168, 35%, 65%)" />
  </svg>
);

// Icon-only version (no background)
const LogoIconSVG = ({ size = 512 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer circle */}
    <circle
      cx="256"
      cy="256"
      r="240"
      stroke="hsl(168, 35%, 45%)"
      strokeWidth="3"
      strokeOpacity="0.3"
      fill="none"
    />

    {/* Golden spiral path */}
    <path
      d="M256 256 
         C256 236, 276 216, 300 216 
         C340 216, 372 248, 372 288 
         C372 348, 320 400, 248 400 
         C156 400, 80 324, 80 232 
         C80 120, 168 32, 280 32
         C412 32, 512 132, 512 264"
      stroke="hsl(168, 35%, 45%)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />

    {/* Cross lines */}
    <line x1="256" y1="56" x2="256" y2="456" stroke="hsl(168, 35%, 45%)" strokeWidth="1.5" strokeOpacity="0.25" />
    <line x1="56" y1="256" x2="456" y2="256" stroke="hsl(168, 35%, 45%)" strokeWidth="1.5" strokeOpacity="0.25" />

    {/* Node points */}
    <circle cx="300" cy="240" r="8" fill="hsl(168, 35%, 55%)" fillOpacity="0.8" />
    <circle cx="344" cy="288" r="8" fill="hsl(168, 35%, 55%)" fillOpacity="0.7" />
    <circle cx="296" cy="368" r="8" fill="hsl(168, 35%, 55%)" fillOpacity="0.6" />
    <circle cx="160" cy="296" r="8" fill="hsl(168, 35%, 55%)" fillOpacity="0.5" />
    <circle cx="184" cy="136" r="8" fill="hsl(168, 35%, 55%)" fillOpacity="0.4" />

    {/* Center point */}
    <circle cx="256" cy="256" r="12" fill="hsl(168, 35%, 55%)" />
    <circle cx="256" cy="256" r="9" fill="hsl(168, 35%, 65%)" />
  </svg>
);

export const BrandAssets = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadSVG = useCallback((variant: 'full' | 'icon') => {
    const svgElement = document.getElementById(variant === 'full' ? 'logo-svg-full' : 'logo-svg-icon');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `structura-logo-${variant}.svg`;
    link.click();

    URL.revokeObjectURL(url);
  }, []);

  const downloadPNG = useCallback((size: number, variant: 'full' | 'icon') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const svgElement = document.getElementById(variant === 'full' ? 'logo-svg-full' : 'logo-svg-icon');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `structura-logo-${variant}-${size}x${size}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const sizes = [128, 256, 512, 1024];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-mono text-lg tracking-wide">STRUCTURA · Brand Assets</h1>
            <p className="text-xs text-muted-foreground">Download logos for social media</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Full Logo (with background) */}
        <section>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-6">
            Primary Logo (Dark Background)
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border p-8 flex items-center justify-center">
              <div id="logo-svg-full">
                <LogoSVG size={256} />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Full logo with dark background. Ideal for profile pictures and standalone use.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">SVG (Vector)</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadSVG('full')}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download SVG
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">PNG (Raster)</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPNG(size, 'full')}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {size}×{size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Icon Only (transparent) */}
        <section>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-6">
            Icon Only (Transparent)
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1a] border border-border p-8 flex items-center justify-center" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23222\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23222\'/%3E%3C/svg%3E")' }}>
              <div id="logo-svg-icon">
                <LogoIconSVG size={256} />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Icon-only version with transparent background. Use for overlays and compositions.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">SVG (Vector)</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadSVG('icon')}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download SVG
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">PNG (Raster)</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPNG(size, 'icon')}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {size}×{size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-6">
            Brand Colors
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded bg-[#0F1012] border border-border" />
              <p className="text-xs font-mono">Background</p>
              <p className="text-xs text-muted-foreground">#0F1012</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded" style={{ backgroundColor: 'hsl(168, 40%, 42%)' }} />
              <p className="text-xs font-mono">Primary</p>
              <p className="text-xs text-muted-foreground">#419B89</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded" style={{ backgroundColor: 'hsl(180, 25%, 35%)' }} />
              <p className="text-xs font-mono">Accent</p>
              <p className="text-xs text-muted-foreground">#437070</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded bg-[#D4D6D9]" />
              <p className="text-xs font-mono">Foreground</p>
              <p className="text-xs text-muted-foreground">#D4D6D9</p>
            </div>
          </div>
        </section>

        {/* Brand Guidelines Link */}
        <section className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Full brand guidelines available at{' '}
            <a
              href="/BRAND_GUIDELINES.md"
              target="_blank"
              className="text-primary hover:underline"
            >
              /BRAND_GUIDELINES.md
            </a>
          </p>
        </section>
      </main>

      {/* Hidden canvas for PNG export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default BrandAssets;
