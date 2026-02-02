
# Plano: Corrigir Visibilidade da "Sala de Aula"

## Problema Identificado

A "Sala de Aula" está aparecendo para usuários pagos quando deveria ser **exclusiva para visitantes (gratuito)**:

```typescript
// LÓGICA ATUAL (errada)
{!isAcademy && (
  <SidebarMenuItem>... Sala de Aula ...</SidebarMenuItem>
)}
```

Isso significa que aparece para:
- ❌ Skills → não deveria
- ❌ Business → não deveria  
- ✅ Visitante (gratuito) → correto

## Solução

Inverter a lógica: **Sala de Aula deve aparecer APENAS para visitantes**

```typescript
// LÓGICA CORRIGIDA
{isVisitante && (
  <SidebarMenuItem>... Sala de Aula ...</SidebarMenuItem>
)}
```

Assim:
- ❌ Academy → não aparece
- ❌ Skills → não aparece
- ❌ Business → não aparece
- ✅ Visitante (gratuito) → aparece

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/AppSidebar.tsx` | Trocar `{!isAcademy &&` por `{isVisitante &&` na linha 495 |

---

## Seção Técnica

### AppSidebar.tsx (linhas 494-512)

```typescript
// ANTES (linha 495)
{!isAcademy && (
  <SidebarMenuItem>
    <SidebarMenuButton asChild className="group">
      <NavLink to="/videos-bonus" ...>
        {!collapsed && <span>Sala de Aula</span>}
      </NavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}

// DEPOIS
{isVisitante && (
  <SidebarMenuItem>
    <SidebarMenuButton asChild className="group">
      <NavLink to="/videos-bonus" ...>
        {!collapsed && <span>Sala de Aula</span>}
      </NavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

---

## Resultado Esperado

| Ambiente | Sala de Aula |
|----------|--------------|
| Visitante (gratuito) | ✅ Visível |
| Academy | ❌ Oculto |
| Skills | ❌ Oculto |
| Business | ❌ Oculto |
| Business iAplicada | ❌ Oculto |
