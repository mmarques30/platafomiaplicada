
# Fix: Ação principal do plano gratuito/visitante

## Problema
Linha 80 usa `trilhaIniciada` como critério de conclusão para visitantes (`plano === null`), mas visitantes não têm acesso a trilhas. O critério correto é `video_visto`.

## Alteração

**Arquivo**: `src/pages/admin/OnboardingMonitor.tsx`

**Linha 80** — trocar `trilhaIniciada` por `videoVisto`:
```tsx
// De:
    trilhaIniciada;
// Para:
    videoVisto;
```

Isso faz com que a última linha do ternário (fallback para `plano === null`) use `videoVisto` em vez de `trilhaIniciada`. A contagem do funil visual ("Ação principal") já deriva de `rows.filter(r => r.acaoConcluida)`, então refletirá automaticamente a correção.

Nenhuma outra alteração.
