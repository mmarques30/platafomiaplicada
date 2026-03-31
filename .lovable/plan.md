

# Hook useCountUp para animar KPI cards

## 1. Novo hook: `src/hooks/useCountUp.ts`
Criar conforme especificado — easeOutCubic, duration 700ms default, retorna inteiro animado.

## 2. Aplicar em `MentoriaHeroDashboard.tsx`
- `progressoGeral` (linha 84): substituir `{progressoGeral}` por `{useCountUp(progressoGeral)}`
- `tarefasPendentes` (linha 96): substituir `{tarefasPendentes}` por `{useCountUp(tarefasPendentes)}`

## 3. Aplicar em `WeeklyProgressCard.tsx`
- `data.videoCount` (linha 94): animar com useCountUp

## 4. Aplicar em `AcademyRoadmapEducacional.tsx`
- Conquistas grid (linhas 178, 182, 187, 192): animar `totalVideos`, `certificadosEmitidos.length`, `diasSequencia`, `totalProjetos`
- Trilha percentual (linhas 143, 219): animar `trilha.percentual` e `proximoObjetivo.percentual`

**Nota**: `BusinessVisaoRapida` não existe no código atual — será ignorado.

## Arquivos
- **Novo**: `src/hooks/useCountUp.ts`
- **Editados**: `MentoriaHeroDashboard.tsx`, `WeeklyProgressCard.tsx`, `AcademyRoadmapEducacional.tsx`

