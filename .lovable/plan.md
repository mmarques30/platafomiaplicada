

# Reescrever DashboardCommandStrip com KPIs visuais e useCountUp

## Visão geral

Reescrever completamente o componente para seguir o layout especificado: coluna esquerda (nome + semana/plano), coluna direita com 3 KPI cards coloridos + botão CTA verde. Cada KPI tem valor animado via `useCountUp`, label uppercase, e cor específica. Visitantes retornam `null`.

## Alteração

**Arquivo**: `src/components/dashboard/DashboardCommandStrip.tsx` — reescrita completa

### Estrutura JSX

- Container: `bg-card border border-border rounded-xl py-3.5 px-5`, flex row justify-between
- Esquerda: nome completo (17px medium) + subtexto "Semana X · Plano" (12px muted)
- Direita: flex row com 3 KPI blocks + botão CTA
- Cada KPI: valor com `useCountUp(valor, 600)` na cor especificada + label uppercase 11px muted
- Separadores verticais (`h-8 w-px bg-border`) entre KPIs
- Botão CTA: `background: #AFC040`, `color: #0C0F0A`, 13px, 8px 16px padding, border-radius 8px

### Subcomponentes internos

1. **BusinessKPIs** — usa `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useTasksByUser`, `useMentoriaSessoes`
   - KPI1: `% roadmap` (#2CBBA6) — etapas concluídas / total
   - KPI2: `tarefas críticas` (#E8A43C) — prioridade alta/urgente + pendente
   - KPI3: `próx. sessão` (#AFC040) — dia da semana (ex: "Sex") ou "—"
   - CTA: "Ver sessão →" → `/mentoria/sessoes`

2. **AcademyKPIs** — query `progresso_videos` + conquistas hardcoded (como em EvolucaoConquistas)
   - KPI1: `vídeos esta semana` (#2CBBA6) — completados nos últimos 7 dias
   - KPI2: `trilhas em andamento` (#E8A43C) — módulos com progresso incompleto
   - KPI3: `conquistas` (#AFC040) — contagem calculada como em VitrineConquistas/EvolucaoConquistas (baseada em progressoGeral)
   - CTA: "Continuar trilha →" → `/trilhas`

3. **SkillsKPIs** — usa `useSkillsEquipe` (membros) e `useSkillsEntregas` (entregas)
   - KPI1: `membros ativos` (#2CBBA6) — `membros.length`
   - KPI2: `entregas pendentes` (#E8A43C) — entregas com status pendente
   - KPI3: `progresso %` (#AFC040) — entregas concluídas / total
   - CTA: "Ver equipe →" → `/skills/equipe`

### KpiBlock component

```tsx
function KpiBlock({ value, label, color }: { value: number; label: string; color: string }) {
  const animated = useCountUp(value, 600);
  const display = label.includes("%") ? `${animated}%` : String(animated);
  // For session day (string), pass as-is without useCountUp
}
```

Para o KPI3 do Business (dia da semana = string), usar variante sem useCountUp — exibir o texto diretamente.

### Visitante

`useUserPlan` → se `!plan` e não é business/academy/skills, retorna `null`.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/DashboardCommandStrip.tsx` | Reescrito |

Nenhum outro arquivo alterado.

