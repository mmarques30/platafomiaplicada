

# Fix: Lógica de Saúde do Projeto mostrando "atrasado" em projeto recém-criado

## Problema

A lógica compara `progressoEntregas` (0% quando não há entregas concluídas) com `cronogramaPercentual` (% do tempo já decorrido desde `data_inicio`). Em um projeto recém-cadastrado, mesmo que tenha passado apenas 1 dia de um contrato de 6 meses, o cronograma já marca ~1% e como entregas = 0%, o sistema diz "-1% atrasado". É uma comparação injusta porque no início de um projeto não se espera ter entregas concluídas.

## Solução

**Arquivo**: `src/components/meu-sistema/ProjetoOverviewCards.tsx` (linhas 162-169)

Adicionar uma **zona de tolerância** proporcional ao início do projeto:

- Se o cronograma está abaixo de 15% (início do projeto), o status padrão é **"Saudável"** desde que não haja atraso grave (entregas muito abaixo do esperado)
- Aplicar uma margem de tolerância de 10% antes de classificar como "Em Risco"
- Quando `totalEntregas === 0` (nenhuma entrega cadastrada), mostrar **"Novo"** com trend neutro em vez de calcular atraso

### Lógica revisada

```typescript
let saude;
if (totalEntregas === 0) {
  // Projeto sem entregas cadastradas ainda
  saude = { label: "Novo", trend: "neutral", changeText: "Nenhuma entrega cadastrada" };
} else if (progressoEntregas > cronogramaPercentual + 10) {
  saude = { label: "Avançado", trend: "positive", changeText: `+${...}% à frente` };
} else if (progressoEntregas >= cronogramaPercentual - 10) {
  // Tolerância de 10% para considerar saudável
  saude = { label: "Saudável", trend: "positive", changeText: "Alinhado ao cronograma" };
} else if (cronogramaPercentual <= 15) {
  // Início do projeto — não marcar como risco
  saude = { label: "Saudável", trend: "neutral", changeText: "Projeto em fase inicial" };
} else {
  saude = { label: "Em Risco", trend: "negative", changeText: `${...}% atrasado` };
}
```

Isso evita que um projeto recém-criado apareça como "Em Risco" quando é esperado que não tenha entregas concluídas ainda.

