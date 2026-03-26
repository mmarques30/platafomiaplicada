

# Correções: Mobile responsivo + Bibliotecas duplicada no menu

## Problema 1: Layout mobile nao adaptado
A pagina inicial e a pagina de Trilhas nao se adaptam ao mobile. Na tela de Trilhas, o card do carrossel com aspect-ratio 9/16 ocupa a tela inteira verticalmente, e o padding `px-12` das setas do carrossel comprime o conteudo. O header superior tambem tem elementos que nao se ajustam bem.

## Problema 2: Bibliotecas aparece duplicada
"Bibliotecas" aparece como submenu dentro de "Aprender" (vindo do banco com `parent_key = 'aprender'`) E tambem como bloco hardcoded separado logo apos "Aprender" (linhas 366-481 do AppSidebar). Deveria aparecer SOMENTE fora, como grupo independente.

---

## Correcoes

### 1. Carousel de Trilhas - mobile responsivo
**Arquivo: `src/components/dashboard/TodasAsTrilhas.tsx`**

- Reduzir o `px-12` para `px-2 md:px-12` para nao comprimir o carrossel no