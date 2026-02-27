import { useEffect, useState } from 'react';

export const InstitutionalStats = () => {
  const [stats, setStats] = useState({
    computations: 847293,
    structures: 12847,
    uptime: 99.97,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        computations: prev.computations + Math.floor(Math.random() * 50),
        structures: prev.structures + Math.floor(Math.random() * 3),
        uptime: 99.97,
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12">
      <div className="text-center min-w-[120px]">
        <p className="font-mono text-xl sm:text-2xl md:text-3xl text-foreground tracking-tight">
          {stats.computations.toLocaleString()}
        </p>
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
          Structural Computations
        </p>
      </div>
      <div className="w-px h-8 sm:h-10 bg-border hidden xs:block" />
      <div className="text-center min-w-[100px]">
        <p className="font-mono text-xl sm:text-2xl md:text-3xl text-foreground tracking-tight">
          {stats.structures.toLocaleString()}
        </p>
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
          Structures Measured
        </p>
      </div>
      <div className="w-px h-8 sm:h-10 bg-border hidden sm:block" />
      <div className="text-center hidden sm:block min-w-[80px]">
        <p className="font-mono text-xl sm:text-2xl md:text-3xl text-primary tracking-tight">
          {stats.uptime}%
        </p>
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
          System Uptime
        </p>
      </div>
    </div>
  );
};

export default InstitutionalStats;
