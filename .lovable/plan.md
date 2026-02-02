

# Plano: Ajustar Acesso ao Menu de Ambientes

## Resumo das Regras de Acesso

| Plano do Usuário | Ambientes Disponíveis |
|------------------|----------------------|
| **Visitante** | Gratuito |
| **Academy** | Gratuito, Academy |
| **Skills** | Gratuito, Academy, Skills |
| **Business** | Gratuito, Academy, Business + Skills (se liberado) |
| **Admin** | Todos (para teste) |

## Mudanças Necessárias

### 1. Banco de Dados: Novo Campo `skills_liberado`

Adicionar uma coluna na tabela `profiles` para controlar a liberação do Skills para usuários Business:

```sql
ALTER TABLE public.profiles 
ADD COLUMN skills_liberado BOOLEAN DEFAULT FALSE;
```

**Objetivo**: Permitir que admins liberem o acesso ao ambiente Skills para usuários que já possuem o plano Business.

---

### 2. Context de Ambiente: Atualizar Lógica de Acesso

**Arquivo:** `src/contexts/EnvironmentContext.tsx`

Ajustar o `useMemo` de `availableEnvironments` para implementar as novas regras:

```text
Antes (linhas 77-87):
- business → gratuito, academy, business
- skills → gratuito, academy, skills

Depois:
- business → gratuito, academy, business + skills (se skills_liberado=true)
- skills → gratuito, academy, skills
- academy → gratuito, academy
```

Será necessário:
1. Buscar o campo `skills_liberado` do perfil junto com `plano_mentoria`
2. Retornar o array de ambientes baseado nas novas regras

---

### 3. Hook useUserPlan: Expor `skillsLiberado`

**Arquivo:** `src/hooks/useUserPlan.tsx`

Atualizar a query para buscar o novo campo e expor no retorno:

```typescript
// Na query
.select("plano_mentoria, is_visitante, skills_liberado")

// No retorno
skillsLiberado: data?.skills_liberado ?? false
```

---

### 4. Página de Seleção de Ambiente: Visual do Cadeado

**Arquivo:** `src/pages/EnvironmentSelector.tsx`

Ajustar o visual do cadeado para ambientes bloqueados:
- Remover o overlay escuro (`bg-black/60`)
- Exibir cadeado transparente e discreto sobre o card
- Manter a opacidade reduzida no card

```text
Antes (linhas 156-161):
<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
  <Lock className="h-6 w-6 text-white/50" />
</div>

Depois:
<div className="absolute inset-0 flex items-center justify-center z-10">
  <div className="bg-black/30 backdrop-blur-[2px] rounded-full p-3">
    <Lock className="h-5 w-5 text-white/60" />
  </div>
</div>
```

---

### 5. Modais de Usuário Admin: Switch para Skills

**Arquivos:**
- `src/components/admin/EditUserModal.tsx`
- `src/components/admin/NovoUsuarioModal.tsx`

Adicionar um switch visível **apenas quando o plano for Business**:

```text
┌────────────────────────────────────────┐
│ Produto / Plano                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Academy  │ │  Skills  │ │ Business │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                        │
│ ◉ Liberar acesso ao Skills            │ ← aparece só quando Business selecionado
│   Permite acessar o ambiente Skills    │
└────────────────────────────────────────┘
```

Isso será um Switch com label "Liberar acesso ao Skills".

---

### 6. Hook useUsers: Incluir Campo na Query

**Arquivo:** `src/hooks/admin/useUsers.ts`

Atualizar as queries de usuários para incluir o novo campo `skills_liberado` e a mutation de update para aceitá-lo.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| Migração SQL | Adicionar coluna `skills_liberado` |
| `src/contexts/EnvironmentContext.tsx` | Nova lógica de acesso com `skillsLiberado` |
| `src/hooks/useUserPlan.tsx` | Buscar e expor `skills_liberado` |
| `src/pages/EnvironmentSelector.tsx` | Visual clean do cadeado |
| `src/components/admin/EditUserModal.tsx` | Switch para liberar Skills (Business) |
| `src/components/admin/NovoUsuarioModal.tsx` | Switch para liberar Skills (Business) |
| `src/hooks/admin/useUsers.ts` | Incluir campo na query e mutation |

---

## Fluxo Visual do Cadeado

```text
┌─────────────────────────────────────────────────────┐
│                 ANTES                               │
│  ┌───────────┐                                      │
│  │███████████│  Overlay preto escuro                │
│  │███ 🔒 ████│  Cadeado centralizado                │
│  │███████████│                                      │
│  └───────────┘                                      │
│                                                     │
│                 DEPOIS                              │
│  ┌───────────┐                                      │
│  │   imagem  │  Imagem com opacidade reduzida       │
│  │    🔒     │  Cadeado pequeno, transparente       │
│  │           │  sobre fundo blur sutil              │
│  └───────────┘                                      │
└─────────────────────────────────────────────────────┘
```

---

## Seção Técnica

### Tipo Atualizado do Retorno de useUserPlan

```typescript
return {
  plan,
  hasAccessTo,
  isLoading,
  isAcademy: plan === "academy",
  isSkills: plan === "skills",
  isBusiness: plan === "business",
  isVisitante: isProfileVisitante,
  skillsLiberado: data?.skills_liberado ?? false, // NOVO
};
```

### Lógica Atualizada no EnvironmentContext

```typescript
const availableEnvironments = useMemo<Environment[]>(() => {
  if (isAdmin) {
    return ["gratuito", "academy", "skills", "business"];
  }
  
  if (isVisitante) {
    return ["gratuito"];
  }
  
  switch (plan) {
    case "business":
      // Business sempre tem academy, e skills só se liberado
      return skillsLiberado 
        ? ["gratuito", "academy", "skills", "business"]
        : ["gratuito", "academy", "business"];
    case "skills":
      return ["gratuito", "academy", "skills"];
    case "academy":
      return ["gratuito", "academy"];
    default:
      return ["gratuito"];
  }
}, [plan, isVisitante, isAdmin, skillsLiberado]);
```

### Mutation de Update no Admin

```typescript
// Em useUpdateUser
const updates = {
  ...existingFields,
  skills_liberado: data.skillsLiberado, // NOVO
};
```

