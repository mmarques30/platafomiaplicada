

# Corrigir: Mostrar estrutura visual mesmo sem dados

## Problema

As seções "Telas do Sistema" e "Vídeos de Instrução" só mostram o carrossel e o Lens quando há dados (`length > 0`). Sem dados, exibem apenas um card vazio com texto. O usuário quer ver a estrutura/UX implementada.

## Solução

Alterar os empty states para mostrar **placeholders visuais** que demonstrem a estrutura real:

### Telas do Sistema (empty state)
- Mostrar 3 cards placeholder no carrossel Embla com aspect-video, ícone Monitor centralizado, e barra de título na parte inferior com texto "Tela de exemplo"
- Manter setas de navegação visíveis
- Aplicar `opacity-50` nos placeholders para indicar que são exemplos

### Vídeos de Instrução (empty state)
- Mostrar 3 cards placeholder no grid com o componente `Lens` envolvendo um placeholder com ícone Play
- Incluir título "Vídeo de exemplo" no CardContent abaixo
- Aplicar `opacity-50` para indicar exemplos

### Arquivo
- **Editar:** `src/pages/MeuSistemaEntregas.tsx` — substituir os empty states simples por placeholders visuais que demonstrem a estrutura do carrossel e do grid com Lens

