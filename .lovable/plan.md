
# Plano: Corrigir Simulação Skills e Ocultar Botão Cursos para Skills

## Problemas Identificados

### Problema 1: UserSelectorByPlanModal não mostra Business com Skills Liberado
No `UserSelectorByPlanModal.tsx` (linha 55), o filtro é:
```typescript
return allUsers.filter(user => user.plano_mentoria === planType);
```

Isso exclui usuários como "Livia" que são **Business** mas têm `skills_liberado = true`.

### Problema 2: Botão "Cursos" aparece para Skills
No `TopHeader.tsx` (linha 142), a condição é:
```typescript
{!isVisitante && !isAcademy && !isBusiness && (
```

Isso significa que Skills **vê** o dropdown Cursos, quando deveria ver apenas a opção de trocar de ambiente.

---

## Solução

### 1. UserSelectorByPlanModal.tsx

Ajustar o filtro para incluir usuários Business com Skills liberado quando o plano selecionado for "skills":

```typescript
const planUsers = useMemo(() => {
  if (!allUsers) return [];
  
  if (planType === 'skills') {
    // Skills: usuários com plano skills OU business com skills_liberado
    return allUsers.filter(user => 
      user.plano_mentoria === 'skills' || 
      ((user.plano_mentoria === 'business' || user.plano_mentoria === 'business_iaplicada') && user.skills_liberado)
    );
  }
  
  return allUsers.filter(user => user.plano_mentoria === planType);
}, [allUsers, planType]);
```

### 2. TopHeader.tsx

Adicionar `isSkills` à condição para ocultar o dropdown "Cursos":

```typescript
{/* Dropdown Cursos - oculto para Visitante, Academy, Skills e Business */}
{!isVisitante && !isAcademy && !isSkills && !isBusiness && (
```

Isso garante que Skills use **apenas** o seletor de ambiente para navegar entre Academy e Skills.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/UserSelectorByPlanModal.tsx` | Incluir Business+Skills no filtro "skills" |
| `src/components/layout/TopHeader.tsx` | Adicionar `!isSkills` na condição do dropdown Cursos |

---

## Seção Técnica

### Filtro Corrigido para Skills

```typescript
// UserSelectorByPlanModal.tsx
const planUsers = useMemo(() => {
  if (!allUsers) return [];
  
  // Para Skills, incluir também Business com skills_liberado
  if (planType === 'skills') {
    return allUsers.filter(user => 
      user.plano_mentoria === 'skills' || 
      ((user.plano_mentoria === 'business' || user.plano_mentoria === 'business_iaplicada') && user.skills_liberado)
    );
  }
  
  return allUsers.filter(user => user.plano_mentoria === planType);
}, [allUsers, planType]);
```

### Condição Atualizada TopHeader

```typescript
// TopHeader.tsx linha 142
{/* Dropdown Cursos - oculto para todos os planos pagos (usam Environment Switcher) */}
{!isVisitante && !isAcademy && !isSkills && !isBusiness && (
  <DropdownMenu>
    ...
  </DropdownMenu>
)}
```

### Comportamento Final

| Usuário | Vê Dropdown "Cursos" | Usa Environment Switcher |
|---------|---------------------|-------------------------|
| Visitante | ❌ | ❌ (não tem ambientes) |
| Academy | ❌ | ✅ (Academy, Gratuito) |
| Skills | ❌ | ✅ (Skills, Academy, Gratuito) |
| Business | ❌ | ✅ (Business, Academy, Gratuito) |
| Business + Skills | ❌ | ✅ (Business, Skills, Academy, Gratuito) |
| Admin | ❌ | ✅ (todos) |
