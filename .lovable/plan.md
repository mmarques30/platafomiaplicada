## Problema

O build do deploy falhou porque o bundle `assets/index-sL9mcLWa.js` tem 13.2 MB e o limite atual de precache do PWA está em 12 MB (`maximumFileSizeToCacheInBytes: 12 * 1024 * 1024` em `vite.config.ts`).

Além disso, o publish anterior foi bloqueado por 4 findings críticos de segurança (RLS) que precisam ser resolvidos antes de subir.

## Mudanças propostas

### 1. Desbloquear o build (rápido)
Em `vite.config.ts`, aumentar o limite para 20 MB:

```ts
workbox: {
  maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
  ...
}
```

Isso resolve a falha imediata. (Observação: o bundle de 13 MB é grande — vale considerar code-splitting num passo futuro, mas fora do escopo deste deploy.)

### 2. Corrigir os 4 findings críticos de segurança (RLS)

a) **`materiais_comunidade`** — política SELECT atual permite `{public}` ler todos materiais ativos, inclusive `visibilidade='pago'`. Nova política: exigir `auth.uid() IS NOT NULL` E (`visibilidade <> 'pago'` OU usuário tem plano pago).

b) **`webhook_lia_logs`** — SELECT atual `USING (true)` expõe dados de pagamento (emails, payloads) a qualquer autenticado. Restringir SELECT a `has_role(auth.uid(), 'admin')`.

c) **Storage `entregas-equipe-skills`** — políticas só checam `auth.role()='authenticated'`. Adicionar verificação de membership via join com `membros_equipe_skills` usando o path do arquivo (primeiro segmento = `equipe_id`).

d) **`avaliacoes_materiais_comunidade`** + **`video_ratings`** (warns, mas vale corrigir junto) — restringir SELECT a `auth.uid() IS NOT NULL`.

Tudo via nova migration timestampada em `supabase/migrations/`.

### 3. Republicar
Após build verde + migration aplicada, chamar publish novamente para o domínio `plataforma.iaplicada.com` / `platafomiaplicada.lovable.app`.

## Pergunta antes de prosseguir

Posso aplicar **todas** as correções de RLS acima (itens 2a–2d) na mesma migration, ou prefere que eu **só** suba o fix do build (item 1) e ignore os findings de segurança temporariamente pra publicar mais rápido?
