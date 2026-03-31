

# Remover BusinessProgressoConteudo da aba Visão Geral

## Alteração única em `src/pages/Mentoria.tsx`

Na seção Business Parceria da aba "Visão Geral" (linhas ~107-112), remover `<BusinessProgressoConteudo />`, mantendo apenas:
- `<BusinessROIChart />`
- `<BusinessReportsCard />`

A aba "Evolução Aprendizado" permanece inalterada (já contém `BusinessProgressoConteudo` + `BusinessEvolucaoAprendizado`).

Nenhum outro arquivo é tocado. Nenhuma lógica de planos/roles muda.

