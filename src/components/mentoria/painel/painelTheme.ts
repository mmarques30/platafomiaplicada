// Tokens de tema para o Painel de Diagnóstico
// Centraliza as classes para consistência entre componentes

export const getPainelTheme = (isBusiness: boolean) => {
  if (isBusiness) {
    return {
      // Backgrounds
      pageBg: "bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950",
      cardBg: "bg-white/5 backdrop-blur-md",
      cardHoverBg: "hover:bg-white/8",
      mutedBg: "bg-white/3",
      
      // Borders
      cardBorder: "border-white/10",
      accentBorder: "border-violet-500/50",
      subtleBorder: "border-white/5",
      
      // Text
      textPrimary: "text-slate-100",
      textSecondary: "text-slate-300",
      textMuted: "text-slate-400",
      
      // Accents
      accentColor: "text-violet-400",
      accentBg: "bg-violet-500/20",
      accentBorderColor: "border-l-violet-500/70",
      
      // Icons
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
      
      // Separators
      separator: "h-px bg-gradient-to-r from-transparent via-white/12 to-transparent",
      
      // Shadows
      cardShadow: "shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
      
      // States
      hoverState: "transition-all duration-300 hover:translate-y-[-1px]",
      
      // Badge
      badgeBg: "bg-gradient-to-r from-violet-600 to-purple-600",
      badgeText: "text-white",
      
      // Table
      tableHeaderBg: "bg-white/6",
      tableRowHover: "hover:bg-white/5",
      tableRowAlt: "bg-white/2",
      
      // Buttons
      buttonOutline: "border-white/20 text-slate-200 hover:bg-white/10 hover:border-white/30",
    };
  }
  
  // Default theme (Academy)
  return {
    pageBg: "bg-background",
    cardBg: "bg-card",
    cardHoverBg: "hover:bg-muted/50",
    mutedBg: "bg-muted",
    
    cardBorder: "border-border",
    accentBorder: "border-aplicada-green-900",
    subtleBorder: "border-border",
    
    textPrimary: "text-foreground",
    textSecondary: "text-card-foreground",
    textMuted: "text-muted-foreground",
    
    accentColor: "text-aplicada-green-900",
    accentBg: "bg-aplicada-green-900/10",
    accentBorderColor: "border-l-aplicada-green-900",
    
    iconBg: "bg-aplicada-green-900",
    iconColor: "text-white",
    
    separator: "h-px bg-border",
    
    cardShadow: "shadow-sm",
    
    hoverState: "transition-colors",
    
    badgeBg: "bg-aplicada-green-900",
    badgeText: "text-white",
    
    tableHeaderBg: "bg-muted",
    tableRowHover: "hover:bg-muted/50",
    tableRowAlt: "bg-muted/30",
    
    buttonOutline: "border-border text-foreground hover:bg-muted",
  };
};

export type PainelTheme = ReturnType<typeof getPainelTheme>;
