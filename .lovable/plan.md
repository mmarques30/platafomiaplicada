
Objetivo
- Corrigir o item “Cupons” na sidebar (anexo 1), que está aparecendo “apagado/invisível” mesmo após a última alteração.
- Ajustar o CTA final (anexo 2) removendo completamente o “card” (borda + fundo), deixando apenas foto + texto.

Diagnóstico (com base no código atual)
1) Botão “Cupons” (sidebar) ainda parece apagado
- Em `src/components/layout/AppSidebar.tsx`, o item “Cupons” está dentro de `<SidebarMenuButton asChild ...>`.
- O componente `SidebarMenuButton` (em `src/components/ui/sidebar.tsx`) injeta classes padrão (hover, active, text colors etc.) via Radix Slot.
- Dependendo da ordem de merge do Slot, essas classes podem sobrescrever `bg-aplicada-green-700 text-white`, resultando em texto cinza e sem fundo (exatamente como o anexo 1).

2) CTA final ainda está como “Card”
- Em `src/pages/Cupons.tsx` o CTA final está literalmente dentro de `<Card className="border-2 ... bg-gradient...">`, o que gera borda e fundo (anexo 2).
- Você pediu para remover o “card ao redor e fundo”, mantendo somente foto + texto.

Mudanças propostas

A) Sidebar: tornar “Cupons” sempre visível e com cor nova
Arquivo: `src/components/layout/AppSidebar.tsx`
- No bloco “Menu Cupons - Apenas visitantes”, ajustar as classes para garantir que:
  - Fundo verde da marca apareça sempre
  - Texto e ícone fiquem brancos
  - Nenhum estilo do `SidebarMenuButton` “ganhe” por cima

Como faremos (abordagem robusta)
- Manter a estrutura atual (NavLink dentro do SidebarMenuButton), mas:
  1) Aplicar classes com Tailwind “important” (`!`) no NavLink para impedir sobrescrita:
     - `!bg-aplicada-green-700 !text-white hover:!bg-aplicada-green-800`
  2) Forçar o ícone a ficar branco (`text-white`) para não herdar cinza.
  3) Ajustar o ring do ativo para combinar com a marca (opcional) e não depender de `primary` se isso estiver causando contraste ruim.
- Resultado esperado: mesmo em “Simulação de visitante”, o item “Cupons” fica claramente verde com texto branco (como um botão/CTA no menu).

B) Página /cupons: remover o Card do CTA final (anexo 2)
Arquivo: `src/pages/Cupons.tsx`
- Substituir o bloco:
  - `<Card ...><CardContent ...> ... </CardContent></Card>`
- Por um `<section>` (ou `<div>`) simples, sem fundo, sem borda:
  - Mantém layout responsivo (coluna no mobile, linha no desktop)
  - Mantém a foto arredondada e o texto exatamente como está (apenas sem “container de card”)
- Ajustes finos:
  - Pode manter apenas um espaçamento/“breathing room” (ex.: `mt-6`, `py-2`) sem cor de fundo.
  - Manter a tipografia e alinhamento (center no mobile / left no desktop), como já está.

Checklist de validação (o que você deve ver após a implementação)
1) Sidebar (anexo 1)
- “Cupons” visível com fundo verde e texto branco, em modo normal e em “Simulação”.
- Hover escurece para verde mais forte.
- Continua clicável e leva para `/cupons`.

2) CTA final (anexo 2)
- Não existe mais borda nem fundo ao redor.
- Apenas foto + texto, com espaçamento bonito.

Arquivos que serão alterados
- `src/components/layout/AppSidebar.tsx` (ajuste definitivo de estilos do item Cupons)
- `src/pages/Cupons.tsx` (remover Card do CTA final e trocar por section/div simples)
