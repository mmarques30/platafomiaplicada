
# Plano: Corrigir Filtragem de Menus Academy no Ambiente Skills

## Problema

No ambiente Skills, os menus específicos do Academy (Minha Evolução, Meu Diagnóstico, Minhas Dúvidas) continuam aparecendo, mesmo com a lógica de filtragem implementada.

## Diagnóstico

A lógica atual está correta no código:
```typescript
const getEnvironmentHiddenMenus = (environment: string | null): string[] => {
  switch (environment) {
    case 'skills':
      return ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'];
    // ...
  }
};
```

Os `menu_key` no banco de dados estão corretos:
| menu_key | label | planos_permitidos |
|----------|-------|-------------------|
| `evolucao` | Minha Evolução | `['academy', 'skills']` |
| `meu_diagnostico` | Meu Diagnóstico | `['academy', 'skills']` |
| `minhas_duvidas` | Minhas Dúvidas | `['academy', 'skills']` |

O problema pode ser uma das seguintes causas:
1. O `currentEnvironment` pode estar como `null` no momento da renderização
2. O filtro pode não estar sendo aplicado em algum caminho de código
3. Pode haver um problema de re-renderização

## Solução

### 1. Garantir que a Filtragem Funcione Mesmo Durante Loading

Adicionar verificação para retornar menus vazios enquanto o ambiente não está definido, ou adicionar `console.log` para debug:

### 2. Mover a lógica para o hook `useMenuConfig`

A solução mais robusta é integrar a filtragem por ambiente diretamente no hook `useMenuConfig`, já que ele é responsável por retornar os menus filtrados:

```typescript
// Em useMenuConfig.tsx
const getSidebarMenus = (userPlan?: string | null, environment?: string | null) => {
  // Menus a ocultar por ambiente
  const hiddenByEnvironment: Record<string, string[]> = {
    skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
    business: ['trilhas', 'calendario'],
  };
  
  const hiddenMenus = hiddenByEnvironment[environment || ''] || [];
  
  return menuConfig?.filter(m => {
    if (m.tipo !== 'sidebar' || !m.visivel) return false;
    
    // Filtrar por ambiente selecionado
    if (hiddenMenus.includes(m.menu_key)) return false;
    
    // Filtrar por plano
    if (!m.planos_permitidos || m.planos_permitidos.length === 0) return true;
    if (!userPlan) return false;
    return m.planos_permitidos.includes(userPlan);
  }) || [];
};
```

### 3. Atualizar AppSidebar.tsx

Passar o `currentEnvironment` para o `getSidebarMenus`:

```typescript
const sidebarMenus = getSidebarMenus(effectivePlan, currentEnvironment);
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useMenuConfig.tsx` | Adicionar parâmetro `environment` ao `getSidebarMenus` e aplicar filtro |
| `src/components/layout/AppSidebar.tsx` | Passar `currentEnvironment` para `getSidebarMenus` |

---

## Seção Técnica

### useMenuConfig.tsx - Código Atualizado

```typescript
const getSidebarMenus = (userPlan?: string | null, currentEnvironment?: string | null) => {
  // Menus a ocultar quando em ambiente específico
  // Skills/Business têm acesso separado ao Academy
  const hiddenByEnvironment: Record<string, string[]> = {
    skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
    business: ['trilhas', 'calendario'],
  };
  
  const hiddenMenus = hiddenByEnvironment[currentEnvironment || ''] || [];
  
  return menuConfig?.filter(m => {
    if (m.tipo !== 'sidebar' || !m.visivel) return false;
    
    // Filtrar menus por ambiente selecionado
    if (hiddenMenus.includes(m.menu_key)) return false;
    
    // Se planos_permitidos = null, menu visível para todos
    if (!m.planos_permitidos || m.planos_permitidos.length === 0) return true;
    
    // Se não tem plano, não mostra menus restritos
    if (!userPlan) return false;
    
    // Verifica se o plano do usuário está na lista de permitidos
    return m.planos_permitidos.includes(userPlan);
  }) || [];
};
```

### AppSidebar.tsx - Chamada Atualizada

```typescript
const sidebarMenus = getSidebarMenus(effectivePlan, currentEnvironment);
```

E remover a função `getEnvironmentHiddenMenus` do AppSidebar já que a filtragem será feita no hook.

---

## Comportamento Final

| Ambiente Selecionado | Menus Ocultos |
|---------------------|---------------|
| Academy | Nenhum |
| Skills | Trilhas, Calendário, Minha Evolução, Meu Diagnóstico, Minhas Dúvidas |
| Business | Trilhas, Calendário |
| Gratuito | Baseado apenas no plano |
