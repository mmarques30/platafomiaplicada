

# Mostrar mais cards de Telas e Vídeos em tela

## Problema
Os cards de Telas (`w-[300px] md:w-[360px]`) e Vídeos (`w-[280px] md:w-[320px]`) são largos demais, cabendo poucos em tela. A imagem de referência mostra ~3 cards visíveis com mais espaço aproveitado.

## Solução
Reduzir a largura fixa dos cards para caber mais itens no carrossel:

### `src/pages/MeuSistemaEntregas.tsx`

**Telas do Sistema (linhas 206, 240):**
- De: `w-[300px] md:w-[360px]`
- Para: `w-[240px] md:w-[300px] lg:w-[340px]`

**Vídeos de Instrução (linhas 280, 340):**
- De: `w-[280px] md:w-[320px]`
- Para: `w-[220px] md:w-[280px] lg:w-[320px]`

Isso permite ~4-5 cards visíveis em telas largas (quando sidebar oculto) vs os ~3 atuais.

