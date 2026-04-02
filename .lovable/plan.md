

# Modo Foco — toggle no TopHeader + CSS global

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/TopHeader.tsx` | Editar — estado `modoFoco`, botão Maximize2/Minimize2 antes do RefreshCw |
| `src/index.css` | Editar — regras `body.modo-foco` no final do arquivo |
| `src/components/dashboard/WelcomeHeader.tsx` | Editar — adicionar `data-welcome-kpis` no container dos KPIs |
| `src/components/dashboard/RankingTicker.tsx` | Editar — adicionar `data-ranking-ticker` no wrapper |
| `src/components/dashboard/NovidadesSemana.tsx` | Editar — adicionar `data-novidades` no wrapper |

## Detalhes técnicos

### TopHeader.tsx
1. Importar `Maximize2`, `Minimize2` do lucide-react
2. Estado `modoFoco` com `sessionStorage` e função `toggleFoco` que alterna classe no `document.body`
3. Inserir botão com Tooltip entre AdminViewSelector/EnvironmentSwitcher e o botão Refresh (linha ~223), com `className="hidden md:flex"` e estilos condicionais conforme especificado

### index.css
Adicionar ao final:
```css
body.modo-foco [data-sidebar] { display: none !important; }
body.modo-foco [data-welcome-kpis] { display: none; }
body.modo-foco [data-ranking-ticker] { display: none; }
body.modo-foco [data-novidades] { display: none; }
body.modo-foco main { max-width: 720px; margin: 0 auto; padding: 0 24px; }
```

### Data attributes
- **WelcomeHeader.tsx**: Localizar o container dos KPIs e adicionar `data-welcome-kpis`
- **RankingTicker.tsx**: Adicionar `data-ranking-ticker` no elemento raiz
- **NovidadesSemana.tsx**: Adicionar `data-novidades` no elemento raiz

Nenhuma outra alteração — rotas, auth, layout base e componentes ocultos permanecem intactos.

