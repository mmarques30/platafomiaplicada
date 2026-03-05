

# Remover ícones dos títulos na página de detalhe da fase

## Alterações em `src/pages/MeuSistemaEtapaDetalhe.tsx`

Remover os ícones `Target`, `TrendingUp`, `Zap` e `Package` que aparecem antes dos títulos das seções:

1. **Linha 108-110**: "Sobre esta Fase" — remover `<Target className="h-4 w-4 text-primary" />`
2. **Linha 122-124**: "Projeção de Execução" — remover `<TrendingUp className="h-4 w-4 text-primary" />`
3. **Linha 171-173**: "Impacto e Necessidade" — remover `<Zap className="h-4 w-4 text-primary" />`
4. **Linha 194-196**: "Entregas Previstas" — remover `<Package className="h-4 w-4 text-primary" />`

Também limpar os imports não utilizados (`Target`, `TrendingUp`, `Zap`, `Package`) da linha 9.

**1 arquivo editado.**

