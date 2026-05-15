// Tokens de tema centralizados para todas as páginas Admin
// Garante consistência visual em todo o painel administrativo
// Espelhando a paleta brand: brand-hairline (borders), brand-cream-soft (sub-fundos),
// brand-strong (active). Foreground em vez de muted onde for ação.

export const adminTheme = {
  // Layout de página
  page: "space-y-6",

  // Headers
  pageHeader: "flex items-center justify-between mb-2",
  pageTitleWrapper: "flex items-center gap-3",
  pageTitle: "text-2xl font-semibold tracking-tight text-foreground",
  pageSubtitle: "text-sm text-muted-foreground",
  pageIcon: "h-5 w-5 text-muted-foreground",

  // Cards
  card: "border-brand-hairline rounded-xl",
  cardHeader: "pb-3",
  cardTitle: "text-base font-semibold",
  cardDescription: "text-sm text-muted-foreground",

  // Tabs — alinhadas com brand-strong (mesmo padrão das tabs do app)
  tabsList:
    "bg-brand-cream-soft border border-brand-hairline rounded-lg p-1 h-auto inline-flex flex-wrap gap-1",
  tabsTrigger:
    "text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground transition-colors",
  tabsIcon: "h-3.5 w-3.5",
  tabsContent: "mt-4",

  // Tables
  tableContainer: "border border-brand-hairline rounded-xl overflow-hidden",
  tableHeader: "bg-brand-cream-soft/60",
  tableHeaderCell: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
  tableRow: "hover:bg-brand-cream-soft/40 transition-colors",
  tableCell: "text-sm",

  // Buttons
  buttonSm: "h-8 px-3 text-xs",
  buttonIcon: "h-8 w-8",
  buttonOutline: "border-brand-hairline",

  // Badges
  badge: "text-xs",
  badgeSecondary: "bg-brand-cream-soft text-foreground border border-brand-hairline",
  badgeCount:
    "ml-1.5 bg-brand-cream-soft text-foreground border border-brand-hairline px-1.5 py-0.5 rounded text-[10px] font-medium",

  // Icons
  icon: "h-4 w-4 text-muted-foreground",
  iconSm: "h-3.5 w-3.5",
  iconXs: "h-3 w-3",

  // Inputs
  input: "h-9 text-sm",
  select: "h-9 text-sm",

  // Stats Cards
  statsCard: "border-brand-hairline",
  statsIcon: "h-4 w-4 text-muted-foreground",
  statsValue: "text-2xl font-semibold tracking-tight text-foreground",
  statsLabel: "text-xs font-medium uppercase tracking-wider text-muted-foreground",

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
  emptyIcon: "h-12 w-12 text-muted-foreground/40 mb-4",
  emptyTitle: "text-base font-medium text-foreground",
  emptyDescription: "text-sm text-muted-foreground max-w-md",

  // Loading States
  skeleton: "bg-brand-hairline/40",

  // Separators
  separator: "bg-brand-hairline",
};

export type AdminTheme = typeof adminTheme;
