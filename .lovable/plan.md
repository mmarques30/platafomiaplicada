
# Plano: Ajustes na Visão de Visitantes - Início, Menu e Cursos

## Resumo das Correções

O usuário identificou três problemas na visão de visitantes:

1. **Visão inicial diferente dos outros ambientes** - Visitantes ao clicar em "Início" devem ver um dashboard semelhante ao de outros ambientes (Academy, Skills, Business), não a Central diretamente
2. **Central como subaba de Início** - A "Central de Conteúdo" deve aparecer como submenu de "Início" apenas para visitantes
3. **Remover botão "Cursos" do menu superior** - Visitantes não devem ver o dropdown "Cursos" no header

---

## Problema 1: Visão Inicial para Visitantes

### Situação Atual
- Visitante clica em "Início" no sidebar
- Dashboard.tsx redireciona para `/central`
- Central.tsx mostra a central de conteúdo diretamente

### Solução
Criar um dashboard próprio para visitantes similar aos outros ambientes:

1. Remover o redirect automático do Dashboard.tsx para visitantes
2. Mostrar para visitantes um layout similar ao de `Trilhas.tsx` quando `isVisitante`:
   - WelcomeHeader (saudação)
   - CTA para "Ter acesso ao Academy"
   - PWAInstallBanner
   - Componentes resumidos (CentralConteudoGratuito, etc.)

### Arquivo: `src/pages/Dashboard.tsx`

**Mudanças:**
- Remover o `useEffect` que redireciona visitantes para `/central`
- Alterar a condição `if (loadingRole || isVisitante)` para apenas `if (loadingRole)`
- Adicionar renderização condicional para visitantes com layout similar ao de Trilhas.tsx (WelcomeHeader, CTA, CentralConteudoGratuito, RankingTickerGratuito)

---

## Problema 2: Central como Submenu de Início

### Situação Atual
- Visitantes só veem "Início" no sidebar (sem submenus)
- AppSidebar linha 71: `if (!isLoadingState && isVisitante) return [];` - retorna array vazio de submenus

### Solução
Para visitantes, "Início" deve ter um submenu expansível com:
- **Visão Geral** → `/` (Dashboard)
- **Central** → `/central`

### Arquivo: `src/components/layout/AppSidebar.tsx`

**Mudanças:**
- Alterar a lógica `getSubMenus` para que visitantes tenham submenus específicos hardcoded:
  ```tsx
  const getSubMenus = (parentKey: string) => {
    // Visitantes têm submenus específicos para "início"
    if (!isLoadingState && isVisitante) {
      if (parentKey === 'inicio') {
        return [
          { menu_key: 'inicio_visao', label: 'Visão Geral', url: '/', icon: null, parent_key: 'inicio' },
          { menu_key: 'inicio_central', label: 'Central', url: '/central', icon: null, parent_key: 'inicio' },
        ];
      }
      return [];
    }
    return sidebarMenus.filter(menu => menu.parent_key === parentKey);
  };
  ```

---

## Problema 3: Remover "Cursos" do Menu Superior para Visitantes

### Situação Atual
- TopHeader linha 141-185: Dropdown "Cursos" aparece para todos exceto Academy e Business
- Visitantes ainda podem ver o dropdown (condição `!isAcademy && !isBusiness`)

### Solução
Adicionar `!isVisitante` à condição de exibição do dropdown "Cursos"

### Arquivo: `src/components/layout/TopHeader.tsx`

**Mudança:**
- Linha 142: Alterar de `{!isAcademy && !isBusiness && (` para `{!isVisitante && !isAcademy && !isBusiness && (`

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Dashboard.tsx` | Remover redirect, adicionar layout visitante |
| `src/components/layout/AppSidebar.tsx` | Adicionar submenus hardcoded para visitantes |
| `src/components/layout/TopHeader.tsx` | Ocultar dropdown "Cursos" para visitantes |

---

## Detalhes Técnicos

### Dashboard.tsx - Novo Layout Visitante

```tsx
import { CentralConteudoGratuito } from "@/components/dashboard/CentralConteudoGratuito";
import { RankingTickerGratuito } from "@/components/dashboard/RankingTickerGratuito";
import { Zap } from "lucide-react";

// Remover useEffect de redirect para visitantes

// Alterar loading check
if (loadingRole) {
  return <LoadingSpinner />;
}

// Renderização condicional
return (
  <div className="min-h-screen bg-background pt-2">
    <main className="container py-3 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6 lg:space-y-8">
      {isVisitante ? (
        // Layout visitante similar a Trilhas.tsx
        <div className="space-y-6">
          <WelcomeHeader />
          
          <Link to="/servicos" className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-red-600 bg-red-50/50 hover:bg-red-100 ...">
            <Zap className="h-5 w-5" />
            Ter acesso ao Academy
          </Link>
          
          <PWAInstallBanner />
          <CentralConteudoGratuito />
          <RankingTickerGratuito />
        </div>
      ) : (
        // Layout mentorado existente
        <>
          {mostrarAvisoSenha && <Alert>...</Alert>}
          <WelcomeHeader />
          <PWAInstallBanner />
          <PendenciasOnboarding />
          <CentralConteudo />
          <RankingTicker />
          <NovidadesSemana />
        </>
      )}
    </main>
  </div>
);
```

### AppSidebar.tsx - Submenus Visitante

```tsx
const getSubMenus = (parentKey: string) => {
  // Visitantes têm submenus específicos para "início"
  if (!isLoadingState && isVisitante) {
    if (parentKey === 'inicio') {
      return [
        { menu_key: 'inicio_visao', label: 'Visão Geral', url: '/', icon: null, parent_key: 'inicio' },
        { menu_key: 'inicio_central', label: 'Central', url: '/central', icon: null, parent_key: 'inicio' },
      ] as any[];
    }
    return [];
  }
  return sidebarMenus.filter(menu => menu.parent_key === parentKey);
};
```

### TopHeader.tsx - Ocultar Cursos

```tsx
{/* Dropdown Cursos - oculto para Visitante, Academy e Business */}
{!isVisitante && !isAcademy && !isBusiness && (
  <DropdownMenu>
    ...
  </DropdownMenu>
)}
```

---

## Fluxo Final para Visitantes

```text
Visitante acessa plataforma
        │
        ▼
    ┌─────────────────┐
    │   Sidebar       │
    │  ┌───────────┐  │
    │  │ ▼ Início  │  │ (expansível)
    │  │  • Visão  │  │ → /  (Dashboard visitante)
    │  │  • Central│  │ → /central
    │  └───────────┘  │
    │  ┌───────────┐  │
    │  │ Comunidade│  │ (já existe)
    │  └───────────┘  │
    └─────────────────┘
        │
        ▼
    ┌─────────────────┐
    │   Top Header    │
    │  Página Inicial │ (sem "Cursos")
    │  Comunicações   │
    └─────────────────┘
```

---

## Impacto

- **Visitantes**: Experiência similar aos outros ambientes com dashboard próprio
- **Menu lateral**: "Início" vira grupo expansível com "Visão Geral" e "Central"
- **Menu superior**: Dropdown "Cursos" não aparece mais para visitantes
- **Central**: Continua acessível via submenu e funcionando normalmente
