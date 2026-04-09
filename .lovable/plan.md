

# Fix: Carrossel e Layout da página Entregas — conter cards dentro da página

## Problema
Os carrosséis de "Telas do Sistema" e "Vídeos de Instrução" estão estourando a largura da página. Os cards não ficam contidos dentro das dimensões da tela e as setas de navegação não controlam a rolagem corretamente. A página toda fica desproporcional.

## Causa raiz
O container pai (`div.p-4.md:p-6.space-y-8`) não tem `overflow-hidden`, então o conteúdo dos carrosséis vaza para fora. Além disso, os cards com `flex-none` e larguras fixas podem ultrapassar o viewport quando o Embla não inicializa corretamente (ex: no empty state onde o ref é compartilhado condicionalmente).

## Solução

**Arquivo**: `src/pages/MeuSistemaEntregas.tsx`

### 1. Container principal com overflow controlado
Adicionar `overflow-hidden` ao wrapper principal da página para impedir qualquer vazamento horizontal.

### 2. Cada seção de carrossel com overflow-hidden explícito
Garantir que cada `<section>` de carrossel tenha `overflow-hidden` no nível da seção, não apenas no div interno do Embla.

### 3. Separar refs do empty state
O problema principal: quando `telas.length === 0`, o `emblaRef` é atribuído ao div do empty state. Mas como o empty state tem `opacity-50` e cards sem interação, o Embla pode não inicializar corretamente. Solução: criar refs dedicados para os empty states OU remover o ref do Embla dos empty states e usar CSS puro (`overflow-x: auto` com `scrollbar-hide` ou simplesmente mostrar apenas 3 cards visíveis com `overflow-hidden` e sem scroll).

**Abordagem escolhida**: Manter o Embla nos empty states mas garantir que:
- O wrapper da seção tenha `overflow-hidden`
- Os cards usem `min-w-0` para permitir encolhimento
- O container principal da página tenha `overflow-x-hidden`

### Mudanças concretas

**Linha 76**: `<div className="p-4 md:p-6 space-y-8">` → `<div className="p-4 md:p-6 space-y-8 overflow-hidden">`

**Linha 185 (seção Telas)**: `<section className="space-y-3">` → `<section className="space-y-3 overflow-hidden">`

**Linha 259 (seção Vídeos)**: `<section className="space-y-3">` → `<section className="space-y-3 overflow-hidden">`

**Cards flex-none**: Reduzir larguras fixas para serem mais proporcionais em telas menores, usando `max-w` constraints adicionais.

