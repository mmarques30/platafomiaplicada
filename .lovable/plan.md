

# Corrigir layout da pagina de detalhe de etapa

## Problema
A pagina `MeuSistemaEtapaDetalhe.tsx` usa `max-w-3xl` (linha 72), limitando o conteudo a ~768px e deixando um grande espaco vazio a direita.

## Solucao
1. Trocar `max-w-3xl` por `max-w-5xl` para que o conteudo ocupe mais largura da tela
2. Garantir que os cards internos (Projecao de Execucao, Impacto e Necessidade, Entregas Previstas) usem a largura total disponivel

1 arquivo editado: `src/pages/MeuSistemaEtapaDetalhe.tsx` - apenas ajuste de classe CSS no container principal.

