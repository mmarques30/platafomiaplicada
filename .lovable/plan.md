

# InsightSemanalCard para Business Parceria — Visão Geral

## Contexto

O insight IA já é armazenado na tabela `formulario_diagnostico` nos campos `insight_ia` (jsonb) e `insight_gerado_em` (timestamp). A edge function `gerar-insight-mentoria` recebe `formulario_id` e atualiza esses campos. O hook `useInsightIA` e o hook `useMentoriaForm` já existem.

## Plano

### 1. Novo componente: `src/components/mentoria/business/InsightSemanalCard.tsx`

- Usa `useBusinessUserId()` para obter o user_id correto (suporta simulação admin)
- Usa `useMentoriaForm` (ou query direta) para buscar o `formulario_diagnostico` do usuário
- Verifica se `insight_gerado_em` está nos últimos 7 dias
- **Com insight recente**: Card com `border-l-4 border-[#AFC040]`, label "INSIGHT DA SEMANA" (uppercase, text-[11px]), texto resumo do insight (campo `analise_perfil` ou `recomendacao_foco`), e data no rodapé
- **Sem insight recente**: Card com texto "Nenhuma análise esta semana" + botão "Gerar análise" que chama `supabase.functions.invoke('gerar-insight-mentoria', { body: { formulario_id } })`
- **Durante geração**: Exibe `SkeletonCard variant="list"`
- **Após geração**: Invalida query para exibir o novo insight sem reload

### 2. Editar `src/pages/Mentoria.tsx` (linhas 106-111)

Inserir `<InsightSemanalCard />` antes de `<BusinessROIChart />` no bloco Business Colaborativo:

```tsx
{isBusiness ? (
  <>
    <InsightSemanalCard />
    <BusinessROIChart />
    <BusinessReportsCard />
  </>
)}
```

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/mentoria/business/InsightSemanalCard.tsx` | Novo |
| `src/pages/Mentoria.tsx` | Editado — adiciona import + componente |

Nenhum componente existente é alterado. Nenhuma tabela ou migration necessária.

