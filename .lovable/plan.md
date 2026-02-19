

# Adicionar alternancia entre visao Cards e Tabela na pagina IA Copie e Use

## O que sera feito

Adicionar dois botoes de alternancia (Cards / Tabela) ao lado dos filtros existentes, permitindo trocar a visualizacao dos itens entre o layout de cards atual e uma visao de tabela usando o componente `IACopieUseRow` que ja existe no projeto.

## Alteracoes

### Arquivo: `src/pages/IACopieUse.tsx`

1. Importar os icones `LayoutGrid` e `List` do lucide-react para os botoes de alternancia
2. Importar o componente `IACopieUseRow` ja existente
3. Adicionar estado `viewMode` (`"cards"` ou `"tabela"`)
4. Adicionar botoes de alternancia ao lado do contador de resultados (ou junto aos filtros)
5. Renderizar condicionalmente:
   - Quando `viewMode === "cards"`: manter o grid de cards atual
   - Quando `viewMode === "tabela"`: renderizar os itens usando `IACopieUseRow` dentro de um container com borda arredondada

### Detalhes tecnicos

- Estado: `const [viewMode, setViewMode] = useState<"cards" | "tabela">("cards");`
- Botoes usando `Button` com `variant="outline"` ou `variant="ghost"`, destacando o ativo com `variant="default"`
- Na visao tabela, os itens serao renderizados dentro de um `Card` com `IACopieUseRow` para cada item, reaproveitando o componente ja existente
- A paginacao "Ver mais" continua funcionando em ambas as visoes
- Os skeletons de loading tambem se adaptam a visao selecionada

