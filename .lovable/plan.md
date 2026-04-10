

# Remover `readOnly` das seções de Arquivos e Anotações no Business Parceria

## Problema

Na página de Documentos do Business Parceria (`MentoriaDocumentos.tsx`), as abas **Arquivos** e **Anotações** estão com a prop `readOnly` ativada, impedindo mentorados de criar, editar ou excluir itens. Isso contradiz a regra de que mentorados possuem autonomia total sobre seus próprios arquivos, notas e links.

A página equivalente do Business Sistemas (`MeuSistemaDocumentos.tsx`) já funciona corretamente — sem `readOnly`.

## Correção

**Arquivo**: `src/pages/MentoriaDocumentos.tsx`

- **Linha 201**: Remover `readOnly` de `<ArquivosProjetoSection contratoId={contrato.id} readOnly />`
- **Linha 205**: Remover `readOnly` de `<NotasProjetoSection contratoId={contrato.id} readOnly />`

Resultado:
```tsx
<ArquivosProjetoSection contratoId={contrato.id} />
<NotasProjetoSection contratoId={contrato.id} />
```

Isso libera criação, edição e exclusão de arquivos e anotações para mentorados do Business Parceria, igualando o comportamento ao Business Sistemas.

