

# Botao de IA para Personalizar Projetos

## O que sera feito
Adicionar um botao "Personalizar com IA" nos modais de criar e editar projetos. Ao clicar, a IA gera automaticamente uma descricao detalhada e uma solucao para o projeto com base no titulo, area impactada e contexto da equipe.

## Fluxo do usuario
1. No modal de **criar projeto**: apos preencher o titulo (obrigatorio), o usuario clica no botao de IA ao lado do campo "Descricao" e a IA gera uma descricao personalizada
2. No modal de **editar projeto** (ProjetoDetailModal): um botao de IA aparece ao lado da descricao para regenerar/personalizar o texto

## Alteracoes

### 1. Nova Edge Function: `personalizar-projeto-skills`
- Recebe: `titulo`, `descricao_atual` (opcional), `area_impactada` (opcional), `contexto_equipe` (opcional)
- Usa Lovable AI Gateway (`google/gemini-3-flash-preview`) para gerar uma descricao clara e objetiva do projeto, incluindo problema, solucao proposta e resultado esperado
- Retorna: `descricao` gerada pela IA

### 2. `AddProjetoModal.tsx`
- Adicionar botao com icone de "varinha magica" (Sparkles) ao lado do label "Descricao"
- Ao clicar, envia o titulo e area para a edge function e preenche o campo descricao com o resultado
- Botao desabilitado se o titulo estiver vazio
- Indicador de loading durante a geracao

### 3. `ProjetoDetailModal.tsx`
- Adicionar botao "Personalizar com IA" abaixo da descricao (quando `onUpdate` esta disponivel, ou seja, modo edicao)
- Ao clicar, envia titulo + descricao atual + area para a IA regenerar
- O resultado atualiza o campo descricao via `onUpdate`
- Loading state no botao durante a geracao

### 4. `supabase/config.toml`
- Registrar a nova funcao `personalizar-projeto-skills` com `verify_jwt = false`

### 5. Correcao de build
- Remover o `bun.lock` corrompido que causa o erro do `mux-embed`

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `supabase/functions/personalizar-projeto-skills/index.ts` | Nova edge function usando Lovable AI Gateway |
| `src/components/skills/backlog/AddProjetoModal.tsx` | Botao IA no campo descricao |
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Botao IA para personalizar descricao existente |
| `supabase/config.toml` | Registrar nova funcao |
| `bun.lock` | Deletar para corrigir build |

