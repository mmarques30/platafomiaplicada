

# Correções em 3 páginas públicas

## 1. Logo quebrado na /sobre
A página `Sobre.tsx` não usa o `AuthHeader` — tem apenas um botão "Voltar". O logo exibido vem do `AboutSection` que importa `logo-iaplicada-icon.png` (arquivo existe). Preciso verificar se o problema é de fato esse logo ou se o usuário se refere ao header. Solução: adicionar o `AuthHeader` à página Sobre (como já existe em Serviços), que já tem o logo funcional. Remover o botão "Voltar" manual que hoje ocupa esse espaço.

**Arquivo: `src/pages/Sobre.tsx`**
- Importar e adicionar `<AuthHeader />` no topo
- Remover o bloco do botão "Voltar" (sticky)
- Adicionar `pt-20` ao conteúdo para compensar o header fixo

## 2. Navbar faltando em /servicos
A página Serviços já tem `AuthHeader`, mas o header não tem link "Entrar". 

**Arquivo: `src/components/auth/AuthHeader.tsx`**
- Adicionar `{ label: 'Entrar', to: '/auth' }` ao array `navLinksData`

## 3. Tema escuro nas páginas /termos-uso e /politica-privacidade
Ambas usam `bg-background` (branco no tema claro). Precisam usar fundo escuro `bg-[#1a1c19]` + textos claros, igual Sobre/Serviços. Também adicionar o `AuthHeader` para navegação consistente.

**Arquivo: `src/pages/PoliticaUso.tsx`**
- Trocar `bg-background` por `bg-[#1a1c19]` nos 3 blocos de return (loading, not found, content)
- Adicionar `<AuthHeader />` e padding top
- Estilizar Card com fundo escuro: `bg-[#1a1c19]/80 border-white/10`
- Textos em branco/cinza claro
- Remover botão "Voltar" manual (AuthHeader já tem navegação)

**Arquivo: `src/pages/PoliticaPrivacidade.tsx`**
- Mesmas alterações de tema escuro e AuthHeader

## Arquivos alterados
- `src/pages/Sobre.tsx`
- `src/components/auth/AuthHeader.tsx`
- `src/pages/PoliticaUso.tsx`
- `src/pages/PoliticaPrivacidade.tsx`

