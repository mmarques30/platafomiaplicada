
# Aumentar altura dos cards nas Trilhas de Aprendizado

## Problema
A largura dos cards foi aumentada (de `xl:basis-1/4` para `xl:basis-[28%]`), mas a altura permaneceu igual, deixando os cards desproporcionais.

## Solucao

### Arquivo: `src/components/shared/TrilhaCard.tsx` (linha 19)

Aumentar levemente a altura em cada breakpoint para acompanhar a largura, mantendo a proporcao visual:

| Breakpoint | Antes | Depois |
|---|---|---|
| Mobile | `h-[280px]` | `h-[300px]` |
| sm | `h-[320px]` | `h-[350px]` |
| md+ | `h-[400px]` | `h-[440px]` |

A alteracao e apenas nos valores de altura do container principal do card. A imagem, overlay, badges e demais elementos continuam funcionando normalmente pois usam `h-full`, `inset-0` e posicionamento absoluto.
