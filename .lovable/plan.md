

# Telas do Sistema — Formato imagem clean com título sobre a imagem

## Mudança

Remover a barra de título separada na parte inferior dos cards de "Telas do Sistema". O título deve aparecer **sobre a imagem** com um gradiente sutil, sempre visível, sem descrição abaixo.

### Cards com dados (lines 211-221)
- Remover o overlay de hover separado (lines 211-217) e a barra inferior (lines 218-221)
- Substituir por um único gradiente `from-black/60 to-transparent` sempre visível na parte inferior, com o título em branco sobre ele
- Sem descrição

### Cards placeholder (lines 237-239)
- Mesmo tratamento: título sobre a imagem com gradiente, sem barra separada

### Dialog de tela (lines 340-360 aprox)
- Remover a exibição de `descricao` no dialog também, manter apenas imagem + botão de acesso

## Arquivo
- **Editar:** `src/pages/MeuSistemaEntregas.tsx`

