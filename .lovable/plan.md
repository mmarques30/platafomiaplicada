

# Loading state para KPIs do WelcomeHeader

## Alteração

**Arquivo**: `src/components/dashboard/WelcomeHeader.tsx`

### 1. Extrair `isLoading` dos hooks existentes

- Linha 73: `const { contrato }` → `const { contrato, isLoading: isLoadingContrato }`
- Linha 75: `const { data: etapas }` → `const { data: etapas, isLoading: isLoadingEtapas }`
- Linha 77: `const { data: tasks }` → `const { data: tasks, isLoading: isLoadingTasks }`
- Linha 78: `const { sessoes }` → `const { sessoes, isLoading: isLoadingSessoes }`
- Linha 81: `const { data: academyData }` → `const { data: academyData, isLoading: isLoadingAcademy }`
- Linha 107: `const { data: skillsData }` → `const { data: skillsData, isLoading: isLoadingSkills }`

### 2. Computar `isLoadingKpis` (após linha 132)

```ts
const isLoadingKpis =
  (isBusiness && (isLoadingContrato || isLoadingEtapas || isLoadingTasks || isLoadingSessoes))
  || (isAcademy && isLoadingAcademy)
  || (isSkills && isLoadingSkills);
```

### 3. Alterar `showKpis` para também mostrar durante loading

```ts
const showKpis = !isVisitante && (hasKpis || isLoadingKpis);
```

### 4. Nos 3 valores de KPI (linhas 236-237, 248-249, 260-261), renderizar placeholder quando loading

Substituir `{kpi1Display}` por:
```tsx
{isLoadingKpis ? (
  <div style={{ width: 40, height: 22, background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: 'kpiPulse 1.2s ease-in-out infinite', margin: '0 auto' }} />
) : kpi1Display}
```

Mesmo padrão para kpi2Display e kpi3Display.

### 5. Adicionar keyframe CSS inline via `<style>` no componente (ou usar um `useEffect` para injetar)

Adicionar no topo do return, antes do JSX principal:
```tsx
<style>{`@keyframes kpiPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
```

Nenhuma outra lógica ou JSX alterado.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editado — loading state nos KPIs |

