
# Plano: Seletores de Usuários para Simulação Academy e Skills

## Contexto
Atualmente a simulação de planos funciona assim:
- **Business**: Abre modal para selecionar um usuário específico do plano Business
- **Academy/Skills**: Apenas muda o modo de visualização genérico, sem selecionar um usuário real

O objetivo é permitir que você selecione usuários específicos de cada plano para ver exatamente o que eles estão vendo.

## Solução

### 1. Criar Modal Genérico de Seleção de Usuários por Plano
Criar um componente reutilizável `UserSelectorByPlanModal` que:
- Recebe o tipo de plano como parâmetro (academy, skills, ou business)
- Filtra e exibe usuários do plano selecionado
- Permite busca por nome/email
- Ao selecionar, passa userId e userName para o contexto

**Arquivo:** `src/components/admin/UserSelectorByPlanModal.tsx`

### 2. Refatorar AdminViewSelector
Modificar para que ao clicar em **qualquer** opção de plano (Academy, Skills, Business), abra o modal de seleção correspondente:

```text
┌─────────────────────────────────────┐
│  AdminViewSelector (dropdown)       │
├─────────────────────────────────────┤
│  > Visitante (gratuito)             │  → Ativa modo visitante direto
│  > Academy                          │  → Abre modal com usuários Academy
│  > Skills                           │  → Abre modal com usuários Skills  
│  > Business                         │  → Abre modal com usuários Business
│  ─────────────────────────────       │
│  > Voltar para Admin                │
└─────────────────────────────────────┘
```

### 3. Unificar Banner de Simulação
O banner no TopHeader exibirá:
- **Visitante**: "Visualizando como: Visitante"
- **Academy/Skills/Business**: "Visualizando como: [Nome do Usuário] (Plano)"

### Detalhes Técnicos

#### Novo Componente: UserSelectorByPlanModal
```tsx
interface UserSelectorByPlanModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string, userName: string) => void;
  planType: "academy" | "skills" | "business";
}
```
- Reutiliza a estrutura do `BusinessUserSelectorModal`
- Ícone e título dinâmicos por plano
- Filtra `user.plano_mentoria === planType`

#### Modificações no AdminViewSelector
- Estado: `selectedPlanForModal: "academy" | "skills" | "business" | null`
- Ao clicar em Academy/Skills/Business → abre modal com o plano selecionado
- Visitante continua setando direto (`setViewAs("visitante")`)

#### Modificações no TopHeader
```tsx
// Banner unificado
{isAdmin && isViewingAs && (
  <div className="fixed top-0 ... bg-amber-500 text-black ...">
    👁️ Visualizando como: <strong>
      {viewAs === 'visitante' 
        ? 'Visitante'
        : `${impersonatedUserName} (${viewAs})`
      }
    </strong>
    <Button onClick={resetView}>Sair da simulação</Button>
  </div>
)}

// Posição do header ajustada
isAdmin && isViewingAs ? "top-10" : "top-0"
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/admin/UserSelectorByPlanModal.tsx` | **Criar** - Modal genérico para seleção |
| `src/components/admin/AdminViewSelector.tsx` | **Modificar** - Usar novo modal para todos os planos |
| `src/components/admin/BusinessUserSelectorModal.tsx` | **Remover** - Substituído pelo modal genérico |
| `src/components/layout/TopHeader.tsx` | **Modificar** - Banner unificado para todos os modos |

## Fluxo de Uso

1. Admin clica no botão "Ver como..."
2. Escolhe um plano (ex: Academy)
3. Modal abre com lista de usuários Academy
4. Admin busca e seleciona um usuário
5. Banner amarelo aparece: "Visualizando como: João Silva (Academy)"
6. Toda a interface reflete a visão daquele usuário específico
7. Admin clica em "Sair da simulação" para voltar

## Resultado Final
- Um único ponto de entrada (botão dropdown)
- Seleção de usuário específico para TODOS os planos
- Um único banner de indicação de simulação
- Experiência consistente e intuitiva
