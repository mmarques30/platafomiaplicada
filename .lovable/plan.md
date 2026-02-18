
# Entregas vinculadas aos Projetos

## O que sera feito
Adicionar uma secao "Entregas" dentro do modal de detalhes do projeto (`ProjetoDetailModal`), permitindo:
1. Ver entregas ja vinculadas ao projeto (lista compacta com status, responsavel e progresso)
2. Criar nova entrega diretamente pelo projeto (abre o modal `EntregaEquipeModal` com o `projeto_id` pre-preenchido)
3. As entregas criadas aparecem automaticamente na aba Entregas principal, pois usam a mesma tabela `entregas_equipe_skills`

## Fluxo do usuario
1. Abre um projeto no modal de detalhes
2. Na parte inferior, ve a secao "Entregas do Projeto" com a lista das entregas vinculadas
3. Clica em "Nova Entrega" para abrir o modal de entrega com o projeto ja selecionado
4. A entrega salva aparece tanto no projeto quanto na aba Entregas

## Alteracoes tecnicas

### 1. `ProjetoDetailModal.tsx`
- Importar `useEntregasEquipe` e `EntregaEquipeModal`
- Adicionar query para buscar entregas filtradas por `projeto_id = item.id`
- Renderizar lista compacta de entregas (titulo, badge de status, progresso, responsavel)
- Botao "Nova Entrega" que abre o `EntregaEquipeModal` com `projeto_id` pre-definido
- Clicar em uma entrega existente abre o `EntregaEquipeModal` para edicao

### 2. Nenhuma migracao necessaria
A tabela `entregas_equipe_skills` ja possui a coluna `projeto_id` com FK para `backlog_skills`. Nao e necessario alterar o banco.

### 3. Nenhuma alteracao no hook `useEntregasEquipe`
O hook ja suporta upsert com `projeto_id` e filtragem. A query de entregas por projeto sera feita inline no componente.

| Arquivo | Acao |
|---|---|
| `src/components/skills/backlog/ProjetoDetailModal.tsx` | Adicionar secao de entregas com lista, botao de criar e modal de entrega inline |
