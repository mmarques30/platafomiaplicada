

# Remover seção Roadmap do Business Parceria

## O que será feito

Remover a seção "Roadmap" e o componente `BusinessExecutiveRoadmap` da página de Mentoria para o plano Business Parceria, que usa layout de scroll contínuo.

## Arquivo: `src/pages/Mentoria.tsx`

1. **Remover da nav-pill sticky** — reduzir `sectionLabels` e `sectionIds` de 3 para 2 itens: `['Visão Geral', 'Evolução']` e `['visao-geral', 'evolucao']`

2. **Remover a seção roadmap** — apagar o bloco inteiro (linhas 177-180):
   ```
   <section id="sec-roadmap">
     <h2>Roadmap</h2>
     <BusinessExecutiveRoadmap />
   </section>
   ```

3. **Remover do IntersectionObserver** — atualizar o array `sectionIds` na linha 80 de `['visao-geral', 'roadmap', 'evolucao']` para `['visao-geral', 'evolucao']`

4. **Limpar import** — remover `BusinessExecutiveRoadmap` (linha 25) se não for usado em outro lugar

