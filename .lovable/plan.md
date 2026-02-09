
# Backend estruturado para Projeto Skills: dados reais sem mocks

## Objetivo

Transformar as 3 abas do Projeto Skills (Visao Geral, Performance, Diagnostico) para funcionar com dados reais do banco, removendo todos os dados mockados, e garantindo que as paginas continuem visiveis e funcionais mesmo quando nao ha dados.

## Situacao atual

- **Dados reais**: A equipe "Inovacao" tem 3 membros (Lucio, Livia, Antonio), 0 diagnosticos preenchidos, 0 entregas
- **Performance**: Usa `getMockPerformanceData()` como fallback quando `hook.entregas.length === 0`
- **Diagnostico**: O componente `DiagnosticoResults` usa constantes MOCK_* hardcoded (MOCK_PROFILE, MOCK_PROCESSOS, MOCK_ECONOMIA, etc.)
- **Visao Geral** (`ProjetoSkills.tsx`): E apenas um placeholder com texto "Em breve"
- **Edge function** `processar-diagnostico-skills`: Ja funciona com Lovable AI (Gemini) e salva resultados no banco

## Plano de alteracoes

### 1. Visao Geral (`src/pages/skills/ProjetoSkills.tsx`) - REESCREVER

Transformar de placeholder para um dashboard resumo com:

**Secao A - Diagnostico da Equipe:**
- Barra de progresso mostrando quantos membros ja preencheram o diagnostico (ex: "2 de 3 membros")
- Lista dos membros com status (preenchido/pendente) usando icones de check/pendente
- Botao "Preencher Meu Diagnostico" que leva para `/skills/projeto/diagnostico` (aparece apenas se o usuario logado ainda nao preencheu)
- Mensagem de conclusao quando todos preencheram

**Secao B - Resumo de Performance (cards simples):**
- Total de horas economizadas
- Entregas concluidas / total
- ROI acumulado
- Semana atual do programa
- Quando nao ha dados: mostra "0" nos valores, sem mock

**Secao C - Acesso rapido:**
- Card linkando para Performance (`/skills/projeto/performance`)
- Card linkando para Diagnostico (`/skills/projeto/diagnostico`)

**Hook necessario**: Criar `useSkillsVisaoGeral.ts` que busca:
- Membros da equipe + status de diagnostico de cada um
- KPIs resumidos (reutilizando dados do `useSkillsLider`)

### 2. Performance (`src/components/skills/ProjetoSkillsPerformance.tsx`) - REMOVER MOCKS

**Remover**: `mockPerformanceData.ts` e toda referencia a mocks

**Ajustar o componente para**:
- Usar SOMENTE dados do hook `useSkillsLider`
- Quando nao ha dados (entregas vazia, metricas zeradas): mostrar os mesmos cards e graficos, mas com valores zerados e mensagens tipo "Nenhuma entrega registrada ainda"
- Ranking: quando vazio, mostrar um empty state em vez de ocultar
- Graficos: mostrar eixos vazios (dados zerados) em vez de esconder

### 3. Diagnostico (`src/components/skills/ProjetoSkillsDiagnostico.tsx`) - AJUSTAR FLUXO

**Remover mocks de `DiagnosticoResults.tsx`**:
- Eliminar MOCK_PROFILE, MOCK_PROCESSOS, MOCK_ECONOMIA, MOCK_TRILHA, MOCK_INSIGHTS, MOCK_EQUIPE
- Quando `hasRealData = false`: mostrar um empty state clean dizendo "Preencha o diagnostico para ver seus resultados"
- O botao de "Preencher Diagnostico" ja existe no fluxo

**Ajustar fluxo de estado em `ProjetoSkillsDiagnostico.tsx`**:
- Estado inicial deve ser `"form"` (nao `"results"`) quando usuario nao tem diagnostico preenchido
- So mostrar results quando `diagnostico?.completado && hasInsight`

**Banner "Aguardando Equipe" em `DiagnosticoResults.tsx`**:
- Substituir MOCK_EQUIPE por dados reais: buscar membros da equipe e status de preenchimento
- Mostrar barra de progresso real
- Listar nomes reais dos que faltam preencher

### 4. Hook novo: `useSkillsEquipeDiagnostico.ts`

Hook dedicado para buscar o status de diagnostico de todos os membros da equipe:

```typescript
// Retorna:
{
  membros: Array<{
    userId: string;
    nome: string;
    avatar: string | null;
    completado: boolean;
    hasInsight: boolean;
  }>;
  totalMembros: number;
  diagnosticosCompletos: number;
  todosPreencheram: boolean;
  isLoading: boolean;
  meuDiagnosticoCompleto: boolean;
}
```

Consultas:
- `membros_equipe_skills` JOIN `profiles` para nomes
- `diagnosticos_skills` para status de cada membro
- Filtrar pela equipe do usuario logado (via `useSkillsMembro`)

### 5. Arquivo `mockPerformanceData.ts` - DELETAR

Remover completamente o arquivo de mocks.

## Arquivos

### Criar
- `src/hooks/useSkillsEquipeDiagnostico.ts` - Hook para status de diagnostico da equipe
- `src/components/skills/visao-geral/` - Pasta com componentes da Visao Geral:
  - `DiagnosticoEquipeCard.tsx` - Card com barra de progresso e lista de membros
  - `ResumoPerformanceCards.tsx` - KPIs resumidos
  - `AcessoRapidoCards.tsx` - Links para Performance e Diagnostico

### Modificar
- `src/pages/skills/ProjetoSkills.tsx` - De placeholder para dashboard real
- `src/components/skills/ProjetoSkillsPerformance.tsx` - Remover fallback de mocks, usar empty states
- `src/components/skills/ProjetoSkillsDiagnostico.tsx` - Corrigir estado inicial
- `src/components/skills/diagnostico/DiagnosticoResults.tsx` - Remover mocks, usar dados reais para banner de equipe

### Deletar
- `src/components/skills/performance/mockPerformanceData.ts`

## Regras de empty state

Todas as abas devem continuar visiveis e navegaveis. Quando nao ha dados:
- **KPIs**: Mostram "0h", "0%", "0/0" 
- **Graficos**: Renderizam com eixos mas sem dados (barras/areas zeradas)
- **Tabelas/Rankings**: Mostram mensagem "Nenhum dado disponivel ainda"
- **Diagnostico sem preenchimento**: Mostra botao para preencher, nao os resultados mockados
- **Nenhuma informacao some** — tudo e visivel, apenas sem valores fictcios

## Nenhuma alteracao de banco de dados necessaria

As tabelas `diagnosticos_skills`, `entregas_skills`, `metricas_skills`, `membros_equipe_skills` e `equipes_skills` ja possuem toda a estrutura necessaria. O hook `useSkillsLider` ja faz todas as queries. Apenas precisamos parar de usar mocks e mostrar dados reais (ou empty states).
