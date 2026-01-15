// Tokens de tema para o Painel de Diagnóstico
// Centraliza as classes para consistência entre componentes

export const getPainelTheme = (isBusiness: boolean) => {
  if (isBusiness) {
    // Business theme - IGUAL ao Academy, fundo claro padrão
    // Apenas accent verde mais vibrante para diferenciar
    return {
      // Backgrounds - LIMPO igual Academy
      pageBg: "bg-background",
      cardBg: "bg-card",
      cardHoverBg: "hover:bg-muted/50",
      mutedBg: "bg-muted",
      
      // Borders
      cardBorder: "border-border",
      accentBorder: "border-aplicada-green-700",
      subtleBorder: "border-border",
      
      // Text - cores normais do sistema
      textPrimary: "text-foreground",
      textSecondary: "text-card-foreground",
      textMuted: "text-muted-foreground",
      
      // Accents - verde da marca (mais vibrante para Business)
      accentColor: "text-aplicada-green-700",
      accentBg: "bg-aplicada-green-700/10",
      accentBorderColor: "border-l-aplicada-green-700",
      
      // Icons
      iconBg: "bg-aplicada-green-700",
      iconColor: "text-white",
      
      // Separators
      separator: "h-px bg-border",
      
      // Shadows
      cardShadow: "shadow-sm",
      
      // States
      hoverState: "transition-colors",
      
      // Badge Business - verde da marca
      badgeBg: "bg-aplicada-green-700",
      badgeText: "text-white",
      
      // Table
      tableHeaderBg: "bg-muted",
      tableRowHover: "hover:bg-muted/50",
      tableRowAlt: "bg-muted/30",
      
      // Buttons
      buttonOutline: "border-border text-foreground hover:bg-muted",
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
