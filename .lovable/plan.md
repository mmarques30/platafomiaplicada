

# Adicionar CRUD de Links na página Documentos do Business Systems

## Problema

Na página `MeuSistemaDocumentos.tsx` (Business Systems), a aba de Links é somente leitura — o mentorado consegue ver os links mas não tem botão para adicionar, editar ou remover. A funcionalidade já existe implementada na página `MentoriaDocumentos.tsx` (Business Parceria).

## Solução

Replicar a mesma lógica de CRUD de links que já funciona em `MentoriaDocumentos.tsx` para `MeuSistemaDocumentos.tsx`.

## Arquivo: `src/pages/MeuSistemaDocumentos.tsx`

Alterações:
1. Importar componentes de Dialog, AlertDialog, Input, Label, Select, toast e ícones (Plus, Edit2, Trash2)
2. Alterar o import do `useLinksBusiness` para incluir `createLink`, `updateLink`, `deleteLink` e o tipo `LinkBusiness`
3. Adicionar states: `linkDialogOpen`, `editingLink`, `linkForm`
4. Adicionar handlers: `handleOpenLinkDialog`, `handleSaveLink`, `handleDeleteLink`
5. Na aba Links: adicionar botão "Novo Link" no topo + botões de editar/remover em cada card de link
6. Adicionar o Dialog de formulário de link (título, URL, descrição, ícone) no final do JSX

Toda a lógica será copiada diretamente do pattern já funcional em `MentoriaDocumentos.tsx`, garantindo consistência entre as duas páginas.

