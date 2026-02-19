

# Enriquecer criacao de projetos com IA

## Problema atual
Ao criar um novo projeto, o botao "Gerar com IA" preenche **apenas a descricao**. Os demais campos (Area Impactada, Prioridade, Economia Estimada) precisam ser preenchidos manualmente. Projetos gerados automaticamente pela IA em lote ja vem com todos esses campos preenchidos, criando uma discrepancia.

## Solucao

### 1. Atualizar a Edge Function `personalizar-projeto-skills`

Alterar a funcao para usar **tool calling** em vez de texto livre, retornando um objeto estruturado com todos os campos:

- `descricao` (texto)
- `area_impactada` (texto)
- `prioridade` (p1, p2 ou p3)
- `horas_estimadas_economia` (numero)

A funcao continuara recebendo os mesmos parametros (titulo, area_impactada, descricao_atual), mas agora retornara todos os campos de uma vez.

### 2. Atualizar o `AddProjetoModal.tsx`

No callback `handleGenerateAI`, apos receber a resposta da IA:

- Preencher automaticamente `descricao`, `area`, `prioridade` e `horas` com os valores retornados
- Apenas sobrescrever campos que estejam vazios ou permitir sobrescrita total (a IA preenche tudo de uma vez)
- Todos os campos continuam editaveis apos o preenchimento pela IA — o usuario pode ajustar antes de salvar

### 3. Atualizar o `ProjetoDetailModal.tsx`

O botao "Personalizar com IA" no modal de edicao tambem deve atualizar todos os campos retornados (nao apenas descricao), chamando `onUpdate` para cada campo que a IA retornou.

## Detalhes tecnicos

| Componente | Alteracao |
|---|---|
| `supabase/functions/personalizar-projeto-skills/index.ts` | Trocar prompt de texto livre por tool calling que retorna objeto com `descricao`, `area_impactada`, `prioridade`, `horas_estimadas_economia` |
| `src/components/skills/backlog/AddProjetoModal.tsx` | No `handleGenerateAI`, usar todos os campos retornados para preencher o formulario |
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | No handler de "Personalizar com IA", atualizar todos os campos retornados via `onUpdate` |

## Comportamento esperado

1. Usuario digita apenas o titulo do projeto
2. Clica em "Gerar com IA"
3. Todos os campos do formulario sao preenchidos automaticamente (descricao, area, prioridade, economia)
4. Usuario revisa, ajusta o que quiser e clica em "Adicionar"

