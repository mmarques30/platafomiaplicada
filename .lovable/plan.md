

# Auto-preencher campo "Ordem" ao adicionar conteudo

## Problema
Ao criar novos itens (trilhas, modulos, videos, prompts da biblioteca), o campo "ordem" inicia em 0, exigindo preenchimento manual e causando conflitos de ordenacao.

## Solucao
Calcular automaticamente a proxima ordem disponivel ao abrir o modal de criacao, consultando o maior valor atual e somando 1.

## Mudancas

### 1. Videos (`VideoModal.tsx`)
- Ao abrir modal para criar (sem `video`), buscar `max(ordem)` dos videos do mesmo modulo selecionado
- Preencher o campo ordem com `maxOrdem + 1`
- Atualizar quando o modulo mudar no select

### 2. Trilhas (`TrilhaModal.tsx`)
- Ao abrir modal para criar (sem `trilha`), buscar `max(ordem)` de todas as trilhas
- Preencher o campo ordem com `maxOrdem + 1`

### 3. Modulos (`ModuloModal.tsx`)
- Ao abrir modal para criar (sem `modulo`), buscar `max(ordem)` dos modulos da trilha selecionada
- Preencher o campo ordem com `maxOrdem + 1`
- Atualizar quando a trilha mudar no select

### 4. Biblioteca de Prompts (`useBibliotecas.tsx` / modal de prompts)
- `biblioteca_prompts` tem coluna `ordem` - aplicar a mesma logica: buscar max e preencher +1 antes do insert

## Detalhes Tecnicos

### Hook utilitario `useNextOrdem`
Criar um hook generico reutilizavel (ja existe um similar em `useConteudosDashboardAdmin.tsx`):

```text
function useNextOrdem(tabela, filtro?)
  -> query: SELECT ordem FROM tabela [WHERE filtro] ORDER BY ordem DESC LIMIT 1
  -> retorna (maxOrdem ?? 0) + 1
```

### Arquivos modificados
1. `src/components/admin/content/VideoModal.tsx` - buscar max ordem do modulo ao criar, e ao trocar modulo
2. `src/components/admin/content/TrilhaModal.tsx` - buscar max ordem global ao criar
3. `src/components/admin/content/ModuloModal.tsx` - buscar max ordem da trilha ao criar, e ao trocar trilha
4. `src/hooks/admin/useContent.tsx` - adicionar hooks `useNextVideoOrdem(moduloId)`, `useNextTrilhaOrdem()`, `useNextModuloOrdem(trilhaId)`

### Tabelas sem coluna `ordem`
- `ferramentas_ia`, `ia_copie_use`, `metodos_aplicar` nao possuem coluna `ordem` no banco, portanto nao serao alteradas neste escopo

