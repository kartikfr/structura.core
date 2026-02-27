interface StructuralStatePanelProps {
  session: string;
  auctionMode: string;
  compression: string;
  anchorDominance: string;
  geometryDensity: string;
}

export const StructuralStatePanel = ({
  session,
  auctionMode,
  compression,
  anchorDominance,
  geometryDensity,
}: StructuralStatePanelProps) => {
  const states = [
    { label: 'Session', value: session },
    { label: 'Auction Mode', value: auctionMode },
    { label: 'Structural Compression', value: compression },
    { label: 'Anchor Dominance', value: anchorDominance },
    { label: 'Geometry Density', value: geometryDensity },
  ];

  return (
    <div className="structura-panel p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Structural State
        </span>
      </div>

      <div className="space-y-3">
        {states.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted-foreground">{item.label}</span>
            <span className="font-mono text-xs text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StructuralStatePanel;
