

# Plano: Ocultar EnvironmentSwitcher Durante Simulação

## Diagnóstico

Analisando a imagem e o código, identifiquei que há **dois componentes distintos** exibindo informações simultâneas:

| Componente | Propósito | No Screenshot |
|------------|-----------|---------------|
| `EnvironmentSwitcher` | Mostra/alterna o ambiente do usuário logado | Badge "Skills" |
| `AdminViewSelector` | Permite admin simular como outro usuário | Dropdown "Business" |

Ambos são exibidos porque:
- Linha 226: `<EnvironmentSwitcher />` sempre renderiza
- Linha 227: `{isAdmin && <AdminViewSelector isAdmin={isAdmin} />}` renderiza para admins

**Problema**: Quando admin está simulando, o `EnvironmentSwitcher` mostra o ambiente do admin (Skills), mas deveria mostrar o do usuário simulado ou ser ocultado.

## Solução

Durante uma simulação ativa (`isViewingAs`), **ocultar o `EnvironmentSwitcher`** pois:
1. O ambiente simulado é determinado pelo plano do usuário selecionado
2. O banner amarelo já indica claramente qual plano está sendo simulado
3. Exibir dois indicadores de ambiente causa confusão

## Alteração

**Arquivo:** `src/components/layout/TopHeader.tsx`

**Linha 226** - Adicionar condição para ocultar durante simulação:

```tsx
// Antes:
<EnvironmentSwitcher />

// Depois:
{!(isAdmin && isViewingAs) && <EnvironmentSwitcher />}
```

## Resultado

- **Sem simulação ativa**: Admin vê seu `EnvironmentSwitcher` normalmente + botão "Ver como..."
- **Com simulação ativa**: Admin vê apenas o banner amarelo no topo + dropdown amarelo do `AdminViewSelector`

Apenas UMA indicação de ambiente/plano será visível por vez.

