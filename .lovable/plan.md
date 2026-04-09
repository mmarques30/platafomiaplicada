

# Transformar "Minhas Dúvidas" em Painel Estratégico Academy

## Contexto

A página `MinhasDuvidas` (rota `/minhas-duvidas`) hoje é uma central de dúvidas genérica com FAQ estático e lista de tickets. Para o Academy, isso é pouco útil. A proposta é transformá-la num **painel estratégico de acompanhamento** baseado no diagnóstico da IA (`insight_ia` da tabela `formulario_diagnostico`), onde o mentorado:

- Acompanha seus **objetivos do diagnóstico** com status de progresso
- Gerencia **tarefas pessoais** vinculadas a esses objetivos
- Recebe **alertas inteligentes** baseados no conteúdo consumido vs. necessidades do diagnóstico
- Visualiza trilhas e ferramentas recomendadas com progresso real

## Banco de dados

**Migration** — nova tabela para tarefas/metas pessoais do Academy:

```sql
CREATE TABLE public.metas_academy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  descricao text,
  tipo text DEFAULT 'tarefa', -- tarefa, meta, projeto
  status text DEFAULT 'pendente', -- pendente, em_andamento, concluida
  prioridade text DEFAULT 'media', -- baixa, media, alta
  prazo date,
  objetivo_vinculado text, -- referência ao objetivo do insight_ia
  etapa_vinculada integer, -- número da etapa do insight_ia
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.metas_academy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own metas" ON public.metas_academy
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `src/pages/MinhasDuvidas.tsx` | Reescrever completo — painel estratégico |
| `src/hooks/useMetasAcademy.tsx` | Novo — CRUD de metas/tarefas pessoais |
| `src/components/academy/PainelEstrategico.tsx` | Novo — componente principal do painel |
| `src/components/academy/MetaModal.tsx` | Novo — modal criar/editar meta |
| `src/components/academy/AlertasInteligentes.tsx` | Novo — alertas baseados em diagnóstico vs progresso |

## Estrutura da página

### Header
`PageTitle primary="Meu" secondary="Plano"` + subtítulo "Acompanhe seu progresso estratégico baseado no diagnóstico"

### Stat Cards (topo)
4 cards compactos:
- **Objetivos definidos** (contagem do `insight_ia.objetivos`)
- **Tarefas pendentes** (da tabela `metas_academy`)
- **Progresso em trilhas** (% de vídeos concluídos das `trilhas_recomendadas`)
- **Ferramentas exploradas** (contagem de ferramentas usadas vs recomendadas)

### Alertas Inteligentes
Seção condicional que cruza:
- Trilhas recomendadas pelo diagnóstico vs progresso real em `progresso_videos`
- Ferramentas prioritárias vs ferramentas já acessadas
- Prazos de tarefas próximos
- Se está na etapa certa do roadmap baseado no tempo decorrido

Exemplos de alertas:
- "Você completou 3 de 8 vídeos da trilha recomendada 'Fundamentos de IA'"
- "A ferramenta Claude foi recomendada como prioridade 1, explore a seção Arsenal IA"
- "Você tem 2 tarefas vencendo esta semana"

### Tabs
1. **Objetivos** (default) — cards dos objetivos do diagnóstico (curto/médio/longo prazo) com checkbox de progresso manual
2. **Minhas Tarefas** — lista de tarefas pessoais com criação, edição, status, prioridade. Kanban simples (Pendente, Em andamento, Concluída)
3. **Roadmap** — etapas de evolução do diagnóstico com indicador de "você está aqui" baseado no progresso
4. **Dúvidas** — mantém a `AbaDuvidas` existente para quem ainda quiser enviar dúvidas

## Hook useMetasAcademy

```typescript
// CRUD completo na tabela metas_academy
// - listagem filtrada por status
// - createMeta, updateMeta, deleteMeta mutations
// - contagem por status para stat cards
```

## Alertas Inteligentes (lógica)

O componente `AlertasInteligentes` recebe:
- `insight_ia` do diagnóstico (trilhas recomendadas, ferramentas, etapas)
- Progresso real de vídeos (`progresso_videos`)
- Metas pendentes

Cruza os dados e gera até 5 alertas priorizados com ícone, mensagem e CTA (link para trilha, Arsenal IA, ou tarefas).

## Detalhes técnicos

- Rota permanece `/minhas-duvidas` para não quebrar menu_config
- O hook `useMentoriaForm` é reutilizado para puxar o `insight_ia`
- Progresso de trilhas usa query em `progresso_videos` filtrado por `user_id`
- Se o diagnóstico não foi feito, mostra CTA para preencher (redireciona para `/diagnostico/formulario`)
- A aba Dúvidas mantém `AbaDuvidas` original para compatibilidade

