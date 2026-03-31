

# Unificar Business Sistemas com componentes reais

## Resumo
Substituir os placeholders estáticos do Business Sistemas por componentes reais já existentes, adicionar aba Evolução, e eliminar o roadmap hardcoded.

## Alterações em `src/pages/Mentoria.tsx`

### 1. Visão Geral: trocar IAplicadaVisaoGeral por BusinessVisaoRapida
Linha 105-106: substituir o bloco `isBusinessSistemas ? <IAplicadaVisaoGeral />` para que Business Sistemas use os mesmos componentes que Business Parceria (BusinessVisaoRapida + BusinessROIChart + BusinessReportsCard, sem BusinessProgressoConteudo que fica na aba Evolução).

Resultado: ambos os planos Business renderizam o mesmo bloco na aba Visão Geral.

### 2. Aba Evolução: habilitar para Business Sistemas
- Linha 53: mudar `showEvolucaoTab` de `isBusiness && !isBusinessSistemas` para `isBusiness` (ambos os planos)
- No conteúdo da aba Evolução (linha 142-145): manter `BusinessProgressoConteudo` para todos, mas renderizar `BusinessEvolucaoAprendizado` apenas para Parceria:
  ```
  <BusinessProgressoConteudo />
  {!isBusinessSistemas && <BusinessEvolucaoAprendizado />}
  ```

### 3. Roadmap: trocar IAplicadaRoadmap por BusinessExecutiveRoadmap
Linha 131-132: substituir `isBusinessSistemas ? <IAplicadaRoadmap />` por `<BusinessExecutiveRoadmap />` para ambos os planos Business. O `BusinessExecutiveRoadmap` já tem lógica de preview com banner âmbar quando sem contrato, e dados reais quando disponíveis.

### 4. Limpeza de imports
- Remover imports de `IAplicadaVisaoGeral` e `IAplicadaRoadmap` (linhas 23-24)
- Os arquivos dos componentes podem permanecer no repositório (sem risco, apenas código morto)

## Resultado final para Business Sistemas

```text
Aba Visão Geral:  BusinessVisaoRapida + BusinessROIChart + BusinessReportsCard
Aba Roadmap:      BusinessExecutiveRoadmap (dados reais ou preview com banner)
Aba Evolução:     BusinessProgressoConteudo (versão simplificada, sem EvolucaoAprendizado)
```

## Arquivos
- **Editado**: `src/pages/Mentoria.tsx` (imports + 3 blocos condicionais)

