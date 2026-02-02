

# Plano: Trilhas Skills + Painel Admin Skills

## Resumo

Implementar duas funcionalidades interconectadas:
1. **Menu "Trilhas Skills"** no ambiente Skills (submenu de "Aprender") - exibe conteúdos direcionados para a equipe após diagnóstico
2. **Aba "Skills" no Admin > Mentoria** - gestão de equipes, liberação de conteúdos e análises com IA

---

## Contexto Atual

### Estrutura Skills Existente
- Tabelas: `equipes_skills`, `membros_equipe_skills`, `diagnosticos_skills`, `backlog_skills`, `roadmap_skills`, `entregas_skills`
- Páginas: `SkillsDiagnostico`, `SkillsEquipe`, `SkillsBacklog`, `SkillsRoadmap`, `SkillsEntregas`, `SkillsLiderDashboard`
- Não existe vínculo entre trilhas/módulos e equipes Skills

### Estrutura Conteúdo Existente
- Trilhas e módulos possuem `nivel_minimo_acesso` (academy, lab, skills, club)
- Não há campo para vincular conteúdo específico a equipes Skills

---

## Parte 1: Trilhas Skills (Ambiente do Usuário)

### 1.1 Novo Menu no Sidebar

Adicionar item no `menu_config` dentro do grupo "Aprender":

| menu_key | label | url | parent_key | planos_permitidos |
|----------|-------|-----|------------|-------------------|
| `trilhas_skills` | Trilhas Skills | `/skills/trilhas` | `aprender` | `['skills']` |

### 1.2 Nova Tabela: `conteudos_liberados_skills`

Tabela para vincular conteúdos específicos às equipes:

```sql
CREATE TABLE public.conteudos_liberados_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES equipes_skills(id) ON DELETE CASCADE,
  trilha_id uuid REFERENCES trilhas(id) ON DELETE CASCADE,
  modulo_id uuid REFERENCES modulos(id) ON DELETE CASCADE,
  liberado_por uuid REFERENCES auth.users(id),
  motivo text, -- "diagnostico", "manual", "fase_roadmap"
  fase_roadmap_id uuid REFERENCES roadmap_skills(id) ON DELETE SET NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT check_trilha_ou_modulo CHECK (
    (trilha_id IS NOT NULL AND modulo_id IS NULL) OR 
    (trilha_id IS NULL AND modulo_id IS NOT NULL)
  )
);
```

### 1.3 Nova Página: `/skills/trilhas`

Componente `SkillsTrilhas.tsx`:
- Busca conteúdos liberados para a equipe do usuário via `conteudos_liberados_skills`
- Exibe trilhas/módulos em formato de cards
- Filtra por fase do roadmap se houver associação
- Mostra progresso de conclusão

### 1.4 Hook: `useSkillsTrilhas`

```typescript
// Busca conteúdos liberados para a equipe do usuário
// Retorna trilhas e módulos com metadados de progresso
```

---

## Parte 2: Painel Admin Skills

### 2.1 Nova Página Admin: `/admin/mentoria/skills`

Componente `MentoriaSkillsPage.tsx` com estrutura de abas:

| Aba | Descrição |
|-----|-----------|
| **Equipes** | Lista e gerencia equipes Skills |
| **Diagnósticos** | Visualiza diagnósticos individuais e consolidados |
| **Conteúdos** | Libera trilhas/módulos para equipes |
| **Roadmap** | Visualiza/edita roadmap da equipe |
| **Análises IA** | Insights e recomendações gerados por IA |

### 2.2 Aba Equipes

- Selecionar equipe para gerenciar
- Ver membros e status dos diagnósticos
- Ações: editar equipe, adicionar membros

### 2.3 Aba Diagnósticos

- Tabela com diagnósticos individuais dos membros
- Card com diagnóstico consolidado (gerado por IA)
- Botão para regenerar consolidado

### 2.4 Aba Conteúdos (Liberação)

**Funcionalidades:**
- Lista conteúdos já liberados para a equipe
- Botão "Adicionar Conteúdo" abre modal com:
  - Seletor de trilha ou módulo
  - Campo de motivo
  - Associação opcional a fase do roadmap
- Ordenação por drag-and-drop
- Exclusão individual

**Interface:**
```
┌─────────────────────────────────────────────────┐
│ Conteúdos Liberados para [Equipe]               │
├─────────────────────────────────────────────────┤
│ + Adicionar Conteúdo                            │
├─────────────────────────────────────────────────┤
│ 📚 Fundamentos de Automação        │ Diagnóstico │
│ 📚 Comunicação com IA              │ Fase 1      │
│ 📦 Módulo: Prompts Básicos         │ Manual      │
└─────────────────────────────────────────────────┘
```

### 2.5 Aba Roadmap

- Visualização do roadmap de 12 semanas da equipe
- Edição de fases (semana início/fim, status)
- Vinculação de conteúdos por fase

### 2.6 Aba Análises IA

**Dados exibidos:**
- Insights do diagnóstico consolidado
- Processos com maior potencial de economia
- Recomendações de conteúdo baseadas nos gargalos
- Métricas de progresso da equipe

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/skills/SkillsTrilhas.tsx` | Página de trilhas direcionadas |
| `src/pages/admin/mentoria/MentoriaSkillsPage.tsx` | Página admin Skills |
| `src/hooks/useSkillsTrilhas.ts` | Hook para buscar conteúdos da equipe |
| `src/hooks/admin/useConteudosSkillsAdmin.ts` | Hook admin para gerenciar conteúdos |
| `src/components/admin/skills/EquipesSkillsTab.tsx` | Aba equipes |
| `src/components/admin/skills/DiagnosticosSkillsTab.tsx` | Aba diagnósticos |
| `src/components/admin/skills/ConteudosSkillsTab.tsx` | Aba liberação conteúdos |
| `src/components/admin/skills/RoadmapSkillsTab.tsx` | Aba roadmap |
| `src/components/admin/skills/AnalisesIASkillsTab.tsx` | Aba análises IA |
| `src/components/admin/skills/ConteudoLiberacaoModal.tsx` | Modal adicionar conteúdo |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas `/skills/trilhas` e `/admin/mentoria/skills` |
| `src/components/admin/AdminSidebar.tsx` | Adicionar link "Skills" no grupo Mentoria |
| `src/components/layout/AppSidebar.tsx` | Garantir que `trilhas_skills` apareça no ambiente Skills |

---

## Migrations de Banco

### Migration 1: Tabela de conteúdos liberados

```sql
-- Criar tabela de conteúdos liberados por equipe Skills
CREATE TABLE public.conteudos_liberados_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes_skills(id) ON DELETE CASCADE,
  trilha_id uuid REFERENCES public.trilhas(id) ON DELETE CASCADE,
  modulo_id uuid REFERENCES public.modulos(id) ON DELETE CASCADE,
  liberado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  motivo text DEFAULT 'manual',
  fase_roadmap_id uuid REFERENCES public.roadmap_skills(id) ON DELETE SET NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT check_trilha_ou_modulo CHECK (
    (trilha_id IS NOT NULL AND modulo_id IS NULL) OR 
    (trilha_id IS NULL AND modulo_id IS NOT NULL)
  )
);

-- Índices
CREATE INDEX idx_conteudos_liberados_skills_equipe ON public.conteudos_liberados_skills(equipe_id);
CREATE INDEX idx_conteudos_liberados_skills_trilha ON public.conteudos_liberados_skills(trilha_id);
CREATE INDEX idx_conteudos_liberados_skills_modulo ON public.conteudos_liberados_skills(modulo_id);

-- RLS
ALTER TABLE public.conteudos_liberados_skills ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Membros podem ver conteúdos da sua equipe" ON public.conteudos_liberados_skills
  FOR SELECT USING (
    equipe_id IN (
      SELECT equipe_id FROM public.membros_equipe_skills 
      WHERE user_id = auth.uid() AND status = 'ativo'
    )
  );

CREATE POLICY "Admins podem gerenciar todos os conteúdos" ON public.conteudos_liberados_skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### Migration 2: Menu trilhas_skills

```sql
INSERT INTO public.menu_config (menu_key, label, url, parent_key, planos_permitidos, icon, ordem, tipo, visivel, editavel)
VALUES ('trilhas_skills', 'Trilhas Skills', '/skills/trilhas', 'aprender', ARRAY['skills'], 'BookMarked', 20, 'sidebar', true, true);
```

---

## Fluxo de Uso

### Fluxo Admin
```
1. Admin acessa /admin/mentoria/skills
2. Seleciona equipe na aba "Equipes"
3. Visualiza diagnósticos em "Diagnósticos"
4. Libera conteúdos em "Conteúdos" baseado nos insights
5. Acompanha progresso em "Análises IA"
```

### Fluxo Usuário Skills
```
1. Membro da equipe acessa ambiente Skills
2. Menu "Aprender" > "Trilhas Skills"
3. Visualiza conteúdos liberados para sua equipe
4. Consome conteúdo conforme roadmap/prioridade
```

---

## Diagrama de Relacionamentos

```
┌──────────────────┐     ┌────────────────────────────┐
│  equipes_skills  │────▶│ conteudos_liberados_skills │
└──────────────────┘     └────────────────────────────┘
         │                          │
         │                          ├────▶ trilhas
         │                          │
         ▼                          └────▶ modulos
┌──────────────────┐
│ roadmap_skills   │◀────────────────────────┘
└──────────────────┘      (fase_roadmap_id)
```

---

## Próximos Passos (Fora deste escopo)

1. **IA para recomendação automática** - baseada nos diagnósticos, sugerir trilhas
2. **Notificações** - avisar membros quando novo conteúdo for liberado
3. **Métricas de consumo** - tracking de progresso por membro
4. **Certificação** - emissão após conclusão de trilha

