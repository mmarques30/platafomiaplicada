
# Plano: Ocultar Botão CTA para Usuários Academy, Skills e Business

## Problema

Atualmente, o botão "Aplique" / "Avance" aparece para todos os usuários. O usuário deseja que esse botão seja ocultado para todos os planos pagos (Academy, Skills e Business), ficando visível apenas para **visitantes**.

## Arquivo a Modificar

**`src/components/layout/AppSidebar.tsx`**

## Mudanças Necessárias

### 1. Atualizar desestruturação do hook (linha 36)

Adicionar `isBusiness`, `isSkills` e `isAcademy` na desestruturação:

```tsx
const { effectivePlan, isVisitante, isBusiness, isSkills, isAcademy, isLoading: effectivePlanLoading } = useEffectivePlan(isAdmin, roleLoading);
```

### 2. Adicionar condição ao redor do CTA (linhas 299-322)

Envolver o bloco do botão com a condição que verifica se o usuário **não** é Business, Skills ou Academy:

```tsx
{/* CTA Item - Visível apenas para visitantes */}
{!isBusiness && !isSkills && !isAcademy && (
  <SidebarMenuItem>
    <SidebarMenuButton asChild className="group">
      <NavLink 
        to={isVisitante || !effectivePlan ? "/aplique" : "/avance"}
        ...
      />
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

## Resultado

| Tipo de Usuário | Botão Exibido |
|-----------------|---------------|
| **Visitante** | "Aplique" → `/aplique` |
| Academy | Oculto |
| Skills | Oculto |
| Business | Oculto |
| Admin (sem simulação) | Oculto (admin = business) |
| Admin simulando visitante | "Aplique" → `/aplique` |

## Observação

Como visitantes são os únicos que verão o botão, a lógica interna do NavLink sempre mostrará "Aplique" → `/aplique`. A condição `isVisitante || !effectivePlan` continuará funcionando corretamente.
