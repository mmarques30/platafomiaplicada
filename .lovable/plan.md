

# Corrigir responsividade da página Entregas

## Problema
A classe `max-w-5xl mx-auto` na linha 76 limita a largura do conteúdo a ~1024px e centraliza. Quando o menu lateral é ocultado, o conteúdo não expande para ocupar o espaço disponível.

## Solução
Remover `max-w-5xl mx-auto` do container principal, deixando o conteúdo ocupar 100% do espaço disponível (já controlado pelo layout pai `SidebarInset`).

**Arquivo:** `src/pages/MeuSistemaEntregas.tsx` (linha 76)
- De: `<div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">`
- Para: `<div className="p-4 md:p-6 space-y-8">`

