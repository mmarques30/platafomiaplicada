
Objetivo
- Fazer o clique em “Sobre” levar para a página nova correta (/sobre), que contém o layout e o carrossel de logos que você pediu, em vez de redirecionar para /aplique.

O que está acontecendo (diagnóstico)
- O seu menu “Sobre” que aparece no topo das páginas públicas (ex.: /auth e /servicos) é renderizado pelo componente `src/components/auth/AuthHeader.tsx`.
- Dentro dele, existe este mapeamento:
  - `Sobre -> /aplique`
- Por isso, mesmo existindo a rota `/sobre` no `App.tsx` e a página `src/pages/Sobre.tsx`, ao clicar em “Sobre” você continua indo para `/aplique`.

Solução proposta (o que vou mudar)
1) Corrigir o destino do link “Sobre” no header público
- Em `src/components/auth/AuthHeader.tsx`, alterar o item:
  - de `{ label: 'Sobre', href: '/aplique' }`
  - para `{ label: 'Sobre', href: '/sobre' }`

2) (Recomendado) Trocar navegação por `<Link>` do React Router, em vez de `<a href>`
- Hoje o header usa `<a href="...">`, o que pode causar reload de página e deixar o comportamento mais “instável” (principalmente em PWA).
- Vou:
  - importar `Link` de `react-router-dom`
  - substituir `AnimatedNavLink` para usar `to="/sobre"` via `<Link>`
  - trocar também os links do menu mobile para `<Link>`
  - adicionar `onClick={() => setIsOpen(false)}` nos links mobile para fechar o menu ao navegar

3) Validar que não existe outro “Sobre” apontando para /aplique
- Já identifiquei que o único lugar com “Sobre -> /aplique” é o `AuthHeader`, mas vou confirmar novamente após a troca.

Como vou testar (checklist)
- Abrir /auth e clicar em “Sobre”:
  - Deve navegar para `/sobre` e exibir o título “IAplicada”, a descrição e o carrossel de logos.
- Abrir /servicos e clicar em “Sobre”:
  - Deve navegar para `/sobre`.
- Testar no mobile:
  - Abrir o menu (hamburger), clicar em “Sobre”
  - Deve navegar para `/sobre` e o menu deve fechar.

Arquivos que serão alterados
- `src/components/auth/AuthHeader.tsx`
  - Atualizar o caminho do link “Sobre”
  - (Opcional recomendado) substituir `<a>` por `<Link>` para navegação interna SPA

Resultado esperado
- “Sobre” sempre abre a página nova `/sobre` (a que contém o layout inspirado no link que você mandou), e não mais `/aplique`.
