

# Mover Reports para sub-aba de Documentos

## Resumo
Remover o `BusinessReportsCard` da grid de Visão Geral e adicioná-lo como uma terceira aba ("Reports") na página `/mentoria/documentos`.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx` | Editar — remover `BusinessReportsCard`, ROI chart ocupa largura total |
| `src/pages/MentoriaDocumentos.tsx` | Editar — adicionar aba "Reports" com o conteúdo do `BusinessReportsCard` |

## Detalhes técnicos

### BusinessVisaoGeralGrid.tsx
- Remover import de `BusinessReportsCard`
- Linha 2 (ROI + Reports): substituir grid 2/3 + 1/3 por `BusinessROIChart` em largura total (sem grid)

### MentoriaDocumentos.tsx
- Import `BusinessReportsCard`
- Adicionar terceira `TabsTrigger` "Reports" com ícone `FileText` após "Links Importantes"
- Adicionar `TabsContent value="reports"` renderizando `<BusinessReportsCard />`

