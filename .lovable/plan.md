

# Plano: Corrigir Erros e Ajustar Regra de 30 Dias para Visitantes

## Resumo dos Problemas

### Problema 1: Erro ao acessar /cupons
O componente `Cupons.tsx` está quebrando porque na linha 73 há um erro de lógica:
```tsx
{isVisitante && expirationData?.diasRestantes !== null && expirationData.diasRestantes <= 7 && (
```
Quando `expirationData` é `undefined` (para não-visitantes), a condição `expirationData?.diasRestantes !== null` retorna `true` (porque `undefined !== null`), e então `expirationData.diasRestantes` causa erro porque `expirationData` é `undefined`.

### Problema 2: Regra de 30 dias para visitantes existentes
Atualmente a migração calculou `acesso_expira_em = created_at + 30 dias`, o que fez com que **107 visitantes** já estejam tecnicamente "expirados" (porque se cadastraram há mais de 30 dias).

A nova regra solicitada:
- **Usuários existentes**: os 30 dias começam a contar a partir de HOJE (02/02/2026)
- **Novos usuários**: os 30 dias contam a partir da data de cadastro

---

## Correções Necessárias

### Correção 1: Cupons.tsx - Corrigir verificação de null/undefined

**Arquivo:** `src/pages/Cupons.tsx`

**Linha 73 - De:**
```tsx
{isVisitante && expirationData?.diasRestantes !== null && expirationData.diasRestantes <= 7 && (
```

**Para:**
```tsx
{isVisitante && expirationData?.diasRestantes != null && expirationData.diasRestantes <= 7 && (
```

**Explicação:** Usar `!= null` (comparação fraca) em vez de `!== null` (comparação estrita) faz com que a verificação também exclua `undefined`, evitando o erro.

---

### Correção 2: Migração SQL para ajustar datas de expiração

**Nova migração:** Atualizar visitantes existentes para que os 30 dias comecem a partir de hoje.

```sql
-- Ajustar a data de expiração dos visitantes existentes para 30 dias a partir de HOJE
-- Isso afeta apenas quem já estava cadastrado antes desta data
UPDATE public.profiles
SET acesso_expira_em = NOW() + INTERVAL '30 days'
WHERE is_visitante = true
  AND acesso_expira_em IS NOT NULL;

-- Garantir que nenhum visitante existente esteja marcado como expirado
UPDATE public.profiles
SET acesso_expirado = false
WHERE is_visitante = true
  AND acesso_expirado = true;
```

Após esta correção:
- **143 visitantes existentes** terão nova data de expiração: `04/03/2026` (30 dias a partir de hoje)
- **Novos visitantes** continuarão tendo a regra normal via trigger: `created_at + 30 dias`

---

## Arquivos a Serem Alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Cupons.tsx` | Corrigir verificação de `!= null` na linha 73 |
| Nova migração SQL | Atualizar `acesso_expira_em` para `NOW() + 30 dias` para visitantes existentes |

---

## Validação

Após as correções:
1. A página `/cupons` deve carregar sem erros para qualquer tipo de usuário
2. Os 107 visitantes que estavam "expirados" terão novos 30 dias de acesso
3. Novos visitantes continuarão seguindo a regra do trigger (30 dias a partir do cadastro)

