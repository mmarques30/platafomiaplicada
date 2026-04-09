
# Adicionar funcionalidade de Links para o cliente em MeuSistemaDocumentos

## Problema
Na página do cliente (`MeuSistemaDocumentos`), a aba Links é somente leitura — o cliente consegue adicionar arquivos e anotações, mas não consegue adicionar links. Falta o botão "Novo Link" e o dialog de criação/edição.

## Solução

**Arquivo**: `src/pages/MeuSistemaDocumentos.tsx`

Adicionar na aba Links a mesma funcionalidade que já existe no painel admin (`DocumentosBusinessManager`):

1. **Botão "Novo Link"** acima da lista de links
2. **Dialog de criação/edição** com campos: Título, URL, Descrição (opcional), Ícone (seletor)
3. **Botões de editar e excluir** em cada card de link (com AlertDialog de confirmação para exclusão)
4. Usar as mutations `createLink`, `updateLink`, `deleteLink` já disponíveis no hook `useLinksBusiness` (que já são importados mas não utilizados)

### Mudanças concretas
- Importar `createLink`, `updateLink`, `deleteLink` do `useLinksBusiness` (atualmente só importa `links` e `isLoading`)
- Adicionar estado local para o dialog e formulário de link
- Adicionar botão "Novo Link" no topo da aba Links
- Adicionar botões de ação (editar, excluir, abrir) em cada card de link
- Adicionar Dialog e AlertDialog para criação/edição/exclusão
- Importar componentes necessários: `Dialog`, `Input`, `Label`, `Select`, `AlertDialog`, `Loader2`, `Plus`, `Edit2`, `Trash2`
