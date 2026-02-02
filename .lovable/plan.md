

# Plano: Ajustar Visibilidade de Menus por Ambiente

## Contexto

Usuários Skills e Business têm acesso ao ambiente Academy separadamente. Portanto, quando estão no ambiente Skills ou Business, não devem ver menus duplicados que são específicos do Academy.

| Ambiente | Menus a Remover |
|----------|-----------------|
| **Skills** | Trilhas, Calendário, Minha Evolução, Meu Diagnóstico, Minhas Dúvidas |
| **Business** (ambos tipos) | Trilhas, Calendário |

## Estratégia

Adicionar filtragem no `AppSidebar.tsx` baseada no **ambiente selecionado** (`currentEnvironment`), removendo os menus conforme tabela acima.

---

## Alterações

### 1. AppSidebar.tsx

Importar o hook `useEnvironment` e adicionar lógica de filtragem:

```typescript
import { useEnvironment } from "@/hooks/useEnvironment";

// Dentro do componente
const { currentEnvironment } = useEnvironment();

// Menus a ocultar por ambiente
const menusToHideByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
  business: ['trilhas', 'calendario'],
};

// Aplicar filtro após obter submenus
const getSubMenus = (parentKey: string) => {
  // ... lógica existente ...
  
  // Filtrar menus baseado no ambiente selecionado
  const menusToHide = menusToHideByEnvironment[currentEnvironment || ''] || [];
  
  return sidebarMenus
    .filter(menu => menu.parent_key === parentKey)
    .filter(menu => !menusToHide.includes(menu.menu_key))
    .filter(menu => menu.menu_key !== 'skills_lider' || isSkillsLider);
};
```

### 2. Estrutura Final por Ambiente

**Ambiente Academy:**
- Aprender → Trilhas, Calendário, Central
- Meu Progresso → Minha Evolução, Meu Diagnóstico, Minhas Dúvidas

**Ambiente Skills:**
- Aprender → Central (Trilhas e Calendário removidos)
- Meu Progresso → Minha Equipe, Backlog, Roadmap, Minhas Entregas, Painel do Líder

**Ambiente Business:**
- Aprender → Central (Trilhas e Calendário removidos)
- Meu Progresso → Visão Geral, Roadmap, Evolução Aprendizado

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/AppSidebar.tsx` | Adicionar filtro por ambiente selecionado |

---

## Seção Técnica

### Mapeamento de menu_keys a ocultar

Com base nos dados do banco:

| menu_key | label | parent_key | Ocultar em |
|----------|-------|------------|------------|
| `trilhas` | Trilhas | aprender | Skills, Business |
| `calendario` | Calendário | aprender | Skills, Business |
| `evolucao` | Minha Evolução | meu_progresso | Skills |
| `meu_diagnostico` | Meu Diagnóstico | meu_progresso | Skills |
| `minhas_duvidas` | Minhas Dúvidas | meu_progresso | Skills |

### Código Completo

```typescript
// Menus a ocultar quando em ambiente específico
// Skills e Business terão acesso separado ao Academy, então menus duplicados são ocultados
const getEnvironmentHiddenMenus = (environment: string | null): string[] => {
  switch (environment) {
    case 'skills':
      return ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'];
    case 'business':
      return ['trilhas', 'calendario'];
    default:
      return [];
  }
};

// No getSubMenus, aplicar filtro
const hiddenMenus = getEnvironmentHiddenMenus(currentEnvironment);

return sidebarMenus
  .filter(menu => menu.parent_key === parentKey)
  .filter(menu => !hiddenMenus.includes(menu.menu_key))
  .filter(menu => menu.menu_key !== 'skills_lider' || isSkillsLider);
```

