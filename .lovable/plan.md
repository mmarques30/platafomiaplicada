

# Ajustar botão CTA do WelcomeHeader

## Alteração

**Arquivo**: `src/components/dashboard/WelcomeHeader.tsx` (linhas 261-277)

Mudar o estilo do botão de `background: "#AFC040"` para usar a cor `primary` do tema (mesma do ícone do calendário), e manter o `marginLeft: "auto"` para alinhar à direita junto ao calendário.

### Mudança no botão (linha 261-277):
- `background: "#AFC040"` → `background: "hsl(var(--primary))"`
- `color: "#0C0F0A"` → `color: "hsl(var(--primary-foreground))"`
- Manter todo o resto igual (marginLeft auto, borderRadius, padding, etc.)

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editado — cor do botão CTA |

