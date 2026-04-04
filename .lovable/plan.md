

# Tracking de funil de onboarding

## Resumo
Criar tabela `onboarding_eventos`, hook `useOnboardingTracking`, e integrar chamadas de `track()` em 8 componentes/páginas existentes.

## Arquivos

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar tabela `onboarding_eventos` + RLS |
| `src/hooks/useOnboardingTracking.ts` | Criar hook |
| `src/components/onboarding/OnboardingVideo.tsx` | Editar — track `video_visto` |
| `src/components/dashboard/DashboardTour.tsx` | Editar — track `tour_concluido` |
| `src/components/onboarding/ProximosPassosCard.tsx` | Editar — track `proximos_passos_vistos` |
| `src/pages/MentoriaDiagnostico.tsx` | Editar — track `diagnostico_iniciado` |
| `src/pages/skills/SkillsDiagnostico.tsx` | Editar — track `skills_diagnostico_iniciado` |
| `src/components/evolucao/TrilhaDisponivelCard.tsx` | Editar — track `trilha_iniciada` |
| `src/pages/Mentoria.tsx` | Editar — track `roadmap_visitado` (1x via localStorage) |
| `src/pages/MeuSistema.tsx` | Editar — track `sistema_visitado` (1x via localStorage) |

## Detalhes técnicos

### Migration
```sql
CREATE TABLE onboarding_eventos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plano text,
  evento text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE onboarding_eventos ENABLE ROW LEVEL SECURITY;
-- Users insert own, admins/equipe read all
```

### useOnboardingTracking.ts
- Importa `useAuth` e `useEffectivePlan` (de `useUserPlan`)
- Expõe `track(evento)` que faz insert silencioso na tabela
- Tipo `OnboardingEvento` com 8 valores possíveis

### Integrações nos componentes
Cada componente recebe `const { track } = useOnboardingTracking()` e chama no momento correto:
- **OnboardingVideo**: `handleEnter` → `track('video_visto')`
- **DashboardTour**: `TOUR_END` callback → `track('tour_concluido')`
- **ProximosPassosCard**: `handleClose` → `track('proximos_passos_vistos')`
- **MentoriaDiagnostico**: `useEffect` no mount (quando form carrega) → `track('diagnostico_iniciado')`
- **SkillsDiagnostico**: `useEffect` no mount → `track('skills_diagnostico_iniciado')`
- **TrilhaDisponivelCard**: onClick do botão "Iniciar trilha" → `track('trilha_iniciada')`
- **Mentoria**: `useEffect` + localStorage `roadmap_visto_${user?.id}` → `track('roadmap_visitado')`
- **MeuSistema**: `useEffect` + localStorage `sistema_visto_${user?.id}` → `track('sistema_visitado')`

Nenhuma lógica existente é alterada. Apenas chamadas adicionais de tracking.

