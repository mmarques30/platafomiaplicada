

# Adicionar progresso Business Parceria na página Evolução

## Problema
A página `/evolucao` (`Evolucao.tsx`) não exibe nenhum conteúdo específico para usuários Business Parceria. Ela usa `useEffectivePlan` mas só verifica `isAcademy` (para mostrar `BonusEvolucao`). Usuários como Paula (business_parceria) veem apenas o conteúdo genérico (Hero, Trilhas, Conquistas) sem o progresso do Business.

Os componentes `BusinessProgressoConteudo` e `BusinessEvolucaoAprendizado` existem mas só são usados na página `/mentoria`.

## Solução

**Arquivo: `src/pages/Evolucao.tsx`**

1. Importar `useEffectivePlan` com as flags `isBusiness`, `isBusinessParceria` (já usa o hook, só precisa extrair mais flags)
2. Importar `BusinessProgressoConteudo` de `@/components/mentoria/business/BusinessProgressoConteudo`
3. Importar `BusinessEvolucaoAprendizado` de `@/components/mentoria/business/BusinessEvolucaoAprendizado`
4. Na aba "minha-evolucao", adicionar seção condicional para Business Parceria:

```tsx
const { isAcademy, isBusinessParceria } = useEffectivePlan(isAdmin);

// Na TabsContent "minha-evolucao":
<HeroEvolucao />
{isBusinessParceria && <BusinessProgressoConteudo />}
{isBusinessParceria && <BusinessEvolucaoAprendizado />}
<TrilhasEmAndamentoCards />
<VitrineConquistas />
{isAcademy && <BonusEvolucao />}
```

Mudança simples em um único arquivo — adicionar 2 imports e 2 linhas condicionais.

