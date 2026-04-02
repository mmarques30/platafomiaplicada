

# Atualizar avatar da MarIAna

## Resumo
Substituir a imagem principal do avatar da assistente IA (MarIAna) pela nova foto enviada, em todos os componentes que a utilizam.

## Ação
1. Copiar `user-uploads://Design_sem_nome_12.png` para `src/assets/mari-avatar-new.png` (substituindo o arquivo existente)

Nenhuma alteração de código necessária — todos os 4 arquivos já importam `@/assets/mari-avatar-new.png`. O fallback `mari-avatar.jpg` permanece inalterado.

