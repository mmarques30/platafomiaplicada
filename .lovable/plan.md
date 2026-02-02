
# Plano: Adicionar Business iAplicada às Opções de Admin e Unificar Visão Business

## Contexto

O usuário esclareceu que:
1. Usuários Business (ambos tipos) entram pelo ambiente "business"
2. A identificação interna (colaborativo vs iAplicada) determina o que ele vê
3. Admin precisa poder simular Business iAplicada para testes

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/EnvironmentContext.tsx` | Adicionar `business_iaplicada` aos ambientes disponíveis para admin |
| `src/components/layout/EnvironmentSwitcher.tsx` | Adicionar `business_iaplicada` à lista de todos os ambientes |

---

## Detalhamento das Alterações

### 1. EnvironmentContext.tsx (linha 74-76)

**Antes:**
```typescript
if (isAdmin) {
  return ["gratuito", "academy", "skills", "business"];
}
```

**Depois:**
```typescript
if (isAdmin) {
  return ["gratuito", "academy", "skills", "business", "business_iaplicada"];
}
```

### 2. EnvironmentSwitcher.tsx (linha 15)

**Antes:**
```typescript
const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business"];
```

**Depois:**
```typescript
const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business", "business_iaplicada"];
```

---

## Hierarquia Final de Acesso (Confirmada)

| Plano | Ambientes Disponíveis |
|-------|----------------------|
| Gratuito (Visitante) | `gratuito` |
| Academy | `gratuito`, `academy` |
| Skills | `gratuito`, `academy`, `skills` |
| Business | `gratuito`, `academy`, `business` |
| Business + Skills | `gratuito`, `academy`, `skills`, `business` |
| Business iAplicada | `gratuito`, `academy`, `business_iaplicada` |
| Business iAplicada + Skills | `gratuito`, `academy`, `skills`, `business_iaplicada` |
| **Admin (simulação)** | `gratuito`, `academy`, `skills`, `business`, `business_iaplicada` |

---

## Fluxo de Identificação Interna

```text
┌─────────────────────────────────────────────────────────────┐
│                  Usuário entra na plataforma                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           useUserPlan verifica plano_mentoria               │
│                                                             │
│   • business → Business Colaborativo                        │
│   • business_iaplicada → Business iAplicada                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         EnvironmentContext define ambientes                 │
│                                                             │
│   • business → ambiente "business"                          │
│   • business_iaplicada → ambiente "business_iaplicada"      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│      Componentes adaptam interface baseado no ambiente      │
│                                                             │
│   • Menus diferentes (AppSidebar)                           │
│   • Abas diferentes (/mentoria)                             │
│   • Permissões diferentes                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Resultado Esperado

### Para Admin - Dropdown "Ver como...":
- ✅ Visitante (gratuito)
- ✅ Academy
- ✅ Skills
- ✅ Business
- ✅ Business iAplicada ← **NOVO**

### Para Admin - EnvironmentSwitcher:
- ✅ Mostra todos os 5 ambientes
- ✅ Pode alternar entre todos para testar interfaces

### Para Usuário Real Business iAplicada:
- ✅ Vê apenas: `gratuito`, `academy`, `business_iaplicada`
- ✅ Interface e menus específicos do iAplicada
