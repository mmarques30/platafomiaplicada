

# Tour pula etapas quando menus não estão visíveis

## Problema
O react-joyride pula automaticamente steps cujo elemento-alvo (`target`) não existe no DOM. Se o ambiente do usuário oculta "Calendário" ou "Evolução" no sidebar, os steps 3 e 4 simplesmente não aparecem e o tour salta de Bibliotecas direto para MarIAna.

## Solução
Filtrar os steps dinamicamente com base nos menus visíveis no sidebar. Antes de passar o array de steps ao Joyride, verificar quais `data-tour` targets existem no DOM.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/DashboardTour.tsx` | Editar — filtrar steps dinamicamente |

## Detalhe técnico

### DashboardTour.tsx
- Mover `steps` para dentro do componente
- Usar `useMemo` + `useEffect` para filtrar apenas steps cujo `document.querySelector(step.target)` retorna um elemento
- Isso garante que o tour mostre apenas as etapas relevantes para o ambiente atual, sem saltos

```tsx
const visibleSteps = useMemo(() => {
  return allSteps.filter(step => 
    document.querySelector(step.target as string)
  );
}, [run]); // recalcula quando o tour inicia
```

Dessa forma, se o ambiente oculta Calendário e Evolução, o tour mostra: Aprender → Bibliotecas → MarIAna → Configurações, sem saltos.

