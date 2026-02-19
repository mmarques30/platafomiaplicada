

# Reestruturar pagina Aprender > Trilhas

## Problema atual
A pagina `/trilhas` tem duas secoes redundantes:
1. **UltimosConteudos** -- mostra 3 carrosseis com videos recentes agrupados por trilha
2. **TodasAsTrilhas** -- mostra grade com todas as trilhas

O usuario ve videos E trilhas na mesma pagina, criando confusao. Ao clicar numa trilha, vai para `/trilhas/:id` que mostra o TrilhaOverview (outro carrossel de videos) e depois o player.

## Nova estrutura

A pagina `/trilhas` mostra **somente as trilhas** (cards visuais) como ponto de entrada. Ao clicar em uma trilha, o usuario navega para `/trilhas/:id` onde ve os videos/modulos daquela trilha (comportamento que ja existe via TrilhaOverview + player).

### O que muda na pagina `/trilhas`

**Remover**: componente `UltimosConteudos` (carrosseis de videos recentes)

**Manter e promover**: componente `TodasAsTrilhas` como conteudo principal da pagina, sem header duplicado "Todas as Trilhas" -- usar o PageTitle existente como titulo unico

### Resultado visual

```text
+------------------------------------------+
|  Trilhas de Aprendizado     [filtros]    |
+------------------------------------------+
|                                          |
|  [Card Trilha 1]  [Card Trilha 2]       |
|  [Card Trilha 3]  [Card Trilha 4]       |
|  [Card Trilha 5]                        |
|                                          |
+------------------------------------------+
```

Ao clicar em qualquer card -> navega para `/trilhas/:id` -> ve o TrilhaOverview com videos da trilha (ja funciona assim hoje).

## Detalhes tecnicos

### Arquivo: `src/pages/Trilhas.tsx`
- Remover import e uso de `UltimosConteudos`
- Remover o bloco de loading com skeletons que protegia o UltimosConteudos
- Manter `PageTitle` como titulo da pagina
- Colocar `TodasAsTrilhas` diretamente abaixo do titulo, sem `mt-10` extra

### Arquivo: `src/components/dashboard/TodasAsTrilhas.tsx`
- Remover o header interno "Todas as Trilhas" com icone `SlidersHorizontal` (o titulo ja vem do PageTitle da pagina)
- Mover os filtros (ordenar + categoria) para ficarem logo abaixo do PageTitle, alinhados a direita
- Manter toda a logica de query, filtros e grid sem alteracao

### Arquivos que NAO mudam
- `TrilhaCard.tsx` -- card visual preservado
- `TrilhaDetalhes.tsx` -- pagina de detalhe da trilha preservada
- `TrilhaOverview.tsx` -- overview com videos preservada
- `TrilhaCarousel.tsx` -- pode continuar existindo para outros usos
- `UltimosConteudos.tsx` -- arquivo mantido (pode ser usado em outras paginas), apenas removido desta pagina

