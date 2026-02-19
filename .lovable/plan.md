

# Remover aba Players e card de Premiacao Mensal da Comunidade

## Alteracoes

### 1. Pagina `src/pages/Comunidade.tsx`

- Remover o `TabsTrigger` com `value="players"`
- Remover o `TabsContent` com `value="players"`
- Remover o import de `PlayersList`
- Ajustar o grid de tabs de `grid-cols-4` para `grid-cols-3`

### 2. Sidebar `src/components/comunidade/CommunitySidebar.tsx`

- Remover o card inteiro de "Premiacao Mensal" (bloco com icone Gift)
- Remover o import de `Gift` do lucide-react

Os componentes `PlayersList.tsx` e `PlayerCard.tsx` permanecem no codigo para uso futuro. Nenhuma alteracao no banco de dados.

