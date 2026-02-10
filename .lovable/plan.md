
# Corrigir fallback de ambiente + loading guard nos submenus Skills

## O que ja existe
- A logica de `effectiveEnvironment` ja esta em `AppSidebar.tsx` (linhas 63-87)
- A filtragem de submenus por papel (lider/admin) ja esta implementada (linhas 120-123)

## O que falta (2 ajustes pontuais)

### 1. Fallback quando nenhum ambiente selecionado
**Arquivo**: `src/components/layout/AppSidebar.tsx` (linhas 64-69)

Atualmente, quando o usuario nao esta em simulacao e nao e `business_iaplicada`, a linha 69 retorna `currentEnvironment` diretamente. Se o usuario nao passou pela tela de selecao (ou a sessionStorage perdeu o valor), `currentEnvironment` e `null`, a lista `hiddenMenus` fica vazia, e menus como `meu_progresso` aparecem indevidamente no Skills.

**Correcao**: Antes de retornar `currentEnvironment`, verificar se e `null` e inferir do plano:

```typescript
if (!isViewingAs) {
  if (effectivePlan === 'business_iaplicada') {
    return 'business_iaplicada';
  }
  // Fallback: se nenhum ambiente selecionado, inferir do plano
  if (!currentEnvironment) {
    if (effectivePlan === 'skills') return 'skills';
    if (effectivePlan === 'business') return 'business';
    if (effectivePlan === 'academy') return 'academy';
    if (isVisitante) return 'gratuito';
    return null;
  }
  return currentEnvironment;
}
```

### 2. Loading guard nos filtros de submenus
**Arquivo**: `src/components/layout/AppSidebar.tsx` (linhas 120-123)

Atualmente, enquanto `useSkillsMembro` ainda carrega, `isSkillsLider` e `false`, e os submenus (Performance, Diagnostico, Projetos) sao filtrados. Isso causa redirect/404.

**Correcao**: Usar `isLoading` do `useSkillsMembro` para manter os submenus visiveis durante o carregamento:

```typescript
const { isLider: isSkillsLider, isLoading: skillsMembroLoading } = useSkillsMembro();

// Nos filtros:
.filter(menu => !['skills_lider', 'skills_painel_lider'].includes(menu.menu_key) 
  || isSkillsLider || isAdmin || skillsMembroLoading)
.filter(menu => !['projeto_skills_performance', 'projeto_skills_diagnostico', 'projeto_skills_projetos'].includes(menu.menu_key) 
  || isSkillsLider || isAdmin || skillsMembroLoading)
```

## Arquivo alterado
- `src/components/layout/AppSidebar.tsx` - 2 alteracoes pontuais (fallback + loading guard)
