
# Plano: Módulo Skills - Visão Personalizada para Equipes

## Visão Geral

O Skills é um produto B2B focado em capacitar equipes de até 50% mais produtividade em 12 semanas. Diferente do Academy (foco individual) e Business (projeto customizado), o Skills trabalha com **diagnóstico individual por membro**, **consolidação de equipe por IA**, e **roadmap colaborativo com backlog priorizado**.

---

## Estrutura de Navegação Skills

### Menu Lateral (Meu Progresso > Skills)

| Submenu | URL | Descrição |
|---------|-----|-----------|
| Minha Evolução | `/evolucao` | Igual Academy (trilhas, ranking, favoritos) |
| Meu Diagnóstico | `/skills/diagnostico` | Formulário individual do membro |
| Minha Equipe | `/skills/equipe` | Diagnóstico consolidado + membros |
| Backlog | `/skills/backlog` | Soluções priorizadas |
| Roadmap | `/skills/roadmap` | Timeline 12 semanas |
| Minhas Entregas | `/skills/entregas` | Tarefas atribuídas ao membro |

---

## Banco de Dados - Novas Tabelas

### 1. `equipes_skills`
Agrupa membros de uma empresa/líder no Skills.

```sql
CREATE TABLE equipes_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  lider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  empresa_nome TEXT,
  setor TEXT,
  status TEXT DEFAULT 'ativo',
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. `membros_equipe_skills`
Vincula membros a uma equipe.

```sql
CREATE TABLE membros_equipe_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES equipes_skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cargo TEXT,
  papel TEXT DEFAULT 'membro', -- 'lider' ou 'membro'
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(equipe_id, user_id)
);
```

### 3. `diagnosticos_skills`
Formulário individual de cada membro (tarefas manuais, gargalos, ferramentas).

```sql
CREATE TABLE diagnosticos_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES equipes_skills(id) ON DELETE CASCADE,
  
  -- Seção 1: Contexto do Membro
  cargo TEXT,
  area_atuacao TEXT,
  tempo_na_empresa TEXT,
  
  -- Seção 2: Tarefas Manuais
  tarefas_manuais JSONB, -- [{tarefa, frequencia, tempo_gasto_horas}]
  ferramentas_atuais JSONB, -- [{nome, uso}]
  
  -- Seção 3: Gargalos e Dores
  processos_mais_demorados TEXT,
  gargalos_identificados JSONB, -- [texto]
  onde_perde_mais_tempo TEXT,
  
  -- Seção 4: Potencial de Automação
  processos_repetitivos TEXT,
  onde_poderia_ser_mais_produtivo TEXT,
  interesse_em_ia TEXT, -- nivel
  ja_usou_ia TEXT,
  
  -- Metadados
  completado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, equipe_id)
);
```

### 4. `diagnostico_consolidado_skills`
Visão compilada pela IA com insights da equipe.

```sql
CREATE TABLE diagnostico_consolidado_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID UNIQUE REFERENCES equipes_skills(id) ON DELETE CASCADE,
  
  -- Análise IA
  dores_comuns JSONB, -- [{dor, frequencia, areas_afetadas}]
  sobreposicoes_esforco JSONB, -- processos duplicados entre membros
  processos_maior_potencial JSONB, -- [{processo, horas_estimadas_economia, impacto}]
  insights_ia TEXT,
  recomendacoes JSONB,
  
  -- Métricas calculadas
  total_horas_manuais_semana NUMERIC,
  potencial_economia_horas NUMERIC,
  
  -- Metadados
  gerado_em TIMESTAMPTZ,
  versao INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. `backlog_skills`
Soluções priorizadas após conversa líder + IAplicada.

```sql
CREATE TABLE backlog_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES equipes_skills(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  area_impactada TEXT,
  responsavel_id UUID REFERENCES profiles(id),
  prioridade TEXT DEFAULT 'media', -- alta, media, baixa
  status TEXT DEFAULT 'levantado', -- levantado, priorizado, em_execucao, entregue
  horas_estimadas_economia NUMERIC,
  ordem INTEGER,
  origem TEXT, -- 'diagnostico', 'lider', 'iaplicada'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. `roadmap_skills`
Fases do projeto de 12 semanas.

```sql
CREATE TABLE roadmap_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES equipes_skills(id) ON DELETE CASCADE,
  numero_fase INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  semana_inicio INTEGER, -- semana 1-12
  semana_fim INTEGER,
  status TEXT DEFAULT 'pendente',
  data_prevista DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. `entregas_skills`
Entregas individuais vinculadas ao backlog/roadmap.

```sql
CREATE TABLE entregas_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES equipes_skills(id) ON DELETE CASCADE,
  backlog_item_id UUID REFERENCES backlog_skills(id) ON DELETE SET NULL,
  roadmap_fase_id UUID REFERENCES roadmap_skills(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES profiles(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  instrucoes TEXT, -- Markdown com passo a passo
  prompts_recomendados JSONB,
  status TEXT DEFAULT 'pendente', -- pendente, em_andamento, aguardando_validacao, aprovada
  prazo DATE,
  aprovado_por UUID REFERENCES profiles(id),
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 8. `metricas_skills`
Acompanhamento de resultados ao longo das 12 semanas.

```sql
CREATE TABLE metricas_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID REFERENCES equipes_skills(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL,
  horas_economizadas NUMERIC DEFAULT 0,
  processos_automatizados INTEGER DEFAULT 0,
  entregas_concluidas INTEGER DEFAULT 0,
  entregas_planejadas INTEGER DEFAULT 0,
  engajamento_trilhas NUMERIC, -- percentual
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Páginas e Componentes

### Novas Páginas

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/skills/SkillsDiagnostico.tsx` | Formulário individual do membro |
| `src/pages/skills/SkillsEquipe.tsx` | Painel da equipe (membros + consolidado) |
| `src/pages/skills/SkillsBacklog.tsx` | Kanban de soluções priorizadas |
| `src/pages/skills/SkillsRoadmap.tsx` | Timeline visual 12 semanas |
| `src/pages/skills/SkillsEntregas.tsx` | Minhas entregas atribuídas |
| `src/pages/skills/SkillsLiderDashboard.tsx` | Painel exclusivo do líder |

### Componentes Reutilizáveis

| Componente | Descrição |
|------------|-----------|
| `SkillsDiagnosticoForm.tsx` | Wizard de 4 etapas para membro |
| `SkillsEquipeMembroCard.tsx` | Card de membro com status diagnóstico |
| `SkillsConsolidadoPanel.tsx` | Visualização do diagnóstico IA |
| `SkillsBacklogKanban.tsx` | Board com colunas de status |
| `SkillsRoadmapTimeline.tsx` | Timeline visual com fases |
| `SkillsEntregaCard.tsx` | Card de entrega com instruções |
| `SkillsMetricasChart.tsx` | Gráficos de evolução (horas economizadas, etc.) |
| `SkillsLiderPainel.tsx` | Visão de gestor com alertas |

---

## Hooks Necessários

| Hook | Descrição |
|------|-----------|
| `useSkillsEquipe` | Dados da equipe do usuário logado |
| `useSkillsDiagnostico` | CRUD do diagnóstico individual |
| `useSkillsConsolidado` | Diagnóstico consolidado da equipe |
| `useSkillsBacklog` | Gestão do backlog (CRUD, reordenar) |
| `useSkillsRoadmap` | Fases do roadmap |
| `useSkillsEntregas` | Entregas do membro logado |
| `useSkillsMetricas` | Métricas de resultado |
| `useSkillsLiderView` | Dados agregados para o líder |

---

## Edge Functions

| Função | Descrição |
|--------|-----------|
| `consolidar-diagnosticos-skills` | Compila diagnósticos individuais com IA Gemini |
| `gerar-backlog-skills` | Formata texto em backlog estruturado |
| `gerar-roadmap-skills` | Cria roadmap 12 semanas baseado no backlog |

---

## Fluxo de Usuário

### Membro da Equipe

```text
1. Acessa "Meu Diagnóstico" → Preenche formulário individual
2. Visualiza "Minha Equipe" → Vê quem já preencheu
3. Após consolidação IA → Vê insights da equipe
4. Acessa "Minhas Entregas" → Tarefas atribuídas a ele
5. Executa entrega → Submete para validação
6. Líder/IAplicada aprova → Próxima tarefa
```

### Líder da Equipe

```text
1. Acompanha quem preencheu diagnóstico
2. Participa da call com IAplicada para priorizar backlog
3. Visualiza backlog priorizado
4. Monitora roadmap e progresso
5. Painel de gestor: alertas, engajamento, entregas
6. Valida entregas dos membros
```

---

## Alterações em Arquivos Existentes

| Arquivo | Alteração |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas `/skills/*` |
| `src/hooks/useUserPlan.tsx` | Já tem `isSkills` |
| `src/components/layout/AppSidebar.tsx` | Detectar Skills e mostrar submenus corretos |
| `menu_config` (banco) | Adicionar submenus Skills |

---

## Menu Config - Novos Registros

```sql
-- Submenus exclusivos Skills (parent_key = 'meu_progresso')
INSERT INTO menu_config (menu_key, label, url, icon, parent_key, planos_permitidos, ordem, tipo, visivel)
VALUES 
  ('skills_equipe', 'Minha Equipe', '/skills/equipe', 'Users', 'meu_progresso', ARRAY['skills'], 34, 'sidebar', true),
  ('skills_backlog', 'Backlog', '/skills/backlog', 'ListTodo', 'meu_progresso', ARRAY['skills'], 35, 'sidebar', true),
  ('skills_roadmap', 'Roadmap', '/skills/roadmap', 'Map', 'meu_progresso', ARRAY['skills'], 36, 'sidebar', true),
  ('skills_entregas', 'Minhas Entregas', '/skills/entregas', 'CheckSquare', 'meu_progresso', ARRAY['skills'], 37, 'sidebar', true);
```

---

## Considerações Técnicas

### Reutilização do Academy
- A página `Evolucao.tsx` continua igual para Skills (trilhas, ranking)
- O diagnóstico individual Skills é **diferente** do Academy (foco em tarefas manuais vs. objetivos pessoais)
- O `MeuDiagnostico.tsx` precisa detectar `isSkills` e redirecionar para `/skills/diagnostico`

### Detecção de Papel
- Líder: `membros_equipe_skills.papel = 'lider'`
- Membro: `membros_equipe_skills.papel = 'membro'`
- Líder tem acesso ao painel de gestão (`SkillsLiderDashboard`)

### RLS Policies
- Membros só veem dados da própria equipe
- Líder vê todos os membros da equipe
- Admin vê tudo

---

## Ordem de Implementação

### Fase 1: Estrutura Base
1. Criar tabelas no banco (migração SQL)
2. Adicionar menus no `menu_config`
3. Criar rotas em `App.tsx`
4. Atualizar `MeuDiagnostico.tsx` para redirecionar Skills

### Fase 2: Diagnóstico Individual
5. Criar `SkillsDiagnosticoForm.tsx` (wizard 4 etapas)
6. Criar página `SkillsDiagnostico.tsx`
7. Hook `useSkillsDiagnostico`

### Fase 3: Visão da Equipe
8. Criar `SkillsEquipe.tsx` com lista de membros
9. Edge function `consolidar-diagnosticos-skills`
10. Componente `SkillsConsolidadoPanel.tsx`

### Fase 4: Backlog e Roadmap
11. Criar `SkillsBacklog.tsx` (Kanban)
12. Criar `SkillsRoadmap.tsx` (Timeline)
13. Hooks correspondentes

### Fase 5: Entregas e Métricas
14. Criar `SkillsEntregas.tsx`
15. Fluxo de aprovação
16. Painel do líder
17. Gráficos de métricas
