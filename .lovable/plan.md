

# Adicionar paginação à tabela do Monitor de Onboarding

## Resumo
Paginar a tabela de usuários (20 por página) sem afetar KPIs nem funil, que continuam calculados sobre o total.

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/pages/admin/OnboardingMonitor.tsx` | Editar |

## Detalhes

1. **State**: adicionar `const [pagina, setPagina] = useState(1)` e `const POR_PAGINA = 20` no componente (após linha 166)

2. **Reset ao mudar filtro**: `useEffect(() => setPagina(1), [filter])` — adicionar `useEffect` ao import (linha 1)

3. **Slice**: antes do JSX da tabela, calcular:
   ```tsx
   const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
   const usuariosPagina = filtered.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
   ```

4. **Tabela**: linha 330, trocar `filtered.map(...)` por `usuariosPagina.map(...)`

5. **Controles**: após o `</div>` que fecha `tableContainer` (linha 390), antes do `</Card>` (linha 391), inserir bloco de paginação com contagem ("X–Y de Z usuários"), botões "← Anterior" / "Próxima →", com disabled+opacity quando na primeira/última página. Estilo inline conforme especificação do usuário.

