// Tokens de tema centralizados para todas as páginas Admin
// Garante consistência visual em todo o painel administrativo

export const adminTheme = {
  // Layout de página
  page: "space-y-4",
  
  // Headers
  pageHeader: "flex items-center justify-between mb-4",
  pageTitleWrapper: "flex items-center gap-3",
  pageTitle: "text-xl font-bold tracking-tight",
  pageSubtitle: "text-sm text-muted-foreground",
  pageIcon: "h-5 w-5 text-muted-foreground",
  
  // Cards
  card: "border-border/50 shadow-sm rounded-xl",
  cardHeader: "pb-3",
  cardTitle: "text-base font-semibold",
  cardDescription: "text-sm text-muted-foreground",
  
  // Tabs
  tabsList: "bg-muted/40 border-0 rounded-lg p-1 h-auto inline-flex flex-wrap gap-1",
  tabsTrigger: "text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
  tabsIcon: "h-3.5 w-3.5",
  tabsContent: "mt-4",
  
  // Tables
  tableContainer: "border border-border/50 rounded-xl overflow-hidden",
  tableHeader: "bg-muted/30",
  tableHeaderCell: "text-xs font-medium text-muted-foreground",
  tableRow: "hover:bg-muted/30 transition-colors",
  tableCell: "text-sm",
  
  // Buttons
  buttonSm: "h-8 px-3 text-xs",
  buttonIcon: "h-8 w-8",
  buttonOutline: "border-border/50",
  
  // Badges
  badge: "text-xs",
  badgeSecondary: "bg-muted text-muted-foreground",
  badgeCount: "ml-1.5 bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded text-[10px] font-medium",
  
  // Icons
  icon: "h-4 w-4 text-muted-foreground",
  iconSm: "h-3.5 w-3.5",
  iconXs: "h-3 w-3",
  
  // Inputs
  input: "h-9 text-sm",
  select: "h-9 text-sm",
  
  // Stats Cards
  statsCard: "border-border/50 shadow-sm",
  statsIcon: "h-4 w-4 text-muted-foreground",
  statsValue: "text-2xl font-bold",
  statsLabel: "text-sm font-medium text-muted-foreground",
  
  // Filters
  filterBar: "flex flex-wrap items-center gap-3 mb-4",
  filterSelect: "w-[180px] h-9",
  filterInput: "w-[240px] h-9",
  
  // Dialogs/Modals
  dialogHeader: "pb-4",
  dialogTitle: "text-lg font-semibold",
  dialogDescription: "text-sm text-muted-foreground",
  
  // Empty States
  emptyState: "flex flex-col items-center justify-center py-12 text-center",
  emptyIcon: "h-12 w-12 text-muted-foreground/50 mb-4",
  emptyTitle: "text-lg font-medium text-muted-foreground",
  emptyDescription: "text-sm text-muted-foreground/70 max-w-md",
  
  // Loading States
  skeleton: "bg-muted/50",
  
  // Separators
  separator: "bg-border/50",
};

export type AdminTheme = typeof adminTheme;
