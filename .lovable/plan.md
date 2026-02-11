
# Corrigir Simulacao Admin para Todos os Planos

## Problema

Quando o admin usa "Ver como..." para simular qualquer usuario, os filtros do menu lateral nas linhas 129 e 130 do `AppSidebar.tsx` verificam `isAdmin` diretamente. Como o admin continua sendo admin durante a simulacao, esses filtros sao ignorados e o admin ve menus que o usuario real nao veria (ex: Painel do Lider, Performance).

Isso afeta todos os planos, nao so Skills.

## Solucao

Substituir `isAdmin` por `(isAdmin && !isViewingAs)` nas duas linhas de filtro (129 e 130). A variavel `isViewingAs` ja esta disponivel no componente (linha 38).

### Arquivo: `src/components/layout/AppSidebar.tsx`

**Linha 129** - Filtro de Painel do Lider:
```text
// De:
.filter(menu => !['skills_lider', 'skills_painel_lider'].includes(menu.menu_key) || isSkillsLider || isAdmin || skillsMembroLoading)

// Para:
.filter(menu => !['skills_lider', 'skills_painel_lider'].includes(menu.menu_key) || isSkillsLider || (isAdmin && !isViewingAs) || skillsMembroLoading)
```

**Linha 130** - Filtro de Performance:
```text
// De:
.filter(menu => !['projeto_skills_performance'].includes(menu.menu_key) || isSkillsLider || isAdmin || skillsMembroLoading)

// Para:
.filter(menu => !['projeto_skills_performance'].includes(menu.menu_key) || isSkillsLider || (isAdmin && !isViewingAs) || skillsMembroLoading)
```

## Resultado

- **Admin sem simulacao**: `isViewingAs` e `false`, entao `(isAdmin && !isViewingAs)` e `true` -- ve tudo normalmente
- **Admin simulando qualquer usuario**: `isViewingAs` e `true`, entao `(isAdmin && !isViewingAs)` e `false` -- o menu respeita apenas os papeis do usuario simulado (via `isSkillsLider` que ja usa `impersonatedUserId`)
- **Nenhum impacto** nos demais filtros de ambiente (`getSidebarMenus` ja usa `effectiveEnvironment` que respeita a simulacao)
- Funciona para todos os planos: Academy, Skills, Business e Visitante
