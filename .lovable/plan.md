

# Instruções dinâmicas por IA nas Entregas Skills

Atualmente, o campo `instrucoes` em `entregas_skills` e gerado uma unica vez pela IA (na funcao `gerar-entregas-skills`) e exibido como texto estatico e somente-leitura no modal de edicao. O objetivo e tornar esse campo **regeneravel por IA** sempre que o usuario desejar, especialmente apos editar titulo ou descricao da entrega.

## Alteracoes

### 1. Nova edge function: `regenerar-instrucoes-entrega`

Criar uma funcao backend simples que recebe o contexto da entrega (titulo, descricao, projeto vinculado) e retorna novas instrucoes geradas por IA.

- Modelo: `google/gemini-2.5-flash` (mesmo usado na geracao original)
- Input: titulo da entrega, descricao, titulo do projeto vinculado
- Output: texto com passo a passo atualizado
- Usa `LOVABLE_API_KEY` (ja configurada)

### 2. Alterar `EntregaSkillsEditModal.tsx`

No modal de edicao, o bloco de instrucoes deixa de ser texto estatico e passa a ter:

- Campo `Textarea` editavel com as instrucoes atuais (permitindo edicao manual)
- Botao "Regenerar com IA" ao lado do label, que chama a edge function e atualiza o campo
- Estado de loading enquanto a IA processa
- As instrucoes editadas (manual ou por IA) sao salvas junto com os demais campos ao clicar "Salvar"

```
+-------------------------------------+
| Instrucoes               [Regenerar]|
| +----------------------------------+|
| | 1. Passo gerado pela IA...       ||
| | 2. Segundo passo...              ||
| | (editavel pelo usuario)          ||
| +----------------------------------+|
+-------------------------------------+
```

### 3. Atualizar hook `useSkillsEntregas`

Adicionar `instrucoes` ao objeto `dados` aceito pela mutation `atualizarEntrega`, para que o campo seja salvo no banco quando editado.

## Detalhes tecnicos

| Componente | Alteracao |
|---|---|
| `supabase/functions/regenerar-instrucoes-entrega/index.ts` | Nova edge function - recebe titulo, descricao, projeto_titulo e retorna instrucoes atualizadas via IA |
| `src/components/skills/EntregaSkillsEditModal.tsx` | Campo instrucoes vira Textarea editavel + botao "Regenerar com IA" |
| `src/hooks/useSkillsEntregas.ts` | Incluir `instrucoes` no tipo de `dados` da mutation `atualizarEntrega` |

### Fluxo

1. Usuario abre modal de edicao de uma entrega
2. Instrucoes aparecem em Textarea editavel (pode editar manualmente)
3. Se clicar "Regenerar com IA", a edge function e chamada com titulo + descricao atuais
4. O campo e preenchido com o novo texto gerado
5. Ao salvar, instrucoes sao persistidas no banco junto com os demais campos

