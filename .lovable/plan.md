

# Corrigir edge functions com valores antigos do enum plano_mentoria

## Problema
O frontend agora envia `business_parceria` e `business_sistemas`, mas as edge functions ainda validam contra os valores antigos (`business`, `business_iaplicada`), causando erro ao criar usuario.

## Alteracoes

### 1. `supabase/functions/create-user-admin/index.ts`
- Linha 69: Atualizar `planosValidos` para `['academy', 'skills', 'business_parceria', 'business_sistemas']`
- Linha 75: Mudar fallback de parceiros de `'business'` para `'business_parceria'`
- Linha 188: Mudar condicao para `effectivePlanoMentoria === 'business_parceria' || effectivePlanoMentoria === 'business_sistemas'`

### 2. `supabase/functions/import-users-batch/index.ts`
- Linha 73: Atualizar `planosValidos` para incluir `'business_parceria', 'business_sistemas'`

### 3. `src/hooks/useSkillsLider.ts`
- Linha 84: Mudar `business_iaplicada` para `business_sistemas`

### 4. `src/pages/admin/ImportarUsuarios.tsx`
- Linhas 260-261: Atualizar valor e label do radio de `business_iaplicada`/`Business iAplicada` para `business_sistemas`/`Business Sistemas`, e adicionar opcao `business_parceria`/`Business Parceria`

