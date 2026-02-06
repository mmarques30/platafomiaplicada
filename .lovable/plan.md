
# Plano: Correção do Painel do Líder Skills + Limpeza de Tabelas Duplicadas

## Problemas Identificados

### 1. Tabelas Duplicadas no Banco
Existem 5 tabelas `*_squad` que duplicam a estrutura `*_skills`:
- `squads` (duplica `equipes_skills`)
- `membros_squad` (duplica `membros_equipe_skills`)
- `entregas_squad` (duplica `entregas_skills`)
- `metricas_squad` (duplica `metricas_skills`)
- `roadmap_squad` (duplica `roadmap_skills`)

### 2. Painel Não Exibe Estrutura Sem Dados
O painel do líder está funcionando, mas mostra valores zerados porque:
- `entregas_skills`: 0 registros
- `roadmap_skills`: 0 registros
- `metricas_skills`: 0 registros

O visual está correto, mas falta:
- Roadmap padrão de 12 semanas (3 fases)
- Estados visuais de "sem dados" mais claros
- Permitir admin visualizar mesmo sem ser líder (modo simulação)

### 3. Admin Não Consegue Visualizar em Simulação
O hook `useSkillsLider` usa `enabled: !!equipeId && isLider` em todas as queries.
Quando o admin simula um usuário que não é líder, o painel redireciona para `/skills/equipe`.

---

## Solução Proposta

### Fase 1: Remover Tabelas Duplicadas

Migração SQL para excluir as tabelas `*_squad`:

```sql
-- Remover tabelas duplicadas
DROP TABLE IF EXISTS public.entregas_squad CASCADE;
DROP TABLE IF EXISTS public.metricas_squad CASCADE;
DROP TABLE IF EXISTS public.roadmap_squad CASCADE;
DROP TABLE IF EXISTS public.membros_squad CASCADE;
DROP TABLE IF EXISTS public.squads CASCADE;
```

### Fase 2: Permitir Admin Visualizar Painel

Modificar `useSkillsLider.ts` para permitir que admin visualize o painel mesmo sem ser líder:

```typescript
// Antes
enabled: !!equipeId && isLider

// Depois - Permitir admin visualizar
enabled: !!equipeId && (isLider || (isAdmin && isViewingAs))
```

Arquivos a modificar:
- `src/hooks/useSkillsLider.ts` - Adicionar verificação de admin em simulação

### Fase 3: Criar Roadmap Padrão Quando Vazio

Modificar `SquadLiderPainel.tsx` para exibir roadmap padrão de 12 semanas quando não houver dados:

O código já tem fallback para cronograma vazio (linhas 277-300), mas precisa mostrar as 3 fases com nomes:
- Fase 1: Fundação (semanas 1-4)
- Fase 2: Expansão (semanas 5-8)
- Fase 3: Consolidação (semanas 9-12)

### Fase 4: Melhorar Estados Vazios

Adicionar mensagens visuais claras nos blocos sem dados:
- Gráficos: "Adicione métricas semanais para visualizar evolução"
- Ranking: "Nenhuma entrega atribuída ainda"
- Resumo de Impacto: Manter valores zerados (já funciona)

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useSkillsLider.ts` | Permitir admin em simulação acessar dados |
| `src/pages/squad/SquadLiderPainel.tsx` | Melhorar fallback do roadmap e estados vazios |
| Migração SQL | Remover tabelas `*_squad` duplicadas |

---

## Detalhes Técnicos

### useSkillsLider.ts

Adicionar imports e lógica de admin:

```typescript
import { useUserRole } from "./useUserRole";
import { useAdminViewContext } from "@/contexts/AdminViewContext";

export function useSkillsLider() {
  const { equipeId, isLider, isLoading: membroLoading } = useSkillsMembro();
  const { isAdmin } = useUserRole();
  const { isViewingAs, viewAs } = useAdminViewContext();
  
  // Admin pode visualizar em modo Skills
  const canAccess = isLider || (isAdmin && isViewingAs && viewAs === "skills");
  
  // Usar canAccess nas queries
  enabled: !!equipeId && canAccess
```

### SquadLiderPainel.tsx

Melhorar fallback do roadmap com fases nomeadas:

```typescript
// Roadmap padrão quando não há dados
const defaultRoadmap = [
  { id: "1", numeroFase: 1, nomeFase: "Fundação", semanaInicio: 1, semanaFim: 4, status: "pendente" },
  { id: "2", numeroFase: 2, nomeFase: "Expansão", semanaInicio: 5, semanaFim: 8, status: "pendente" },
  { id: "3", numeroFase: 3, nomeFase: "Consolidação", semanaInicio: 9, semanaFim: 12, status: "pendente" },
];

const roadmapDisplay = roadmap.length > 0 ? roadmap : defaultRoadmap;
```

Adicionar mensagens para gráficos vazios:

```typescript
// Se não há dados de métricas
{maturidadeChartData.every(d => d.maturidade === 0) && (
  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
    Registre métricas semanais para visualizar a evolução
  </div>
)}
```

---

## Resultado Esperado

1. Tabelas duplicadas removidas do banco
2. Admin pode visualizar painel em simulação Skills
3. Roadmap padrão de 12 semanas sempre visível
4. Estados vazios com mensagens orientativas
5. Estrutura visual completa exibida mesmo sem dados
