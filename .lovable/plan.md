

# Correção: Adicionar suporte a .html/.htm nos uploads de documentos e recursos

## Problema

Vários componentes de upload no Business não aceitam arquivos `.html`/`.htm` no atributo `accept` do input de arquivo. O `DocumentosUploadSection` já foi corrigido, mas os seguintes ainda não aceitam HTML:

| Componente | Arquivo | Accept Atual |
|------------|---------|-------------|
| RecursoUploadModal | `RecursoUploadModal.tsx` (linha 131) | `.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp` |
| DocumentosBusinessManager | `DocumentosBusinessManager.tsx` (linha 246) | `.pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt` |
| ProcessosMapeadosManager | `ProcessosMapeadosManager.tsx` (linha 330) | `.pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt` |

## Solução

Adicionar `.html,.htm` ao atributo `accept` desses 3 componentes.

