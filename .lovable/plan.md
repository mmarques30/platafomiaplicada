

# Remover "Economia Estimada" duplicada dos cards de projeto

## Problema

O campo "Economia Estimada (h/semana)" aparece como informacao fixa nos cards e detalhes do projeto, mas essa mesma informacao ja esta presente na calculadora de ROI. Isso gera duplicidade.

## Alteracoes

### 1. `src/components/skills/backlog/BacklogCard.tsx`
- Remover o bloco que exibe `horas_estimadas_economia` com icone de relogio (linhas 74-79)
- O card continuara mostrando area impactada e prioridade

### 2. `src/components/skills/backlog/BacklogTable.tsx`
- Remover a coluna "Economia Estimada" da tabela (linha 106)
- Remover o TableHead correspondente

### 3. `src/components/skills/backlog/ProjetoDetailModal.tsx`
- Remover o bloco de "Economia Estimada" da secao de informacoes do projeto (linhas 358-365), pois ja aparece na aba/secao de ROI (linhas 572-575 e no calculo de ROI linha 622+)
- Manter a informacao na secao de ROI/calculadora onde ela ja existe

## O que NAO sera alterado

- A secao de ROI no `ProjetoDetailModal` continua mostrando a economia estimada (linhas 572-575)
- O campo no formulario `AddProjetoModal` continua existindo para cadastro
- Os calculos de ROI que usam `horas_estimadas_economia` permanecem intactos

