

# Adicionar etapas do plano ao tour de onboarding

## Problema
O tour atual só cobre itens genéricos (Aprender, Bibliotecas, Calendário, Evolução, MarIAna, Configurações). Faltam etapas para menus específicos do plano como "Meu Progresso" / "Minha Trajetória" / "Meu Projeto", que variam conforme o plano do usuário.

## Solução
Adicionar `data-tour` nos menus específicos do plano no sidebar e incluir steps correspondentes no tour. Como o tour já filtra dinamicamente por elementos presentes no DOM, só aparecerão as etapas relevantes para cada plano.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/AppSidebar.tsx` | Editar — adicionar `data-tour` para `meu_progresso`, `minha_trajetoria`, `meu_projeto` nos NavLinks |
| `src/components/dashboard/DashboardTour.tsx` | Editar — adicionar steps para esses menus |

## Detalhes técnicos

### AppSidebar.tsx
Na lógica de `data-tour` dos NavLinks (linhas 373-376), expandir o mapeamento:

```tsx
data-tour={
  getMenuUrl(menu).includes('calendario') ? 'calendario' :
  getMenuUrl(menu).includes('evolucao') ? 'evolucao' :
  menu.menu_key === 'meu_progresso' ? 'meu-progresso' :
  menu.menu_key === 'minha_trajetoria' ? 'minha-trajetoria' :
  menu.menu_key === 'meu_projeto' ? 'meu-projeto' :
  undefined
}
```

Também no NavLink colapsável (linha 243), adicionar mapeamento similar para menus que usem esse formato.

### DashboardTour.tsx
Adicionar 3 novos steps em `allSteps`, após "Aprender" e antes de "Bibliotecas":

```tsx
{
  target: '[data-tour="meu-progresso"]',
  content: "Aqui você acompanha o progresso do seu plano, metas e evolução na mentoria.",
  title: "Meu Progresso",
  placement: "right",
},
{
  target: '[data-tour="minha-trajetoria"]',
  content: "Visualize sua trajetória completa, marcos alcançados e próximos passos.",
  title: "Minha Trajetória",
  placement: "right",
},
{
  target: '[data-tour="meu-projeto"]',
  content: "Gerencie seu projeto, acompanhe entregas e veja o roadmap de implementação.",
  title: "Meu Projeto",
  placement: "right",
},
```

A filtragem dinâmica existente (`document.querySelector`) garante que apenas os steps cujos menus existem no DOM do plano atual serão exibidos.

