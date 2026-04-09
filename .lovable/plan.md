

# Fix: Largura da página Sessões de Mentoria

## Problema

A página `MentoriaSessoes.tsx` usa `container mx-auto max-w-6xl` (linhas 74, 81), limitando a largura a ~1152px e centralizando o conteúdo. As demais páginas do Business Parceria (Entregas, Documentos, Tarefas) usam `p-4 md:p-6` sem `container` nem `max-w`, ocupando toda a largura disponível.

## Solução

**Arquivo**: `src/pages/MentoriaSessoes.tsx`

Substituir o wrapper `container mx-auto max-w-6xl` por `p-4 md:p-6` nas duas ocorrencias (loading state na linha 74 e conteudo principal na linha 81), alinhando com o padrão das demais páginas.

- Linha 74: `container mx-auto py-8 px-4 max-w-6xl` → `p-4 md:p-6`
- Linha 81: `container mx-auto py-8 px-4 max-w-6xl` → `p-4 md:p-6 space-y-6`

