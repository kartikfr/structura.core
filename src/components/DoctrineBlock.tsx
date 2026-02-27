interface DoctrineBlockProps {
  symbol: string;
  title: string;
  description: string;
}

export const DoctrineBlock = ({ symbol, title, description }: DoctrineBlockProps) => {
  return (
    <div className="doctrine-block p-4 sm:p-6 group hover:border-primary/30 transition-colors duration-300">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors shrink-0">
          <span className="font-mono text-base sm:text-lg text-primary/70 group-hover:text-primary transition-colors">
            {symbol}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-xs sm:text-sm font-bold text-foreground mb-1.5 sm:mb-2 uppercase tracking-wider">
            {title}
          </h3>
          <p className="font-mono text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctrineBlock;
