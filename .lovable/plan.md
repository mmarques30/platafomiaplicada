

# Plano: Criar Diferenciação Business vs Business iAplicada

## Contexto do Problema

Atualmente existe apenas um tipo "business" no enum `plano_mentoria`. O usuário precisa diferenciar dois cenários:

| Tipo | Descrição | Participação do Cliente |
|------|-----------|------------------------|
| **Business** | Construção em conjunto | Cliente participa ativamente do desenvolvimento |
| **Business iAplicada** | iAplicada constrói para a empresa | Cliente recebe entregas prontas |

A diferença principal está na **visão do "Meu Progresso"** - o Business iAplicada terá uma interface de acompanhamento diferente (a ser construída posteriormente).

---

## Estratégia de Implementação

### Opção Escolhida: Novo valor no Enum + Campo Auxiliar

Adicionar `business_iaplicada` ao enum `plano_mentoria` existente. Isso permite:
- Filtros e queries SQL diretos
- Menus específicos por tipo
- Hooks de acesso simplificados
- Compatibilidade com estrutura existente

---

## Alterações no Banco de Dados

### 1. Expandir o Enum `plano_mentoria`

```sql
ALTER TYPE plano_mentoria ADD VALUE 'business_iaplicada';
```

### 2. Atualizar Função de Acesso (se necessário)

A função `user_has_access_level` continua funcionando pois ambos os tipos Business terão acesso ao conteúdo Academy.

---

## Alterações nos Tipos TypeScript

### `src/hooks/useUserPlan.tsx`

Atualizar o tipo `UserPlan`:

```typescript
export type UserPlan = "academy" | "skills" | "business" | "business_iaplicada" | null;
```

Atualizar verificações:

```typescript
const hasAccessTo = (product: "trilhas" | "skills" | "business") => {
  if (!plan) return false;
  
  switch (product) {
    case "trilhas":
      return ["academy", "skills", "business", "business_iaplicada"].includes(plan);
    case "skills":
      return plan === "skills";
    case "business":
      // Ambos os tipos Business têm acesso ao ambiente Business
      return plan === "business" || plan === "business_iaplicada";
    default:
      return false;
  }
};

// Novos helpers
const isBusinessColaborativo = plan === "business";
const isBusinessIAplicada = plan === "business_iaplicada";
const isAnyBusiness = isBusinessColaborativo || isBusinessIAplicada;
```

---

## Alterações no Admin

### NovoUsuarioModal.tsx e EditUserModal.tsx

Atualizar array de planos:

```typescript
const PLANOS = [
  { value: "academy", label: "Academy", description: "B2C Individual - Acesso às trilhas" },
  { value: "skills", label: "Skills", description: "B2B - Licença corporativa" },
  { value: "business", label: "Business", description: "Consultoria colaborativa" },
  { value: "business_iaplicada", label: "Business iAplicada", description: "iAplicada constrói para a empresa" },
];
```

---

## Alterações no AdminViewSelector

### `src/components/admin/AdminViewSelector.tsx`

Adicionar opção de simulação:

```typescript
const viewOptions = [
  { mode: "visitante", label: "Visitante", icon: <User /> },
  { mode: "academy", label: "Academy", icon: <GraduationCap /> },
  { mode: "skills", label: "Skills", icon: <Briefcase /> },
  { mode: "business", label: "Business", icon: <Building2 /> },
  { mode: "business_iaplicada", label: "Business iAplicada", icon: <Wrench /> },
];
```

### `src/contexts/AdminViewContext.tsx`

Atualizar tipo:

```typescript
export type AdminViewMode = 
  | "visitante" 
  | "academy" 
  | "skills" 
  | "business" 
  | "business_iaplicada" 
  | null;
```

---

## Alterações no Hook useEffectivePlan

```typescript
// Verificações atualizadas
const effectiveIsBusiness = isAdmin || isBusiness || isBusinessIAplicada;
const effectiveIsBusinessColaborativo = isBusiness;
const effectiveIsBusinessIAplicada = isBusinessIAplicada;

return {
  // ...existing
  isBusiness: effectiveIsBusiness, // true para ambos os tipos
  isBusinessColaborativo: effectiveIsBusinessColaborativo,
  isBusinessIAplicada: effectiveIsBusinessIAplicada,
};
```

---

## Alterações nos Menus

### Banco de Dados - menu_config

Atualizar `planos_permitidos` para incluir `business_iaplicada` onde aplicável:

```sql
UPDATE menu_config 
SET planos_permitidos = array_append(planos_permitidos, 'business_iaplicada')
WHERE 'business' = ANY(planos_permitidos);
```

Para menus específicos do Business iAplicada (futuros):

```sql
INSERT INTO menu_config (menu_key, label, url, planos_permitidos, ...)
VALUES ('meu_progresso_iaplicada', 'Acompanhamento', '/acompanhamento', ARRAY['business_iaplicada'], ...);
```

---

## Alterações na Página Mentoria

### `src/pages/Mentoria.tsx`

Adicionar lógica condicional:

```typescript
const { isBusiness, isBusinessColaborativo, isBusinessIAplicada } = useEffectivePlan(isAdmin);

// Renderização condicional
{isBusinessColaborativo && (
  // Visão atual do Business colaborativo
  <BusinessDashboard />
)}

{isBusinessIAplicada && (
  // Nova visão para Business iAplicada (a ser construída)
  <BusinessIAplicadaDashboard />
)}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| **Banco de Dados** | Adicionar `business_iaplicada` ao enum |
| `src/hooks/useUserPlan.tsx` | Atualizar tipo e lógicas |
| `src/contexts/AdminViewContext.tsx` | Atualizar AdminViewMode |
| `src/components/admin/AdminViewSelector.tsx` | Adicionar opção de simulação |
| `src/components/admin/NovoUsuarioModal.tsx` | Adicionar opção no seletor de planos |
| `src/components/admin/EditUserModal.tsx` | Adicionar opção no seletor de planos |
| `src/pages/admin/ImportarUsuarios.tsx` | Adicionar opção no seletor de planos |
| `src/pages/Mentoria.tsx` | Lógica condicional por tipo |
| `src/components/ecossistema/MeuPlanoCard.tsx` | Adicionar label do plano |
| **menu_config (banco)** | Atualizar planos_permitidos |

---

## Arquivos a Criar (Placeholder)

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/BusinessIAplicadaDashboard.tsx` | Placeholder para visão futura |

---

## Fluxo Visual

```text
                        ┌─────────────────────────────────┐
                        │         Tipo Business           │
                        └─────────────────────────────────┘
                                       │
               ┌───────────────────────┴───────────────────────┐
               ▼                                               ▼
    ┌─────────────────────┐                       ┌─────────────────────┐
    │     Business        │                       │  Business iAplicada │
    │   (Colaborativo)    │                       │     (Entrega)       │
    └─────────────────────┘                       └─────────────────────┘
               │                                               │
               ▼                                               ▼
    ┌─────────────────────┐                       ┌─────────────────────┐
    │ Cliente participa   │                       │ Cliente acompanha   │
    │ do desenvolvimento  │                       │ entregas prontas    │
    └─────────────────────┘                       └─────────────────────┘
               │                                               │
               ▼                                               ▼
    ┌─────────────────────┐                       ┌─────────────────────┐
    │ /mentoria           │                       │ /acompanhamento     │
    │ (visão atual)       │                       │ (a ser construída)  │
    └─────────────────────┘                       └─────────────────────┘
```

---

## Seção Técnica

### Migration SQL

```sql
-- Adicionar novo valor ao enum
ALTER TYPE plano_mentoria ADD VALUE 'business_iaplicada';

-- Atualizar menus para incluir novo plano
UPDATE menu_config 
SET planos_permitidos = array_append(planos_permitidos, 'business_iaplicada')
WHERE 'business' = ANY(planos_permitidos);
```

### Tipo Atualizado

```typescript
// useUserPlan.tsx
export type UserPlan = "academy" | "skills" | "business" | "business_iaplicada" | null;

// Helper para verificar qualquer tipo Business
const isAnyBusiness = (plan: UserPlan) => 
  plan === "business" || plan === "business_iaplicada";
```

### Constante de Planos para Admin

```typescript
const PLANOS = [
  { 
    value: "academy", 
    label: "Academy", 
    description: "B2C Individual - Acesso às trilhas" 
  },
  { 
    value: "skills", 
    label: "Skills", 
    description: "B2B - Licença corporativa" 
  },
  { 
    value: "business", 
    label: "Business", 
    description: "Consultoria colaborativa - cliente participa" 
  },
  { 
    value: "business_iaplicada", 
    label: "Business iAplicada", 
    description: "iAplicada constrói - cliente acompanha" 
  },
];
```

