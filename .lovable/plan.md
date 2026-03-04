

# Remover icones dos titulos de secao

## Alteracoes

### 3 arquivos editados

1. **`src/components/meu-sistema/TimelineEtapas.tsx`** (linha 74-77)
   - Remover icone `Map` do titulo "RoadMap"
   - Manter `<h2>` com `text-lg font-semibold`

2. **`src/components/meu-sistema/ProximosPassosCard.tsx`** (linha 97-99)
   - Remover icone `ListTodo` do titulo "Proximos Passos"

3. **`src/components/meu-sistema/EntregasConcluidasCard.tsx`** (linha 15-16)
   - Remover icone `CheckCircle2` do titulo "Entregas Concluidas"

### O que permanece com icone
- Titulo principal da pagina (`PageTitle` com icone `Monitor`)
- Cards de overview (Progresso, Fase Atual, etc.)
- Icones internos dos cards (datas, status, etc.)

