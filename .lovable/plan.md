

# Proximos Passos - Card responsivo com modal de detalhes

## Alteracoes

### 1. `src/components/meu-sistema/ProximosPassosCard.tsx`
- Limitar exibicao a 5 itens (atualmente 6)
- Adicionar botao "Ver todos" no rodape do card quando houver mais de 5 pendentes
- Cada item clicavel: ao clicar abre Dialog com detalhamento da entrega (titulo, descricao, modulo, status, prioridade, prazo)
- Botao "Ver todos" abre Dialog com lista completa de todos os pendentes, cada um tambem clicavel para ver detalhes

### Estrutura
- Estado `selectedEntrega` para controlar dialog de detalhe individual
- Estado `showAll` para controlar dialog de lista completa
- Dialog de detalhe: titulo, descricao, modulo, status badge, prioridade badge, prazo
- Dialog de lista: todos os pendentes listados, clicaveis para abrir detalhe
- Cursor pointer nos itens para indicar clicabilidade

Apenas 1 arquivo editado.

