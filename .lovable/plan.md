
# Backend e Painel Admin para Skills Performance

## Resumo
Criar a pagina de administracao **Mentoria > Skills** no painel admin para gerenciar os dados que alimentam o dashboard de Performance no frontend. As tabelas necessarias (entregas_skills, metricas_skills, roadmap_skills, equipes_skills) ja existem no banco com RLS configurado. Sera necessario adicionar colunas faltantes e criar o painel admin com CRUD completo.

---

## 1. Ajustes no Banco de Dados

As tabelas ja existem mas precisam de ajustes para suportar os dados exibidos no dashboard de Performance:

**Tabela `entregas_skills`** -- Adicionar campo `roi`:
- `roi numeric DEFAULT 0` -- percentual de ROI da entrega (campo exibido nos KPIs e ranking)

**Tabela `metricas_skills`** -- Adicionar campo `roi_projetado`:
- `roi_projetado numeric DEFAULT 0` -- ROI projetado para a semana (usado no grafico AreaChart)
- `roi_executado numeric DEFAULT 0` -- ROI executado na semana (usado no grafico AreaChart)

**Tabela `equipes_skills`** -- Adicionar campo `semana_atual`:
- `semana_atual integer DEFAULT 1` -- semana corrente do programa (para o cronograma de 12 semanas)

Nenhuma tabela nova precisa ser criada. As RLS policies ja cobrem acesso de admin (ALL) e membros (SELECT).

---

## 2. Pagina Admin: Mentoria > Skills

Nova pagina em `/admin/mentoria/skills` com 4 abas para gerenciar os dados:

### Aba 1: Equipes
- Seletor de equipe (dropdown com equipes ativas)
- Cards com dados da equipe selecionada: nome, empresa, data inicio/fim, investimento, custo hora, semana atual
- Botao para editar dados da equipe (inline ou modal)
- Atualizar `semana_atual`, `investimento`, `custo_hora_padrao`, `data_inicio`, `data_fim`

### Aba 2: Entregas
- Tabela listando todas as entregas da equipe selecionada
- Colunas: Titulo, Responsavel, Status, Horas Economizadas, ROI, Nota, Prazo
- Botao "Nova Entrega" -- formulario com campos: titulo, descricao, responsavel (select de membros), economia_horas_semana, roi, prazo, status
- Edicao inline ou modal para cada entrega
- Exclusao com confirmacao

### Aba 3: Metricas Semanais
- Tabela com metricas por semana (1 a 12)
- Colunas: Semana, Horas Economizadas, Processos Automatizados, Entregas Concluidas, Indice Maturidade, ROI Projetado, ROI Executado
- Botao para adicionar/editar metricas de cada semana
- Formulario com todos os campos numericos

### Aba 4: Roadmap (Fases)
- Lista de fases do roadmap com numero, titulo, semana inicio/fim, status
- CRUD para criar/editar/excluir fases
- Formulario: numero_fase, titulo, descricao, semana_inicio, semana_fim, status

---

## 3. Conexao Frontend (Dashboard Performance)

Atualizar o componente `ProjetoSkillsPerformance.tsx` para usar dados reais do banco em vez de dados mockados:

- Usar o hook `useSkillsLider` existente que ja busca: entregas, metricas, roadmap, ranking, KPIs
- Mapear os dados retornados para os formatos dos graficos e tabelas
- Manter fallback para dados mockados caso nao haja dados no banco

---

## 4. Navegacao

**AdminSidebar.tsx** -- Adicionar link no grupo Mentoria:
- `{ path: "/admin/mentoria/skills", label: "Skills" }`

**App.tsx** -- Adicionar rota:
- `<Route path="mentoria/skills" element={<MentoriaSkillsPage />} />`

---

## Detalhes Tecnicos

### Arquivos a Criar
- `src/pages/admin/mentoria/MentoriaSkillsPage.tsx` -- Pagina admin com 4 abas
- `src/components/admin/skills/SkillsEquipesTab.tsx` -- Aba de gestao de equipes
- `src/components/admin/skills/SkillsEntregasTab.tsx` -- Aba de gestao de entregas
- `src/components/admin/skills/SkillsMetricasTab.tsx` -- Aba de gestao de metricas semanais
- `src/components/admin/skills/SkillsRoadmapTab.tsx` -- Aba de gestao do roadmap
- `src/hooks/admin/useSkillsPerformanceAdmin.ts` -- Hook admin para CRUD de entregas, metricas e roadmap

### Arquivos a Modificar
- `src/App.tsx` -- Adicionar rota `/admin/mentoria/skills`
- `src/components/admin/AdminSidebar.tsx` -- Adicionar link "Skills" no menu Mentoria
- `src/components/skills/ProjetoSkillsPerformance.tsx` -- Substituir dados mockados por dados reais via `useSkillsLider`

### Migracao SQL
```text
ALTER TABLE entregas_skills ADD COLUMN roi numeric DEFAULT 0;
ALTER TABLE metricas_skills ADD COLUMN roi_projetado numeric DEFAULT 0;
ALTER TABLE metricas_skills ADD COLUMN roi_executado numeric DEFAULT 0;
ALTER TABLE equipes_skills ADD COLUMN semana_atual integer DEFAULT 1;
```

### Padrao Visual
- Usar `adminTheme` para consistencia com demais paginas admin
- Seletor de equipe no topo (igual ao padrao Academy com seletor de usuario)
- Tabs para separar as 4 areas de gestao
- Formularios em Dialogs modais para criacao/edicao
- Toasts de sucesso/erro via `sonner`

### Hooks e Queries
- Reutilizar `useEquipesSkillsAdmin` para listar equipes
- Criar queries especificas para CRUD de entregas, metricas e roadmap com `equipe_id` como filtro
- Invalidar queries relacionadas apos mutations para manter dados sincronizados
