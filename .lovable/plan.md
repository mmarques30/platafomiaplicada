
# Plano Completo: Correção e Implementação do Painel do Líder Skills

## Problema Identificado

Existem duas estruturas de dados paralelas:

| Tabelas Corretas (pré-existentes) | Tabelas Duplicadas (criadas por erro) |
|-----------------------------------|---------------------------------------|
| equipes_skills | squads |
| membros_equipe_skills | membros_squad |
| entregas_skills | entregas_squad |
| roadmap_skills | roadmap_squad |
| metricas_skills | metricas_squad |

O painel do líder (`SquadLiderPainel.tsx`) está usando as tabelas `squads` (vazias), enquanto deveria usar as tabelas `*_skills` já existentes e populáveis via admin.

Além disso, o menu está duplicado: há código hardcoded no `AppSidebar.tsx` + entradas dinâmicas no `menu_config`.

---

## Correções Necessárias

### 1. Remover Duplicação do Menu

**Arquivo**: `src/components/layout/AppSidebar.tsx`

Remover completamente o bloco de código hardcoded (linhas 439-471) que renderiza o menu "Squad" apontando para `/squad` (rota inexistente).

### 2. Atualizar menu_config para Ambiente Skills

Atualizar os registros no banco para garantir que o menu Squad apareça **apenas no ambiente Skills**:

```sql
UPDATE menu_config 
SET planos_permitidos = ARRAY['skills']
WHERE menu_key IN ('squad', 'squad_lider');
```

### 3. Atualizar useMenuConfig para Filtrar Corretamente

**Arquivo**: `src/hooks/useMenuConfig.tsx`

Adicionar `squad` e `squad_lider` na lista de menus ocultos para ambientes que não são Skills (academy, business, business_iaplicada).

### 4. Alterar Hooks para Usar Tabelas Skills

**Arquivo**: `src/hooks/useSquadMembro.ts`

Alterar para buscar dados das tabelas `equipes_skills` e `membros_equipe_skills` ao invés de `squads` e `membros_squad`.

**Arquivo**: `src/hooks/useSquadLider.ts`

Alterar para buscar dados das tabelas `equipes_skills`, `membros_equipe_skills`, `entregas_skills`, `metricas_skills` e `roadmap_skills`.

### 5. Adicionar Campos Ausentes nas Tabelas Skills

As tabelas `*_skills` existentes precisam de alguns campos adicionais para suportar o painel do líder:

**equipes_skills** - adicionar:
- `investimento` (numeric)
- `custo_hora_padrao` (numeric)

**entregas_skills** - adicionar:
- `economia_horas_semana` (numeric)
- `avaliacao_nota` (numeric)
- `avaliacao_comentario` (text)
- `concluido_em` (timestamptz)
- `progresso` (integer)

**metricas_skills** - adicionar:
- `indice_maturidade` (numeric)

### 6. Adicionar Aba "Entregas" no Admin Skills

**Arquivo**: `src/pages/admin/mentoria/MentoriaSkillsPage.tsx`

Adicionar nova aba "Entregas" com funcionalidades de CRUD similar ao `EntregasBusinessManager.tsx`.

**Novo arquivo**: `src/components/admin/skills/EntregasSkillsTab.tsx`

Componente para gerenciar entregas das equipes Skills, incluindo:
- Lista de entregas por equipe
- Criar/editar/excluir entregas
- Definir responsável, prazo, economia de horas
- Atribuir avaliação e nota

### 7. Adicionar Aba "Métricas" no Admin Skills

**Novo arquivo**: `src/components/admin/skills/MetricasSkillsTab.tsx`

Componente para gerenciar métricas semanais:
- Registrar horas economizadas por semana
- Processos automatizados
- Engajamento com trilhas
- Índice de maturidade IA

### 8. Atualizar Redirecionamento do Painel

**Arquivo**: `src/pages/squad/SquadLiderPainel.tsx`

Alterar redirecionamento de não-líderes de `/` para `/skills/equipe`.

---

## Estrutura Final

### Admin Skills (MentoriaSkillsPage)

| Aba | Funcionalidade |
|-----|----------------|
| Equipes | Listar/selecionar equipes (já existe) |
| Diagnósticos | Ver diagnósticos (já existe) |
| Conteúdos | Gerenciar conteúdos liberados (já existe) |
| Roadmap | Gerenciar fases do programa (já existe) |
| Entregas | CRUD de entregas projetadas (NOVO) |
| Métricas | Registrar métricas semanais (NOVO) |
| Análises IA | Análises automáticas (já existe) |

### Painel do Líder (SquadLiderPainel)

Dashboard analítico consolidado usando dados das tabelas `*_skills`:
- KPIs (horas economizadas, ROI, entregas, performance)
- Cronograma 12 semanas
- Gráfico Impacto vs ROI
- Gráfico Maturidade IA
- Ranking de performance por colaborador
- Resumo de impacto financeiro

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| src/components/layout/AppSidebar.tsx | Remover bloco hardcoded do menu Squad (linhas 439-471) |
| src/hooks/useMenuConfig.tsx | Adicionar filtro de ambiente para squad/squad_lider |
| src/hooks/useSquadMembro.ts | Usar tabelas equipes_skills/membros_equipe_skills |
| src/hooks/useSquadLider.ts | Usar tabelas *_skills ao invés de *_squad |
| src/pages/squad/SquadLiderPainel.tsx | Ajustar redirecionamento e manter lógica atual |
| src/pages/admin/mentoria/MentoriaSkillsPage.tsx | Adicionar abas Entregas e Métricas |

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| src/components/admin/skills/EntregasSkillsTab.tsx | CRUD de entregas |
| src/components/admin/skills/MetricasSkillsTab.tsx | Registro de métricas semanais |

## Migrações de Banco

1. Adicionar colunas em `equipes_skills`: `investimento`, `custo_hora_padrao`
2. Adicionar colunas em `entregas_skills`: `economia_horas_semana`, `avaliacao_nota`, `avaliacao_comentario`, `concluido_em`, `progresso`
3. Adicionar coluna em `metricas_skills`: `indice_maturidade`
4. Atualizar `menu_config` para filtrar por ambiente
5. (Opcional) Remover tabelas duplicadas: `squads`, `membros_squad`, `entregas_squad`, `metricas_squad`, `roadmap_squad`

---

## Fluxo de Dados Corrigido

```text
Admin cadastra equipe (equipes_skills)
           |
           v
Admin adiciona membros no cadastro de usuários (membros_equipe_skills)
           |
           v
Admin configura roadmap (roadmap_skills)
           |
           v
Admin cria entregas projetadas (entregas_skills)
           |
           v
Admin registra métricas semanais (metricas_skills)
           |
           v
Líder acessa Painel (/squad/lider)
           |
           v
Dashboard exibe dados consolidados das tabelas *_skills
```

---

## Resultado Esperado

- Menu "Squad" com subitem "Painel do Líder" aparece apenas no ambiente Skills
- Sem duplicação de menus
- Painel do Líder exibe dados reais das tabelas `*_skills`
- Admin pode criar entregas, métricas e roadmap diretamente no painel Skills
- Estrutura consistente com o padrão Business já existente
