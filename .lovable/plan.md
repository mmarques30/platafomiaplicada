

# Fix: Business progress em Minha Trajetória + preview admin

## Problema
1. Os hooks `useBusinessProgressoConteudo` e `useBusinessEvolucaoAprendizado` usam `user?.id` diretamente em vez de `useBusinessUserId()`, então quando o admin simula via "Ver como", os dados do usuário simulado não são carregados
2. O `Mentoria.tsx` não passa `roleLoading` ao `useEffectivePlan`, causando possível race condition
3. O componente `BusinessProgressoConteudo` não está presente na página Mentoria (Minha Trajetória) — só na Evolução

## Correções

### 1. Hook `useBusinessProgressoConteudo` — usar `useBusinessUserId`
**Arquivo: `src/hooks/useBusinessProgressoConteudo.tsx`**
- Substituir `useAuth` + `user?.id` por `useBusinessUserId()` para que admin simulando veja os dados do usuário correto

### 2. Hook `useBusinessEvolucaoAprendizado` — usar `useBusinessUserId`
**Arquivo: `src/hooks/useBusinessEvolucaoAprendizado.tsx`**
- Mesma correção: substituir `user?.id` por `useBusinessUserId()`

### 3. Mentoria.tsx — passar `roleLoading` e adicionar `BusinessProgressoConteudo`
**Arquivo: `src/pages/Mentoria.tsx`**
- Extrair `isLoading: roleLoading` do `useUserRole()` e passar para `useEffectivePlan(isAdmin, roleLoading)`
- Adicionar `BusinessProgressoConteudo` na aba "visão geral" do Business Parceria (junto com ROIChart e ReportsCard)
- Adicionar `BusinessProgressoConteudo` na aba "evolução aprendizado" (antes do `BusinessEvolucaoAprendizado`)

## Arquivos alterados
- `src/hooks/useBusinessProgressoConteudo.tsx`
- `src/hooks/useBusinessEvolucaoAprendizado.tsx`
- `src/pages/Mentoria.tsx`

