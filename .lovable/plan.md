
# Restaurar seção Roadmap no scroll contínuo do Business Parceria

## Problema

No plano anterior, a seção Roadmap foi removida do layout de scroll contínuo do Business Parceria. A JornadaStrip (linha do tempo com círculos numerados) foi corretamente removida, mas o Roadmap (componente `BusinessExecutiveRoadmap` ou equivalente) precisa voltar como seção no scroll.

## O que será feito

**Arquivo**: `src/pages/Mentoria.tsx`

1. **Restaurar a seção Roadmap entre Visão Geral e Evolução** no bloco `isBusinessParceria`:

```tsx
<section id="sec-visao-geral" className="scroll-mt-28 mt-6 space-y-4">
  <h2>Visão Geral</h2>
  <BusinessVisaoGeralGrid />
</section>

{/* ADICIONAR DE VOLTA */}
<section id="sec-roadmap" className="scroll-mt-28 mt-10 space-y-4">
  <h2>Roadmap</h2>
  <AcademyRoadmapEducacional />  {/* ou BusinessExecutiveRoadmap se existir */}
</section>

<section id="sec-evolucao" className="scroll-mt-28 mt-10 space-y-4">
  ...
</section>
```

2. **Atualizar nav-pills** — restaurar "Roadmap" nos arrays:
   - `sectionLabels`: `['Visão Geral', 'Roadmap', 'Evolução']`
   - `sectionIds`: `['visao-geral', 'roadmap', 'evolucao']`

3. **Atualizar IntersectionObserver** — incluir `'roadmap'` no array de IDs observados (linha 80)

4. **Reativar submenu no sidebar** — remover `'meu_progresso_roadmap'` da lista `hiddenByEnvironment.business_parceria` em `useMenuConfig.tsx`

O componente de Roadmap usado será o mesmo que aparece na aba Roadmap para outros ambientes (provavelmente `AcademyRoadmapEducacional` ou `BusinessExecutiveRoadmap`, dependendo do que existia antes da remoção).
