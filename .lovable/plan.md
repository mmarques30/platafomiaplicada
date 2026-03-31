

# Corrigir CSS global — strong/b e auditoria de !important

## 1. Restringir `strong, b` à classe `.brand-text`

**Linha 420-423** — substituir:
```css
strong, b {
  font-weight: 600;
  color: hsl(73 54% 39%);
}
```
Por:
```css
strong, b {
  font-weight: 600;
}

.brand-text strong,
.brand-text b {
  color: hsl(73 54% 39%);
}
```

Isso mantém o `font-weight: 600` global (desejável) mas remove a cor de marca de todo `<strong>` e `<b>` — agora só aplica dentro de `.brand-text`.

## 2. Auditoria dos `!important`

### Podem ser removidos com segurança:
Nenhum. Todos os `!important` nas regras `bg-card`, `bg-muted`, `bg-input`, `bg-popover` existem porque Tailwind utility classes geram especificidade igual — sem `!important`, a ordem de compilação do Tailwind pode sobrescrever a cor. Como o projeto não usa dark mode via classe `.dark` para essas regras (usa tokens CSS que mudam automaticamente via `:root` / `.dark`), o `!important` é necessário para garantir que a cor do texto acompanhe o fundo.

### Decisão: manter todos, adicionar comentário explicativo

Adicionar um comentário bloco antes da linha 459:
```css
/* !important necessário: Tailwind utility classes têm especificidade igual;
   sem !important a ordem de compilação pode sobrescrever estas cores de texto
   que precisam acompanhar seus respectivos fundos em ambos os temas. */
```

## Resumo de alterações

| Linha | Alteração |
|---|---|
| 420-423 | Separar `strong, b` — peso global, cor só em `.brand-text` |
| 458 (antes) | Adicionar comentário explicativo sobre `!important` |

## Arquivo editado
- `src/index.css`

