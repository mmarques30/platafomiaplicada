
# Plano: Diferenciação de Papéis no Skills (Líder vs Colaborador)

## Contexto

O módulo Skills já possui a estrutura de `papel` ("lider" ou "membro") na tabela `membros_equipe_skills`, porém atualmente:
1. Ambos os papéis veem exatamente as mesmas telas
2. O líder não tem visão diferenciada para acompanhar a equipe
3. Não existe painel de gestão exclusivo para o líder

O líder precisa:
- Ver TUDO que os colaboradores estão desenvolvendo
- Acompanhar evolução de cada membro individualmente
- Validar entregas (aprovar/rejeitar)
- Ver métricas de engajamento e produtividade
- Receber alertas de atrasos

## Funcionalidades por Papel

| Funcionalidade | Colaborador | Líder |
|----------------|-------------|-------|
| Preencher diagnóstico individual | Sim | Sim |
| Ver equipe e membros | Sim | Sim |
| Ver diagnóstico consolidado | Sim | Sim |
| Ver backlog da equipe | Sim | Sim |
| Ver roadmap | Sim | Sim |
| **Minhas Entregas** | Só as próprias | Todas da equipe |
| **Validar/Aprovar entregas** | Não | Sim |
| **Painel de Gestão** | Não | Sim |
| **Métricas de equipe** | Básico | Completo |
| **Alertas de atraso** | Não | Sim |

---

## Alterações Necessárias

### 1. Hook Central: `useSkillsMembro`

Criar um hook que retorna dados do membro atual incluindo seu papel:

```typescript
// src/hooks/useSkillsMembro.ts
export function useSkillsMembro() {
  // Retorna: equipe_id, papel ('lider' | 'membro'), isLider, cargo
  // Usado por todos os hooks e páginas Skills
}
```

### 2. Atualizar `useSkillsEntregas`

- **Colaborador**: Vê apenas suas próprias entregas (`responsavel_id = user.id`)
- **Líder**: Vê TODAS as entregas da equipe com nome do responsável

### 3. Atualizar `useSkillsEquipe`

- Já retorna `isLider`, manter
- Adicionar métricas de engajamento para líder (trilhas assistidas, entregas no prazo)

### 4. Nova Página: Painel do Líder

```
/skills/lider
```

Visão exclusiva com:
- Progresso individual de cada membro (diagnóstico, trilhas, entregas)
- Entregas aguardando validação
- Alertas de atraso
- Métricas consolidadas (horas economizadas, entregas concluídas vs planejadas)

### 5. Atualizar Página de Entregas

- Colaborador vê "Minhas Entregas" com foco na execução
- Líder vê "Entregas da Equipe" com filtro por membro e ação de validação

### 6. Atualizar Menu Lateral

Adicionar item de menu condicional para líderes:

```sql
-- Novo menu apenas para líderes
INSERT INTO menu_config (menu_key, label, url, icon, parent_key, planos_permitidos, ordem, tipo, visivel)
VALUES ('skills_lider', 'Painel do Líder', '/skills/lider', 'LayoutDashboard', 'meu_progresso', ARRAY['skills'], 38, 'sidebar', true);
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useSkillsMembro.ts` | Hook central com papel do usuário |
| `src/hooks/useSkillsLider.ts` | Dados agregados para visão do líder |
| `src/pages/skills/SkillsLiderDashboard.tsx` | Painel exclusivo do líder |
| `src/components/skills/lider/LiderProgressoMembro.tsx` | Card de progresso individual |
| `src/components/skills/lider/LiderEntregasValidacao.tsx` | Lista de entregas para validar |
| `src/components/skills/lider/LiderMetricasEquipe.tsx` | Gráficos de métricas |
| `src/components/skills/lider/LiderAlertasAtraso.tsx` | Alertas de atraso |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useSkillsEntregas.ts` | Lógica condicional por papel |
| `src/pages/skills/SkillsEntregas.tsx` | UI diferenciada para líder (validação) |
| `src/pages/skills/SkillsEquipe.tsx` | Métricas adicionais para líder |
| `src/App.tsx` | Nova rota `/skills/lider` |
| `src/components/layout/AppSidebar.tsx` | Exibir menu "Painel do Líder" apenas para líderes |

---

## Detalhamento Técnico

### Hook useSkillsMembro

```typescript
export function useSkillsMembro() {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["skills-membro", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id, papel, cargo, status")
        .eq("user_id", user.id)
        .eq("status", "ativo")
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    equipeId: data?.equipe_id,
    papel: data?.papel as "lider" | "membro" | null,
    isLider: data?.papel === "lider",
    isMembro: data?.papel === "membro",
    cargo: data?.cargo,
    isLoading,
  };
}
```

### useSkillsEntregas Atualizado

```typescript
export function useSkillsEntregas() {
  const { user } = useAuth();
  const { equipeId, isLider } = useSkillsMembro();

  const { data: entregas, isLoading } = useQuery({
    queryKey: ["entregas-skills", equipeId, isLider],
    queryFn: async () => {
      let query = supabase
        .from("entregas_skills")
        .select(`
          *,
          responsavel:responsavel_id (id, nome, avatar_url)
        `)
        .eq("equipe_id", equipeId);
      
      // Se não for líder, filtra apenas as próprias entregas
      if (!isLider) {
        query = query.eq("responsavel_id", user.id);
      }
      
      return (await query).data || [];
    },
    enabled: !!equipeId,
  });

  return { entregas, isLoading, isLider };
}
```

### Hook useSkillsLider (Exclusivo)

```typescript
export function useSkillsLider() {
  const { equipeId, isLider } = useSkillsMembro();
  
  // Entregas aguardando validação
  const { data: entregasParaValidar } = useQuery({...});
  
  // Progresso de cada membro (diagnóstico, trilhas, entregas)
  const { data: progressoMembros } = useQuery({...});
  
  // Métricas consolidadas
  const { data: metricas } = useQuery({...});
  
  // Alertas de atraso
  const { data: alertas } = useQuery({...});
  
  return { entregasParaValidar, progressoMembros, metricas, alertas };
}
```

### Fluxo de Validação de Entrega

1. Colaborador submete entrega → status muda para `aguardando_validacao`
2. Líder vê na aba "Para Validar" no painel
3. Líder clica em "Aprovar" ou "Rejeitar"
4. Se aprovado: `status = 'aprovada'`, `aprovado_por = lider_id`, `aprovado_em = now()`
5. Se rejeitado: status volta para `em_andamento` com feedback

### Menu Condicional para Líder

No AppSidebar, adicionar lógica para mostrar "Painel do Líder" apenas quando `isLider`:

```typescript
// Buscar papel do usuário no Skills
const { isLider: isSkillsLider } = useSkillsMembro();

// Filtrar menu - se for skills_lider e não for líder, ocultar
const filteredMenus = sidebarMenus.filter(menu => {
  if (menu.menu_key === 'skills_lider' && !isSkillsLider) {
    return false;
  }
  return true;
});
```

---

## Painel do Líder - Layout

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Painel do Líder                                              [Equipe XYZ]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│  │ Para Validar    │ │ Entregas Mês    │ │ Horas Econom.   │ │ Alertas    │ │
│  │      3          │ │    12/18        │ │     24h         │ │    2       │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └────────────┘ │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │ Entregas Aguardando Validação                                            │
│  │ ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ │ [Avatar] João - "Automatizar relatório X"   [Ver] [Aprovar][Rejeitar] │ │
│  │ │ [Avatar] Maria - "Criar dashboard Y"        [Ver] [Aprovar][Rejeitar] │ │
│  │ └─────────────────────────────────────────────────────────────────────┘  │
│  │                                                                           │
│  │ Progresso da Equipe                                                      │
│  │ ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ │ [Avatar] João    Diagnóstico: ✓  Trilhas: 60%  Entregas: 3/5       │  │
│  │ │ [Avatar] Maria   Diagnóstico: ✓  Trilhas: 45%  Entregas: 2/4       │  │
│  │ │ [Avatar] Pedro   Diagnóstico: ⏳ Trilhas: 0%   Entregas: 0/3   ⚠️  │  │
│  │ └─────────────────────────────────────────────────────────────────────┘  │
│  └──────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┤
│  │ Métricas do Projeto                        [Gráfico de evolução 12sem] │  │
│  └──────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Ordem de Implementação

### Fase 1: Hook Central e Menu
1. Criar `useSkillsMembro.ts`
2. Adicionar menu "Painel do Líder" no banco (condicional)
3. Atualizar AppSidebar para ocultar menu para não-líderes

### Fase 2: Painel do Líder
4. Criar página `SkillsLiderDashboard.tsx`
5. Criar hook `useSkillsLider.ts`
6. Implementar componentes do painel (progresso, validação, métricas)

### Fase 3: Validação de Entregas
7. Atualizar `useSkillsEntregas.ts` com lógica de papel
8. Adicionar mutation para aprovar/rejeitar entrega
9. Atualizar `SkillsEntregas.tsx` com UI de validação para líder

### Fase 4: Métricas e Alertas
10. Criar lógica de cálculo de métricas
11. Implementar alertas de atraso
12. Adicionar gráficos de evolução
