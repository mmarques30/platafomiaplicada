
# Plano: Corrigir Detecção de Business IAplicada

## Problema Identificado

O tipo `Environment` em `EnvironmentContext.tsx` não inclui `business_iaplicada`:

```typescript
// ATUAL - não inclui business_iaplicada
export type Environment = "gratuito" | "academy" | "skills" | "business";
```

Por isso, quando um usuário `business_iaplicada` acessa a plataforma:
1. O `currentEnvironment` retorna `"business"` (fallback)
2. O filtro `hiddenByEnvironment["business_iaplicada"]` nunca é aplicado
3. O menu lateral mostra itens errados

## Solução

### 1. Adicionar `business_iaplicada` ao tipo Environment

**Arquivo: `src/contexts/EnvironmentContext.tsx`**

```typescript
// ANTES
export type Environment = "gratuito" | "academy" | "skills" | "business";

// DEPOIS  
export type Environment = "gratuito" | "academy" | "skills" | "business" | "business_iaplicada";
```

### 2. Adicionar configuração para `business_iaplicada`

```typescript
export const ENVIRONMENT_CONFIG: Record<Environment, {...}> = {
  // ... existentes ...
  business_iaplicada: {
    label: "Business iAplicada",
    icon: "Wrench",
    color: "hsl(45, 93%, 47%)", // Mesmo tom do business
    description: "Acompanhamento de projeto - iAplicada constrói",
  },
};
```

### 3. Ajustar `availableEnvironments` para reconhecer `business_iaplicada`

```typescript
// No switch(plan)
case "business_iaplicada":
  // IAplicada tem acesso apenas a business_iaplicada (não colaborativo)
  return skillsLiberado 
    ? ["gratuito", "academy", "skills", "business_iaplicada"]
    : ["gratuito", "academy", "business_iaplicada"];
```

### 4. Ajustar AppSidebar para usar effectivePlan

O `AppSidebar` já tem a lógica correta para detectar `business_iaplicada` através de:

```typescript
const isBusinessIAplicadaEnv = effectiveEnvironment === 'business_iaplicada' 
  || effectivePlan === 'business_iaplicada';
```

Mas o `effectiveEnvironment` nunca será `business_iaplicada` enquanto o tipo não permitir. Após corrigir o tipo, também precisamos:

**Ajustar lógica de simulação no AppSidebar para considerar o plano real:**

```typescript
// Se não está simulando E o plano é business_iaplicada, usar esse ambiente
const effectiveEnvironment = (() => {
  if (!isViewingAs) {
    // Usuário real: verificar se é business_iaplicada pelo plano
    if (effectivePlan === 'business_iaplicada') {
      return 'business_iaplicada';
    }
    return currentEnvironment;
  }
  // Simulação continua igual...
  switch (viewAs) {...}
})();
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/EnvironmentContext.tsx` | Adicionar `business_iaplicada` ao tipo e config |
| `src/components/layout/AppSidebar.tsx` | Ajustar `effectiveEnvironment` para usuários reais |

---

## Resultado Esperado

Quando um usuário `business_iaplicada` acessar:

**Menu Lateral:**
```text
├── Aprender
│   └── Central
├── Bibliotecas
│   ├── Prompts
│   └── Ferramentas
└── Meu Progresso
    ├── Visão Geral
    ├── Roadmap
    └── Entregas
```

**Página /mentoria:**
- Exibe apenas abas "Visão Geral" e "Roadmap" (sem "Evolução Aprendizado")
- Usa componentes `IAplicadaVisaoGeral` e `IAplicadaRoadmap`

---

## Seção Técnica

### EnvironmentContext.tsx

```typescript
// Linha 5 - Novo tipo
export type Environment = "gratuito" | "academy" | "skills" | "business" | "business_iaplicada";

// Linha 23 - Nova config
export const ENVIRONMENT_CONFIG: Record<Environment, {...}> = {
  gratuito: {...},
  academy: {...},
  skills: {...},
  business: {...},
  business_iaplicada: {
    label: "Business iAplicada",
    icon: "Wrench",
    color: "hsl(45, 93%, 47%)",
    description: "Acompanhamento de projeto - iAplicada constrói",
  },
};

// Linha 78 - Novo case no switch
case "business_iaplicada":
  return skillsLiberado 
    ? ["gratuito", "academy", "skills", "business_iaplicada"]
    : ["gratuito", "academy", "business_iaplicada"];
```

### AppSidebar.tsx (linhas 62-79)

```typescript
const effectiveEnvironment = (() => {
  if (!isViewingAs) {
    // Usuário real: se plano é business_iaplicada, usar esse ambiente
    if (effectivePlan === 'business_iaplicada') {
      return 'business_iaplicada';
    }
    return currentEnvironment;
  }

  // Simulação: manter lógica existente
  switch (viewAs) {
    case "visitante":
      return "gratuito";
    case "academy":
      return "academy";
    case "skills":
      return "skills";
    case "business":
      return "business";
    case "business_iaplicada":
      return "business_iaplicada";
    default:
      return currentEnvironment;
  }
})();
```
