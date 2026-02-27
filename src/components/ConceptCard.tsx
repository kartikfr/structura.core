interface ConceptCardProps {
  symbol: string;
  title: string;
  description: string;
  formula: string;
}

export const ConceptCard = ({ symbol, title, description, formula }: ConceptCardProps) => {
  return (
    <div className="terminal-panel p-4 sm:p-6 group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
          <span className="font-mono text-primary text-xs sm:text-sm">{symbol}</span>
        </div>
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></div>
      </div>

      <h3 className="font-mono text-xs sm:text-sm font-bold text-foreground mb-2 sm:mb-3 uppercase tracking-wider">
        {title}
      </h3>

      <p className="font-mono text-[10px] sm:text-xs text-muted-foreground leading-relaxed mb-3 sm:mb-4">
        {description}
      </p>

      <div className="pt-3 sm:pt-4 border-t border-border">
        <code className="font-mono text-[9px] sm:text-[10px] text-primary/70 block break-all">
          {formula}
        </code>
      </div>
    </div>
  );
};

export default ConceptCard;
