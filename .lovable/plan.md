
## Plano: Visualizar Como Business com Seleção de Mentorado

### Objetivo
Permitir que o admin selecione um mentorado específico do plano Business ao ativar "Ver como Business", para visualizar exatamente o que esse mentorado vê em todas as páginas de mentoria.

---

### Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────────┐
│                     AdminViewContext                             │
│  viewAs: AdminViewMode                                          │
│  impersonatedUserId: string | null  ← NOVO                      │
│  impersonatedUserName: string | null ← NOVO                     │
│  setViewAs(mode, userId?, userName?) ← ATUALIZADO               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AdminViewSelector                              │
│  Quando Business selecionado:                                    │
│    → Abre modal de seleção de mentorado                         │
│    → Lista apenas usuários com plano_mentoria = 'business'      │
│    → Admin escolhe mentorado específico                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Páginas de Mentoria Business                        │
│  MentoriaEntregas, MentoriaDocumentos, MentoriaSessoes...       │
│    → Hooks recebem userId do context quando em modo simulação   │
│    → useContratosBusiness(impersonatedUserId)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### PARTE 1: Atualizar Context e Hook

**Arquivo: `src/contexts/AdminViewContext.tsx`**

Adicionar ao estado:
- `impersonatedUserId: string | null` - ID do mentorado sendo visualizado
- `impersonatedUserName: string | null` - Nome para exibição no botão

Atualizar métodos:
- `setViewAs(mode, userId?, userName?)` - Agora aceita userId opcional
- `resetView()` - Limpa também o impersonatedUserId
- Persistir no localStorage: `admin_view_user_id` e `admin_view_user_name`

**Arquivo: `src/hooks/useAdminView.tsx`**

Adicionar ao retorno:
- `impersonatedUserId` 
- `impersonatedUserName`

---

### PARTE 2: Criar Modal de Seleção de Mentorado

**Novo arquivo: `src/components/admin/BusinessUserSelectorModal.tsx`**

Componente modal com:
- Lista de usuários Business (filtrado por `plano_mentoria = 'business'`)
- Campo de busca por nome/email
- Exibir: Avatar, nome, email, empresa (se disponível)
- Botão "Selecionar" que fecha modal e seta o `impersonatedUserId`

```typescript
interface BusinessUserSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string, userName: string) => void;
}
```

---

### PARTE 3: Atualizar AdminViewSelector

**Arquivo: `src/components/admin/AdminViewSelector.tsx`**

Modificações:
1. Quando `mode = 'business'` for selecionado, abrir o modal ao invés de setar direto
2. Após seleção no modal, chamar `setViewAs('business', userId, userName)`
3. No botão, exibir o nome do mentorado: "Business: Paula" ao invés de só "Business"
4. Adicionar indicador visual diferenciado quando impersonando

---

### PARTE 4: Atualizar Páginas de Mentoria Business

Todas as páginas que chamam hooks de dados Business precisam usar o `impersonatedUserId` quando disponível.

**Hook utilitário novo: `src/hooks/useBusinessUserId.tsx`**

```typescript
export function useBusinessUserId(): string | undefined {
  const { user } = useAuth();
  const { viewAs, impersonatedUserId } = useAdminViewContext();
  
  // Se admin está visualizando como Business com user específico
  if (viewAs === 'business' && impersonatedUserId) {
    return impersonatedUserId;
  }
  
  // Caso contrário, usa o próprio usuário
  return user?.id;
}
```

**Páginas a atualizar:**

| Arquivo | Mudança |
|---------|---------|
| `src/pages/MentoriaEntregas.tsx` | `useContratosBusiness(businessUserId)` |
| `src/pages/MentoriaDocumentos.tsx` | `useContratosBusiness(businessUserId)` |
| `src/pages/MentoriaSessoes.tsx` | `useContratosBusiness(businessUserId)` |
| `src/pages/MentoriaReports.tsx` | `useContratosBusiness(businessUserId)` |
| `src/pages/MentoriaEtapa.tsx` | Verificar se precisa |
| `src/pages/MentoriaEntregaDetalhe.tsx` | Verificar se usa contexto |
| `src/components/mentoria/business/BusinessExecutiveRoadmap.tsx` | `useContratosBusiness(businessUserId)` |
| `src/components/mentoria/business/BusinessReportsCard.tsx` | `useContratosBusiness(businessUserId)` |
| `src/components/mentoria/BusinessROIChart.tsx` | `useContratosBusiness(businessUserId)` |

---

### PARTE 5: Banner de Simulação

Adicionar banner fixo quando em modo impersonação, mostrando quem está sendo visualizado:

**Arquivo: `src/components/layout/TopHeader.tsx` ou `MainLayout.tsx`**

```tsx
{viewAs === 'business' && impersonatedUserName && (
  <div className="fixed top-14 left-0 right-0 bg-amber-500 text-black text-center py-2 z-40 text-sm font-medium">
    👁️ Visualizando como: {impersonatedUserName} (Business)
    <Button size="sm" variant="ghost" onClick={resetView} className="ml-4">
      Sair da simulação
    </Button>
  </div>
)}
```

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/contexts/AdminViewContext.tsx` | **MODIFICAR** - Adicionar impersonatedUserId/Name |
| `src/hooks/useAdminView.tsx` | **MODIFICAR** - Expor novos campos |
| `src/hooks/useBusinessUserId.tsx` | **CRIAR** - Hook utilitário |
| `src/components/admin/BusinessUserSelectorModal.tsx` | **CRIAR** - Modal de seleção |
| `src/components/admin/AdminViewSelector.tsx` | **MODIFICAR** - Integrar modal |
| `src/pages/MentoriaEntregas.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/pages/MentoriaDocumentos.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/pages/MentoriaSessoes.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/pages/MentoriaReports.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/components/mentoria/business/BusinessExecutiveRoadmap.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/components/mentoria/business/BusinessReportsCard.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/components/mentoria/BusinessROIChart.tsx` | **MODIFICAR** - Usar businessUserId |
| `src/components/layout/TopHeader.tsx` | **MODIFICAR** - Adicionar banner de simulação |

---

### Fluxo de Uso

1. Admin clica em "Ver como..." no header
2. Seleciona "Business" no dropdown
3. Modal abre com lista de mentorados Business
4. Admin busca/seleciona "Paula"
5. Modal fecha, botão mostra "Business: Paula" em amarelo
6. Banner aparece: "Visualizando como: Paula (Business)"
7. Todas as páginas de mentoria mostram dados da Paula
8. Admin clica em "Sair da simulação" para voltar ao modo normal

---

### Benefícios

- Admin pode verificar exatamente o que cada mentorado Business vê
- Facilita debug de problemas reportados por mentorados
- Garante que importações de documentos estão corretas
- Validação rápida da experiência do usuário
