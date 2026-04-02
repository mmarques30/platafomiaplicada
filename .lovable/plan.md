

# Corrigir cor do título no tour de onboarding

## Problema
No react-joyride v3, a propriedade `textColor` nas `options` aplica-se ao corpo do tooltip, mas o título (heading) pode usar uma cor diferente ou herdar uma cor escura padrão, tornando-o ilegível contra o fundo `#1a1c19`.

## Solução
Adicionar estilização explícita via prop `styles` do Joyride para garantir que o título fique branco/claro.

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/DashboardTour.tsx` | Editar — adicionar `styles` com `tooltipTitle: { color: '#ffffff' }` |

## Detalhe técnico

### DashboardTour.tsx
Adicionar prop `styles` ao `<Joyride>` (após `options`):

```tsx
styles={{
  tooltipTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
  },
  tooltipContent: {
    color: '#ffffff',
  },
}}
```

Isso força a cor branca tanto no título quanto no conteúdo, independentemente dos defaults do react-joyride v3.

