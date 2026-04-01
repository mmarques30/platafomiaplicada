

# AcademyWelcomeCard — expiração 7 dias + primeira trilha recomendada

## Alterações

**Arquivo**: `src/components/dashboard/AcademyWelcomeCard.tsx`

### 1. Expiração após 7 dias

Após as guards existentes (`isAcademy`, `isFirstAccess`, `dismissed`), adicionar cálculo de dias desde `created_at` do perfil. Se > 7, retornar `null`.

### 2. Buscar primeira trilha

Adicionar `useQuery` inline para buscar a primeira trilha ordenada por `ordem` (query simples: `supabase.from("trilhas").select("id, titulo").eq("visivel_mentorados", true).order("ordem").limit(1).single()`). O hook roda apenas quando o card seria visível.

### 3. Bloco "Comece por aqui"

Após o grid de ações (linha 95), adicionar o `div` com estilo inline contendo título da trilha e botão "Começar trilha →" que navega para `/trilhas/{id}`.

### Nenhuma outra alteração — dismiss, tour, outros componentes intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/AcademyWelcomeCard.tsx` | Editado — expiração 7d, query trilha, bloco "Comece por aqui" |

