
# Calculadora de ROI por Projeto - Situacao Atual vs. Melhoria

## Objetivo

Adicionar campos ao projeto que registram o **cenario atual** (antes da melhoria): tempo gasto no processo e quem executa (cargo). Esses dados, combinados com a economia estimada ja existente, funcionam como uma calculadora de ROI que permite comparar o **antes** e o **depois** da implementacao do projeto.

## Novos campos no banco de dados

Adicionar 3 colunas na tabela `backlog_skills`:

| Coluna | Tipo | Descricao |
|---|---|---|
| `tempo_atual_horas` | `numeric` | Tempo gasto atualmente no processo (h/semana) |
| `cargo_executor` | `text` | Cargo/funcao de quem executa o processo hoje |
| `custo_hora_executor` | `numeric` | Custo/hora do executor (para calculo financeiro do ROI) |

Com esses campos + `horas_estimadas_economia` (ja existe), o ROI pode ser calculado:
- **Tempo atual**: `tempo_atual_horas` h/semana
- **Tempo apos melhoria**: `tempo_atual_horas - horas_estimadas_economia` h/semana
- **Economia financeira**: `horas_estimadas_economia * custo_hora_executor` por semana
- **ROI anual estimado**: economia semanal * 52

## Alteracoes

### 1. Migracao de banco de dados
Adicionar as 3 colunas na tabela `backlog_skills` com valores default `null`.

### 2. Interface de tipo (`useSkillsBacklog.ts`)
Adicionar os 3 novos campos ao `BacklogItem` interface.

### 3. Modal de criacao (`AddProjetoModal.tsx`)
Adicionar secao "Situacao Atual" com campos:
- Tempo gasto atualmente (h/semana) - input numerico
- Cargo de quem executa - input texto
- Custo/hora do executor (R$) - input numerico

Atualizar a interface `onAdd` para incluir os novos campos. Atualizar a IA para tambem sugerir esses campos.

### 4. Modal de detalhes (`ProjetoDetailModal.tsx`)
Adicionar secao "Calculadora de ROI" entre as Observacoes e as Entregas com:
- Campos editaveis (onBlur auto-save): tempo atual, cargo executor, custo/hora
- Resumo calculado automaticamente:
  - Tempo atual vs. Tempo apos melhoria
  - Economia semanal em horas
  - Economia financeira semanal e anual estimada

### 5. Edge Function `personalizar-projeto-skills`
Adicionar os novos campos ao tool calling da IA para que o "Gerar com IA" tambem sugira tempo atual, cargo e custo/hora com base no titulo do projeto.

## Fluxo do usuario

1. Cria/edita projeto com titulo "Automacao de relatorios financeiros"
2. Preenche (ou IA gera): tempo atual = 10h/semana, cargo = Analista Financeiro, custo/hora = R$ 45
3. Economia estimada = 8h/semana (ja existente)
4. Modal exibe automaticamente:
   - Hoje: 10h/semana (R$ 450/semana)
   - Apos melhoria: 2h/semana (R$ 90/semana)
   - Economia: 8h/semana = R$ 360/semana = R$ 18.720/ano
5. Apos entrega, esses dados sao comparados com os resultados reais das entregas

## Detalhes tecnicos

| Componente | Acao |
|---|---|
| Migracao SQL | `ALTER TABLE backlog_skills ADD COLUMN tempo_atual_horas numeric, ADD COLUMN cargo_executor text, ADD COLUMN custo_hora_executor numeric` |
| `src/hooks/useSkillsBacklog.ts` | Adicionar campos ao `BacklogItem` interface e ao `addItem` mutation |
| `src/components/skills/backlog/AddProjetoModal.tsx` | Adicionar 3 campos + incluir na interface `onAdd` + enviar para IA |
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Adicionar secao "Calculadora de ROI" com campos editaveis e resumo calculado |
| `supabase/functions/personalizar-projeto-skills/index.ts` | Adicionar campos ao tool calling |
