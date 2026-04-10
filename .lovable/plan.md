
Após revisar o código, o `JornadaStrip` do topo já está condicionado para aparecer só em `Business Sistemas` e `Academy`:

- `isBusinessSistemas && estagiosBusiness && <JornadaStrip ... />`
- `isAcademy && <JornadaStrip ... />`

Então, no `Business Parceria`, o problema visual mais provável não é o `JornadaStrip` em si, e sim o componente que foi recolocado dentro da seção Roadmap: hoje o `Business Parceria` está usando `AcademyRoadmapEducacional`, que mostra cards de estágios e fica com cara de “jornada”.

Plano de correção:

1. Em `src/pages/Mentoria.tsx`, manter o `JornadaStrip` oculto para `Business Parceria` exatamente como está hoje.
2. Trocar a seção `sec-roadmap` do bloco `isBusinessParceria` para usar o componente correto de roadmap business:
   - de: `AcademyRoadmapEducacional`
   - para: `BusinessExecutiveRoadmap`
3. Adicionar o import de `BusinessExecutiveRoadmap` em `Mentoria.tsx`.
4. Manter o restante intacto:
   - `Roadmap` continua visível no menu/sidebar
   - `Academy` continua usando `AcademyRoadmapEducacional`
   - `Business Sistemas` continua usando `IAplicadaRoadmap`
5. Aproveitar para corrigir a navegação por URL no `Business Parceria`:
   - quando entrar em `/mentoria?tab=roadmap`, fazer scroll automático para `#sec-roadmap`
   - limpar o `tab` da URL depois do scroll
   - manter o comportamento já existente de `evolucao-aprendizado`

Resultado esperado:
- o Roadmap continua existindo no `Business Parceria`
- a “jornada strip”/visual de estágios não volta nesse contexto
- o conteúdo do Roadmap passa a ser o roadmap business, mais coerente com esse plano
- clicar em “Roadmap” no menu leva direto para a seção correta no layout de scroll contínuo
