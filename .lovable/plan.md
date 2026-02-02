
# Plano: Corrigir Visibilidade do Botão Cupons na Sidebar

## Problema Identificado
O botão "Cupons" na sidebar está invisível porque está usando `bg-primary text-primary-foreground`, mas essas cores não estão criando contraste adequado no contexto da sidebar.

## Solução Proposta
Alterar o estilo do botão "Cupons" para usar cores com melhor contraste e alinhadas à marca:

### Mudanças no Arquivo
**`src/components/layout/AppSidebar.tsx`** (linhas 443-447)

**De:**
```tsx
"bg-primary text-primary-foreground hover:bg-primary/90",
```

**Para:**
```tsx
"bg-aplicada-green-700 text-white hover:bg-aplicada-green-800",
```

### Resultado Esperado
- Fundo verde da marca (#9EB038 - `aplicada-green-700`)
- Texto branco para máximo contraste
- Hover com verde mais escuro (#889C2D - `aplicada-green-800`)
- Botão claramente visível abaixo do menu "Comunidade"

### Cores Utilizadas
| Elemento | Cor | Código |
|----------|-----|--------|
| Fundo | aplicada-green-700 | #9EB038 |
| Texto | white | #FFFFFF |
| Hover | aplicada-green-800 | #889C2D |
