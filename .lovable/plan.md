
# Plano: Ajustar Ordem da Central e Remover Subaba Extra

## Mudanças Solicitadas

### 1. Reordenar Tabs na Central de Conteúdo Gratuito

**Arquivo:** `src/components/dashboard/CentralConteudoGratuito.tsx`

**Situação Atual (linha 15-20):**
```tsx
const tabs = [
  { value: "newsletter" as TabValue, label: "Newsletter", icon: Newspaper },
  { value: "noticia" as TabValue, label: "Notícias IA", icon: Globe },
  { value: "dica" as TabValue, label: "Dicas Práticas", icon: Lightbulb },
  { value: "material" as TabValue, label: "Materiais", icon: FileText },
];
```

**Nova Ordem:**
```tsx
const tabs = [
  { value: "noticia" as TabValue, label: "Notícias IA", icon: Globe },
  { value: "dica" as TabValue, label: "Dicas Práticas", icon: Lightbulb },
  { value: "material" as TabValue, label: "Materiais", icon: FileText },
  { value: "newsletter" as TabValue, label: "Newsletter", icon: Newspaper },
];
```

**Estado inicial:** Alterar de `"newsletter"` para `"noticia"` (linha 23)

---

### 2. Remover Subaba "Visão Geral" para Visitantes

**Arquivo:** `src/components/layout/AppSidebar.tsx`

**Situação Atual (linha 69-81):**
```tsx
const getSubMenus = (parentKey: string) => {
  if (!isLoadingState && isVisitante) {
    if (parentKey === 'inicio') {
      return [
        { menu_key: 'inicio_central', label: 'Central', url: '/central', ... },
        { menu_key: 'inicio_visao', label: 'Visão Geral', url: '/', ... },
      ] as any[];
    }
    return [];
  }
  return sidebarMenus.filter(menu => menu.parent_key === parentKey);
};
```

**Correção:** Remover a entrada "Visão Geral" - manter apenas "Central"
```tsx
const getSubMenus = (parentKey: string) => {
  if (!isLoadingState && isVisitante) {
    if (parentKey === 'inicio') {
      return [
        { menu_key: 'inicio_central', label: 'Central', url: '/central', icon: null, parent_key: 'inicio' },
      ] as any[];
    }
    return [];
  }
  return sidebarMenus.filter(menu => menu.parent_key === parentKey);
};
```

---

## Comportamento Final

### Menu Lateral para Visitantes
```
┌─────────────────┐
│ ▼ Início        │ → / (Dashboard visitante)
│    • Central    │ → /central
└─────────────────┘
│   Comunidade    │ (já existe)
└─────────────────┘
```

### Ordem das Tabs na Central (Dashboard Visitante)
```
[ Notícias IA | Dicas Práticas | Materiais | Newsletter ]
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/dashboard/CentralConteudoGratuito.tsx` | Reordenar tabs e alterar estado inicial |
| `src/components/layout/AppSidebar.tsx` | Remover "Visão Geral" dos submenus de visitantes |
