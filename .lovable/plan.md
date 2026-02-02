
# Plano: Correções de Acesso e Interface

## Problemas Identificados

### 1. Botão "Contribuir" aparecendo para visitantes
O componente `CriadoresComunidadeTab.tsx` usa `useUserPlan()` diretamente na linha 43, que não considera quando um admin está simulando como visitante através do `AdminViewContext`. 

Além disso, mesmo para visitantes reais, pode haver um problema de timing onde `isPlanLoading` é `false` mas `isVisitante` ainda não foi corretamente determinado.

### 2. EnvironmentSwitcher mostrando ícones e descrições
O dropdown de troca de ambientes está exibindo ícones coloridos e descrições completas. O usuário deseja uma versão simplificada mostrando apenas os nomes dos ambientes.

---

## Solução

### Correção 1: Ocultar botão "Contribuir" para visitantes

**Arquivo:** `src/components/comunidade/CriadoresComunidadeTab.tsx`

Substituir o uso de `useUserPlan()` por `useUserRole()` que já tem a lógica de visitante com simulação:

```typescript
// Linha 12-13: Trocar imports
import { useUserRole } from "@/hooks/useUserRole";

// Linha 43: Substituir useUserPlan por useUserRole
const { isVisitante, isLoading: isPlanLoading } = useUserRole();

// A lógica canContribute permanece igual (linha 59)
const canContribute = !!user && !isPlanLoading && !isVisitante;
```

O hook `useUserRole()` já inclui a lógica de simulação do admin (`effectiveIsVisitante`), garantindo que quando um admin está "vendo como visitante", o botão não apareça.

---

### Correção 2: Simplificar EnvironmentSwitcher

**Arquivo:** `src/components/layout/EnvironmentSwitcher.tsx`

Remover ícones e descrições do dropdown, mantendo apenas os nomes dos ambientes:

#### Antes (linhas 81-111):
```tsx
<DropdownMenuItem ...>
  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={...}>
    <Icon className="h-4 w-4" style={...} />
  </div>
  <div className="flex-1">
    <div className="font-medium text-sm">{config.label}</div>
    <div className="text-xs text-muted-foreground truncate">
      {config.description}
    </div>
  </div>
  {!isAvailable && <Lock ... />}
  {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
</DropdownMenuItem>
```

#### Depois:
```tsx
<DropdownMenuItem ...>
  <span className="flex-1 font-medium text-sm">{config.label}</span>
  {!isAvailable && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
  {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
</DropdownMenuItem>
```

Também remover o ícone do botão trigger:

#### Antes (linha 64):
```tsx
<CurrentIcon className="h-4 w-4" style={{ color: environmentConfig.color }} />
```

#### Depois:
Remover esta linha completamente.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/comunidade/CriadoresComunidadeTab.tsx` | Trocar `useUserPlan` por `useUserRole` para considerar simulação admin |
| `src/components/layout/EnvironmentSwitcher.tsx` | Remover ícones e descrições, manter apenas nomes dos ambientes |

---

## Resultado Esperado

### Antes
```
┌──────────────────────────────────────┐
│ 🎁 Gratuito ▼                        │
├──────────────────────────────────────┤
│ Ambiente atual                       │
│──────────────────────────────────────│
│ [🎁] Gratuito                        │
│      Explore conteúdos gratuitos...  │
│ [🎓] Academy                         │
│      Trilhas completas + diagnós...  │
│ [👥] Skills                          │
│      Academy + capacitação para...   │
│ [👑] Business                        │
│      Academy + mentoria 1:1 + ro...  │
│──────────────────────────────────────│
│ ↺ Voltar para seleção                │
└──────────────────────────────────────┘
```

### Depois
```
┌──────────────────────────────────────┐
│ Gratuito ▼                           │
├──────────────────────────────────────┤
│ Ambiente atual                       │
│──────────────────────────────────────│
│ Gratuito                           ● │
│ Academy                          🔒 │
│ Skills                           🔒 │
│ Business                         🔒 │
│──────────────────────────────────────│
│ ↺ Voltar para seleção                │
└──────────────────────────────────────┘
```

### Botão Contribuir
- **Visitante real**: Não aparece ✓
- **Admin simulando visitante**: Não aparece ✓
- **Mentorado (Academy/Skills/Business)**: Aparece ✓
