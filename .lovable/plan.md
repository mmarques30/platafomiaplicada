
# Correção definitiva: Projeto Skills 404 + Meu Progresso reaparecendo

## Diagnóstico da causa raiz

A Livia tem `plano_mentoria = "business"` com `skills_liberado = true` e e lider em uma equipe Skills. O problema esta na logica de filtragem de menus no `useMenuConfig.tsx`:

```
// Filtro atual:
return m.planos_permitidos.includes(userPlan);
// userPlan = "business", planos_permitidos = ["skills"] → FALSE → menu oculto!
```

Os menus do Projeto Skills tem `planos_permitidos: ["skills"]` no banco de dados, mas o `effectivePlan` da Livia e "business" (seu plano real). Mesmo selecionando o ambiente "skills", o filtro usa o **plano do usuario** e nao o **ambiente selecionado**, escondendo todos os menus do Projeto Skills.

Sem os menus do Projeto Skills, ela tenta acessar as URLs diretamente (ou via cache do navegador), e os componentes com `SkillsAdminGuard` a redirecionam para `/skills/projeto`, criando um loop que parece 404.

O "Meu Progresso" reaparece porque e filtrado por ambiente (hidden no ambiente skills/business) - mas como os menus skills nao aparecem, o usuario pode acabar sem ambiente selecionado ou com ambiente incorreto, expondo o Meu Progresso (que tem `planos_permitidos: null`).

## Solucao

### 1. Corrigir filtro de planos no `useMenuConfig.tsx`

Modificar a funcao `getSidebarMenus` para considerar o ambiente selecionado no filtro de `planos_permitidos`. Se o usuario esta no ambiente "skills", menus com `planos_permitidos: ["skills"]` devem ser exibidos independente do plano base:

```typescript
// ANTES (bugado):
return m.planos_permitidos.includes(userPlan);

// DEPOIS (corrigido):
// Se o ambiente selecionado corresponde a um dos planos permitidos, mostrar o menu
if (currentEnvironment && m.planos_permitidos.includes(currentEnvironment)) return true;
// Fallback: verificar plano do usuario
return m.planos_permitidos.includes(userPlan);
```

Isso resolve ambos os bugs:
- Projeto Skills aparece quando ambiente = "skills", mesmo para usuarios business com skills_liberado
- Meu Progresso continua oculto porque ja e filtrado pelo `hiddenByEnvironment` antes de chegar no filtro de plano

### 2. Nenhuma alteracao no banco de dados

O `planos_permitidos: ["skills"]` no banco permanece correto - o fix e apenas na logica de filtragem do frontend.

### 3. Nenhuma alteracao em rotas ou guards

As rotas em `App.tsx` e o `SkillsAdminGuard` estao corretos. O problema e exclusivamente de visibilidade no menu.

## Arquivos alterados

- `src/hooks/useMenuConfig.tsx` — ajustar filtro em `getSidebarMenus` para considerar o ambiente selecionado ao avaliar `planos_permitidos`
