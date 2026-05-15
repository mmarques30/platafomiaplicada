// Tokens de tema centralizados para todas as páginas Admin
// Tipografia editorial Fraunces serif no display + pills brand-strong nas tabs
// + paleta brand-hairline/cream-soft espelhando o app público.

export const adminTheme = {
  // Layout de página
  page: "space-y-8",

  // Header de página
  // - pageHeader: container linha (título + actions à direita)
  // - pageTitleWrapper: bloco esquerdo (ícone+título inline, retrocompat)
  // - pageEyebrow: CAPS opcional acima do título (estilo LP "01 — APRENDER")
  pageHeader: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-4 pb-2",
  pageTitleWrapper: "flex items-center gap-3",
  pageEyebrow:
    "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-2 before:h-px before:w-6 before:bg-foreground/30 before:inline-block mb-1",
  pageTitle:
    "font-serif-display text-2xl md:text-3xl leading-[1.05] tracking-tight text-foreground",
  pageSubtitle: "text-sm font-light text-muted-foreground max-w-prose mt-1",
  pageIcon: "h-5 w-5 text-muted-foreground shrink-0",

  // Cards
  card: "border-brand-hairline rounded-xl",
  cardHeader: "pb-3",
  cardTitle: "text-base font-semibold tracking-tight",
  cardDescription: "text-sm text-muted-foreground",

  // Tabs em pill estilo LP (rounded-full + brand-strong active)
  tabsList:
    "bg-brand-cream-soft border border-brand-hairline rounded-full p-1 h-auto inline-flex flex-wrap gap-1",
  tabsTrigger:
    "text-xs font-medium rounded-full px-4 py-1.5 gap-1.5 text-muted-foreground transition-colors data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground",
  tabsIcon: "h-3.5 w-3.5",
  tabsContent: "mt-6",

  // Tables — header editorial CAPS
  tableContainer: "border border-brand-hairline rounded-xl overflow-hidden",
  tableHeader: "bg-brand-cream-soft/60",
  tableHeaderCell:
    "text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
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
    "ml-1.5 bg-brand-cream-soft text-foreground border border-brand-hairline px-1.5 py-0.5 rounded-full text-[10px] font-medium",

  // Icons
  icon: "h-4 w-4 text-muted-foreground",
  iconSm: "h-3.5 w-3.5",
  iconXs: "h-3 w-3",

  // Inputs
  input: "h-9 text-sm",
  select: "h-9 text-sm",

  // Stats Cards — valor em Fraunces serif igual o WelcomeHeader/KPIs
  statsCard: "border-brand-hairline rounded-xl",
  statsIcon: "h-4 w-4 text-muted-foreground",
  statsValue: "font-serif-display text-3xl leading-none text-foreground",
  statsLabel:
    "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",

  // Filters
  filterBar: "flex flex-wrap items-center gap-3 mb-4",
  filterSelect: "w-[180px] h-9",
  filterInput: "w-[240px] h-9",

  // Dialogs/Modals
  dialogHeader: "pb-4",
  dialogTitle: "text-lg font-semibold tracking-tight",
  dialogDescription: "text-sm text-muted-foreground",

  // Empty States — mais editorial
  emptyState: "flex flex-col items-center justify-center py-12 text-center",
  emptyIcon: "h-10 w-10 text-muted-foreground/40 mb-3",
  emptyTitle: "font-serif-display text-lg text-foreground",
  emptyDescription: "text-sm text-muted-foreground max-w-md mt-1",

  // Loading States
  skeleton: "bg-brand-hairline/40",

  // Separators
  separator: "bg-brand-hairline",
};

export type AdminTheme = typeof adminTheme;
