

# Plano: Separar Ambientes - Academy sem "Cursos" e sem "Sala de Aula"

## Objetivo
Diferenciar a experiência do ambiente **Academy** removendo:
1. O dropdown "Cursos" do menu superior (já que o usuário Academy já está no único curso disponível)
2. O link "Sala de Aula" do menu lateral Comunidade

O ambiente **Gratuito** permanece inalterado.

## Alterações Necessárias

### 1. TopHeader.tsx - Ocultar Dropdown "Cursos" para Academy

**Arquivo:** `src/components/layout/TopHeader.tsx`

O dropdown "Cursos" (linhas 141-182) será condicionalmente ocultado quando:
- `isAcademy === true` (plano efetivo é Academy)

**Lógica:**
- Gratuito (Visitante): Vê o dropdown "Cursos" ✅
- Academy: **NÃO vê** o dropdown "Cursos" ❌
- Skills/Business: Vê o dropdown "Cursos" ✅

```tsx
// Antes:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Cursos...</Button>
  </DropdownMenuTrigger>
  ...
</DropdownMenu>

// Depois:
{!isAcademy && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Cursos...</Button>
    </DropdownMenuTrigger>
    ...
  </DropdownMenu>
)}
```

### 2. AppSidebar.tsx - Ocultar "Sala de Aula" para Academy

**Arquivo:** `src/components/layout/AppSidebar.tsx`

O link "Sala de Aula" dentro do menu expansível "Comunidade" (linhas 282-294) será condicionalmente ocultado quando:
- `isAcademy === true` (plano efetivo é Academy)

**Lógica:**
- Gratuito (Visitante): Vê "Sala de Aula" ✅
- Academy: **NÃO vê** "Sala de Aula" ❌  
- Skills/Business: Vê "Sala de Aula" ✅

```tsx
// Antes:
{/* Sala de Aula */}
<NavLink to="/videos-bonus">
  <PlayCircle />
  <span>Sala de Aula</span>
</NavLink>

// Depois:
{/* Sala de Aula - não exibir para Academy */}
{!isAcademy && (
  <NavLink to="/videos-bonus">
    <PlayCircle />
    <span>Sala de Aula</span>
  </NavLink>
)}
```

## Detalhes Técnicos

### TopHeader.tsx
- Já tem acesso a `isAcademy` via `useEffectivePlan` (linha 35)
- Basta envolver o dropdown `<DropdownMenu>` de "Cursos" com `{!isAcademy && (...)}`

### AppSidebar.tsx
- Já tem acesso a `isAcademy` via `useEffectivePlan` (linha 36)
- Basta envolver o `<NavLink to="/videos-bonus">` com `{!isAcademy && (...)}`

## Fluxo de Verificação

| Ambiente | Dropdown "Cursos" | Link "Sala de Aula" |
|----------|-------------------|---------------------|
| Gratuito | ✅ Visível | ✅ Visível |
| Academy | ❌ Oculto | ❌ Oculto |
| Skills | ✅ Visível | ✅ Visível |
| Business | ✅ Visível | ✅ Visível |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/TopHeader.tsx` | Adicionar `{!isAcademy && (...)}` ao dropdown "Cursos" |
| `src/components/layout/AppSidebar.tsx` | Adicionar `{!isAcademy && (...)}` ao link "Sala de Aula" |

## Resultado Final

Usuários Academy terão uma interface mais focada:
- Sem opção de troca de curso (já estão no Academy)
- Sem acesso à Sala de Aula da comunidade (conteúdo gratuito)
- Mantém acesso ao Feed da Comunidade

