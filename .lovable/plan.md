
# Plano: Corrigir Painel do Lider e Estrutura de Menus do Skills

## Diagnostico do Problema

O painel do lider sumiu porque:
1. O menu "Meu Progresso" no ambiente Skills aponta para `/skills/progresso`, mas deveria apontar para `/skills/equipe`
2. Faltam submenus essenciais do Skills no banco de dados (`menu_config`): Minha Equipe, Backlog, Roadmap, Entregas
3. A pagina `SkillsPainelLider.tsx` usa dados mockados em vez de buscar dados reais do banco
4. O usuario atual (Mariana) nao tem plano Skills nem pertence a nenhuma equipe - por isso nao ve o menu

## Arquitetura Atual vs Desejada

```text
ATUAL (Problematico):
Meu Progresso (parent)
  └── Painel do Lider → /skills/progresso  [UNICO SUBMENU]

DESEJADO:
Meu Progresso → /skills/equipe (URL padrao para Skills)
  ├── Minha Equipe → /skills/equipe
  ├── Backlog → /skills/backlog
  ├── Roadmap → /skills/roadmap
  ├── Entregas → /skills/entregas
  └── Painel do Lider → /skills/progresso  [APENAS LIDERES]
```

## Solucao em Etapas

### Etapa 1: Atualizar Banco de Dados (menu_config)

Inserir novos itens de menu para o ambiente Skills:

| menu_key | label | url | parent_key | planos_permitidos | ordem |
|----------|-------|-----|------------|-------------------|-------|
| skills_minha_equipe | Minha Equipe | /skills/equipe | meu_progresso | [skills] | 30 |
| skills_backlog | Backlog | /skills/backlog | meu_progresso | [skills] | 31 |
| skills_roadmap | Roadmap | /skills/roadmap | meu_progresso | [skills] | 32 |
| skills_entregas | Entregas | /skills/entregas | meu_progresso | [skills] | 33 |

E atualizar o item existente `skills_painel_lider` para ordem 34.

### Etapa 2: Ajustar Hook useMenuConfig

Adicionar filtro especial para ocultar "Painel do Lider" (`skills_painel_lider`) de usuarios que nao sao lideres Skills. O hook ja tem logica similar para `skills_lider` - precisa incluir `skills_painel_lider`.

Arquivo: `src/hooks/useMenuConfig.tsx`
- Na funcao `getSubMenus` do `AppSidebar.tsx`, ja existe filtro para `skills_lider`
- Estender para incluir `skills_painel_lider`

### Etapa 3: Ajustar URL Padrao do Meu Progresso

No `AppSidebar.tsx`, a funcao `getMenuUrl` ja trata o caso Skills:
```tsx
if (menu.menu_key === 'meu_progresso') {
  if (effectivePlan === 'skills' || effectiveEnvironment === 'skills') {
    return '/skills/progresso';  // ATUAL
  }
}
```

Alterar para retornar `/skills/equipe` conforme requisitado.

### Etapa 4: Refatorar SkillsPainelLider para Dados Reais

Substituir os dados mockados pelos hooks existentes:
- `useSkillsEquipe()` - membros e status
- `useSkillsLider()` - entregas, alertas, metricas
- `useSkillsEntregas()` - lista de entregas

Manter a mesma estrutura visual (KPIs, Cronograma, Equipe, Entregas, Alertas).

### Etapa 5: Proteger Rota /skills/progresso

Na pagina `SkillsMeuProgresso.tsx`:
1. Verificar se usuario e lider via `useSkillsMembro().isLider`
2. Redirecionar nao-lideres para `/skills/equipe`

---

## Detalhes Tecnicos

### Insercoes no Banco (menu_config)

```sql
INSERT INTO menu_config (menu_key, label, tipo, url, icon, visivel, editavel, ordem, parent_key, planos_permitidos)
VALUES 
  ('skills_minha_equipe', 'Minha Equipe', 'sidebar', '/skills/equipe', NULL, true, true, 30, 'meu_progresso', ARRAY['skills']),
  ('skills_backlog', 'Backlog', 'sidebar', '/skills/backlog', NULL, true, true, 31, 'meu_progresso', ARRAY['skills']),
  ('skills_roadmap', 'Roadmap', 'sidebar', '/skills/roadmap', NULL, true, true, 32, 'meu_progresso', ARRAY['skills']),
  ('skills_entregas', 'Entregas', 'sidebar', '/skills/entregas', NULL, true, true, 33, 'meu_progresso', ARRAY['skills']);

UPDATE menu_config 
SET ordem = 34 
WHERE menu_key = 'skills_painel_lider';
```

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/layout/AppSidebar.tsx` | Alterar URL padrao de Skills para /skills/equipe; adicionar filtro para ocultar `skills_painel_lider` de nao-lideres |
| `src/pages/skills/SkillsMeuProgresso.tsx` | Adicionar guard para redirecionar nao-lideres |
| `src/pages/skills/SkillsPainelLider.tsx` | Substituir dados mockados por hooks reais (`useSkillsEquipe`, `useSkillsLider`); manter layout visual |

### Fluxo de Navegacao Resultante

```text
Usuario Skills (Membro):
  Meu Progresso → /skills/equipe
    ├── Minha Equipe (ativa)
    ├── Backlog
    ├── Roadmap
    └── Entregas
    [Painel do Lider OCULTO]

Usuario Skills (Lider):
  Meu Progresso → /skills/equipe
    ├── Minha Equipe
    ├── Backlog
    ├── Roadmap
    ├── Entregas
    └── Painel do Lider (visivel)

Usuario Business com Skills Liberado (ambiente Skills):
  Mesma estrutura do Skills
```

### Dependencias de Dados

O `SkillsPainelLider` refatorado dependera de:
1. `membros_equipe_skills` - lista de membros
2. `entregas_skills` - projetos/entregas
3. `diagnostico_consolidado_skills` - metricas de economia
4. `roadmap_skills` - fases do cronograma

Atualmente essas tabelas tem dados minimos (1 equipe, 2 membros, 0 entregas). O painel mostrara estados vazios apropriados.

---

## Resultado Esperado

1. Menu "Meu Progresso" no Skills abre `/skills/equipe` (Minha Equipe)
2. Submenus visiveis para todos Skills: Minha Equipe, Backlog, Roadmap, Entregas
3. Submenu "Painel do Lider" visivel apenas para usuarios com `papel='lider'`
4. Pagina `/skills/progresso` protegida - redireciona nao-lideres
5. Painel do Lider exibe dados reais da equipe (nao mockados)
6. Usuarios Business com `skills_liberado=true` veem menus Skills quando no ambiente Skills
