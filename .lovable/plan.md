
Objetivo (o que você pediu)
- O item “Cupons” na sidebar ainda está “branco/apagado”.
- Ajustar definitivamente o estilo para:
  - Estado normal: texto (e ícone) verde da marca.
  - Estado ativo (depois de clicar / na página /cupons): texto preto em fundo verde.

Diagnóstico (por que não resolveu antes)
- Hoje o “Cupons” está dentro de `<SidebarMenuButton asChild>`.
- O `SidebarMenuButton` injeta classes padrão (hover/active/bg/text) via Radix Slot e pode sobrescrever/competir com as classes do `NavLink`, deixando o estilo inconsistente (especialmente cor de fundo).
- Resultado: mesmo forçando `!text-white` e `!bg-...`, o comportamento pode continuar “quebrando” dependendo da ordem de merge/estado (hover/active/data-active), e o botão continua parecendo “branco”.

Solução definitiva (mais robusta)
- Remover o `SidebarMenuButton` do item “Cupons” e renderizar o `NavLink` direto dentro do `SidebarMenuItem`.
- Assim, não há mais “briga” de estilos: o `NavLink` passa a ser 100% responsável pelo visual.
- Replicar apenas as classes essenciais de layout do sidebar (flex, padding, arredondado) e manter o comportamento de colapso (ícone sozinho quando a sidebar estiver fechada).

Implementação (o que será alterado)
Arquivo: `src/components/layout/AppSidebar.tsx`

1) Localizar o bloco:
- `/* Menu Cupons - Apenas visitantes (após Comunidade) */`

2) Substituir o trecho atual:
- Remover:
  - `<SidebarMenuButton asChild ...>`
  - e manter apenas:
    - `<SidebarMenuItem> + <NavLink>`

3) Novo estilo (regras)
- Estado normal (não ativo):
  - `bg-transparent` (sem fundo)
  - `text-aplicada-green-700` (texto/ícone verde)
  - hover opcional: `hover:bg-aplicada-green-700/10` (fundo leve só ao passar o mouse)
- Estado ativo (quando estiver em /cupons):
  - `bg-aplicada-green-700` (fundo verde)
  - `text-black` (texto/ícone preto)
- Mantém “Cupons” escondido quando a sidebar estiver colapsada (apenas ícone), como já acontece hoje usando `collapsed`.

4) Detalhe importante para o modo colapsado (mini sidebar)
- Adicionar as classes de comportamento do sidebar no `NavLink`:
  - `group-data-[collapsible=icon]:!size-8`
  - `group-data-[collapsible=icon]:!p-2`
- Isso garante que o item se comporte igual aos demais quando a sidebar estiver fechada.

Checklist de validação (como confirmar que ficou certo)
1) Na rota “/” (visitante):
- “Cupons” deve aparecer com texto verde (não branco).
2) Ao clicar em “Cupons”:
- Navega para `/cupons`
- O item “Cupons” fica com fundo verde e texto preto (ativo).
3) Ao sair de `/cupons`:
- Volta ao estado normal (texto verde, sem fundo).
4) Testar com sidebar aberta e colapsada:
- Aberta: mostra ícone + “Cupons”
- Colapsada: mostra apenas o ícone (cor correta conforme ativo/inativo)

Arquivos a serem alterados
- `src/components/layout/AppSidebar.tsx` (apenas o item “Cupons” do visitante)
