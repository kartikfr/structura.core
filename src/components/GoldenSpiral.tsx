// Mathematical sacred geometry animation
export function GoldenSpiral({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-spin-slow"
        style={{ animationDuration: '20s' }}
      >
        {/* Golden spiral approximation using quarter arcs */}
        <defs>
          <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--log-violet))" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Spiral path - approximated using Fibonacci rectangles */}
        <path
          d="M50,50 
             A21,21 0 0,1 71,71
             A13,13 0 0,1 58,84
             A8,8 0 0,1 50,76
             A5,5 0 0,1 55,71
             A3,3 0 0,1 58,74
             A2,2 0 0,1 56,76"
          fill="none"
          stroke="url(#spiralGradient)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* Fibonacci rectangles outlines */}
        <rect x="29" y="29" width="42" height="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeOpacity="0.3" />
        <rect x="29" y="29" width="26" height="26" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.3" strokeOpacity="0.3" />
        <rect x="29" y="29" width="16" height="16" fill="none" stroke="hsl(var(--log-violet))" strokeWidth="0.3" strokeOpacity="0.3" />

        {/* φ symbol at center */}
        <text x="50" y="53" textAnchor="middle" fontSize="8" fill="hsl(var(--primary))" fontFamily="serif">φ</text>
      </svg>
    </div>
  );
}

export function SacredGeometry({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Flower of Life pattern - simplified */}
        <g className="animate-pulse-subtle">
          {/* Center circle */}
          <circle cx="50" cy="50" r="15" fill="none" stroke="url(#geoGradient)" strokeWidth="0.5" />

          {/* 6 surrounding circles */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const x = 50 + 15 * Math.cos((angle * Math.PI) / 180);
            const y = 50 + 15 * Math.sin((angle * Math.PI) / 180);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="15"
                fill="none"
                stroke="url(#geoGradient)"
                strokeWidth="0.5"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            );
          })}
        </g>

        {/* Hexagon overlay */}
        <polygon
          points="50,30 67.3,40 67.3,60 50,70 32.7,60 32.7,40"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.3"
          strokeOpacity="0.5"
        />
      </svg>
    </div>
  );
}

export function MathSymbols({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-xs text-muted-foreground ${className}`}>
      <span className="animate-pulse-subtle" style={{ animationDelay: '0s' }}>φ = 1.618...</span>
      <span className="text-primary">•</span>
      <span className="animate-pulse-subtle" style={{ animationDelay: '0.5s' }}>e^iπ + 1 = 0</span>
      <span className="text-primary">•</span>
      <span className="animate-pulse-subtle" style={{ animationDelay: '1s' }}>√-1 = i</span>
    </div>
  );
}
