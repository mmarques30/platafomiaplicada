

# Corrigir foto da MarIAna no botão flutuante e no chat

## Problema

O botão flutuante e o chat da MarIAna usam `mariana-avatar.png` como fonte principal e `mari-avatar.jpg` como fallback. A imagem pode estar demorando a carregar (arquivo grande) ou falhando silenciosamente, deixando o botão sem foto visível.

## Solução

Trocar a imagem principal para `mari-avatar-new.png` (arquivo mais recente disponível em `src/assets/`) e manter `mari-avatar.jpg` como fallback. Aplicar a troca em todos os arquivos que usam o avatar da MarIAna.

## Alterações

### Arquivos afetados (4 arquivos — mesma alteração em todos)

| Arquivo | Alteração |
|---|---|
| `src/components/shared/MarIAnaFloatingButton.tsx` | Trocar import de `mariana-avatar.png` → `mari-avatar-new.png` |
| `src/components/shared/MarIAnaChatDrawer.tsx` | Trocar import de `mariana-avatar.png` → `mari-avatar-new.png` |
| `src/pages/Chat.tsx` | Trocar import de `mariana-avatar.png` → `mari-avatar-new.png` |
| `src/pages/Cupons.tsx` | Trocar import de `mariana-avatar.png` → `mari-avatar-new.png` |

Cada alteração é uma única linha de import: `import mariAvatar from "@/assets/mari-avatar-new.png";`

Nenhuma outra alteração — layout, fallback, lógica de chat e onError permanecem intactos.

