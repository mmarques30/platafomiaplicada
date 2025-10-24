-- Inserir 9 novos prompts na biblioteca

-- COMUNICAÇÃO & ESCRITA (ordem 8-9)

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  '50 Páginas → 1 Página de Decisão',
  'Extrai só o que importa para quem decide',
  'Comunicação & Escrita',
  'Você é um Chief of Staff executivo. Leia este documento e extraia apenas o que importa para DECISÃO:

[COLE DOCUMENTO/URL/PDF]

QUEM VAI LER: [Diretor/VP/CEO]
DECISÃO NECESSÁRIA: [Aprovar/Rejeitar/Alocar recursos/Etc]

FORMATO OBRIGATÓRIO:

**EM 1 FRASE: O que este documento pede?**
[Resposta direta]

**POR QUE AGORA?**
[Urgência/contexto em 2 linhas]

**NÚMEROS QUE IMPORTAM**
- Investimento: R$ [X]
- Retorno esperado: R$ [Y] em [Z] meses
- Risco: [Alto/Médio/Baixo] - [1 linha explicando]

**SE APROVAR**
✓ [Benefício 1]
✓ [Benefício 2]
✗ [Trade-off/custo]

**SE REJEITAR**
✗ [Consequência 1]
✗ [Consequência 2]

**RECOMENDAÇÃO**
[Aprovar/Rejeitar/Aprovar com condições]
Justificativa: [2 linhas]

**PRÓXIMO PASSO**
[Ação concreta + responsável + prazo]

REGRAS:
- Elimine contexto desnecessário
- Destaque riscos escondidos
- Se o documento não tem dados, sinalize
- Máximo 250 palavras',
  8,
  'intermediario',
  '["resumo", "executivo", "decisão"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  'fd0eaceb-4dc7-4210-a653-d6b7237c439a',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  'Proposta Focada em ROI (Não em Features)',
  'Gera proposta que fala a língua do cliente',
  'Comunicação & Escrita',
  'Crie proposta comercial persuasiva usando a metodologia "Problema-ROI-Prova-Ação":

CLIENTE: [Nome e setor]
DOR DELES: [O problema que enfrentam]
NOSSA SOLUÇÃO: [O que oferecemos em 1 frase]
INVESTIMENTO: R$ [valor]
PRAZO DE ENTREGA: [X semanas]

GERE PROPOSTA ASSIM:

---
# PROPOSTA: Como [Cliente] Pode [Resultado Específico] em [Prazo]

## O CUSTO DE NÃO RESOLVER ISSO

Atualmente, [Cliente] está perdendo:
- R$ [X]/mês em [desperdício específico]
- [Y] horas/semana em [processo ineficiente]
- [Z]% de [oportunidade perdida]

**Custo anual do problema:** R$ [calcular total]

## A SOLUÇÃO PROPOSTA

Implementaremos [solução] que entregará:

| O Que Muda | Antes | Depois | Ganho |
|------------|-------|--------|-------|
| [Métrica 1] | [Val] | [Val] | [%] |
| [Métrica 2] | [Val] | [Val] | [%] |
| [Métrica 3] | [Val] | [Val] | [%] |

## RETORNO DO INVESTIMENTO
```
Investimento: R$ [valor]
Economia mensal: R$ [calcular]
Payback: [X] meses
ROI em 12 meses: [Y]%
```

## COMO FUNCIONA

**Fase 1** (Semanas 1-2): [Etapa + resultado]
**Fase 2** (Semanas 3-4): [Etapa + resultado]
**Fase 3** (Semana 5+): [Entrega + suporte]

## GARANTIA

Se não atingirmos [métrica específica] em [prazo], [garantia clara].

## PRÓXIMO PASSO

[CTA específico: reunião/assinatura/aprovação + data]

**Validade desta proposta:** [Data]

---

REGRAS:
- Fale de resultado, não de features
- Quantifique tudo (mesmo estimativas)
- Cliente precisa ver o dinheiro voltando
- Se não souber valor exato, estime conservadoramente',
  9,
  'avancado',
  '["proposta", "vendas", "roi"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '0c4d2a48-4a3b-4ec2-92c9-6b7bb7cdeb3a',
  true
);

-- ANÁLISE DE DADOS (ordem 1-7)

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  '"Quero Calcular X" → Fórmula Pronta',
  'Gera fórmula com explicação em português claro',
  'Análise de Dados',
  'Você ensina Excel para quem tem medo de fórmulas. Crie fórmula simples para:

QUERO CALCULAR: [Descreva em linguagem natural]

MINHA PLANILHA:
Coluna A: [O que tem]
Coluna B: [O que tem]
Coluna C: [O que tem]

EXEMPLO DE LINHA:
A2: [valor exemplo] | B2: [valor exemplo] | C2: [valor exemplo]

GERE:

### FÓRMULA PARA COLAR
```
=[fórmula completa]
```
**Onde colar:** Célula [D2]

### EXPLICAÇÃO SIMPLES
Esta fórmula faz 3 coisas:
1. [Passo 1 em português claro]
2. [Passo 2 em português claro]
3. [Passo 3 em português claro]

### COMO USAR
1. Cole a fórmula na célula D2
2. Clique no cantinho da célula
3. Arraste até a última linha com dados
4. Pronto! ✓

### TESTANDO SE FUNCIONOU
Com os valores do exemplo:
- A2 = [valor]
- B2 = [valor]
- D2 deve mostrar = [resultado esperado]

Se não deu isso, confira:
- Vírgulas estão corretas (não pontos)
- Nomes das colunas estão certos
- Não tem espaço extra

### VARIAÇÃO ÚTIL
Se você também quiser [variação comum]:
Use esta fórmula: [variação]

REGRAS:
- Explicação para quem não é técnico
- Português, nunca inglês (SE, não IF)
- Exemplo concreto sempre',
  1,
  'iniciante',
  '["excel", "fórmula", "simples"]'::jsonb,
  '["ChatGPT", "Claude"]'::jsonb,
  'fce91866-e382-4f59-bd66-a954827e8bd8',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  'Dados Sujos → Dados Limpos (Guia Passo a Passo)',
  'Identifica problemas e diz como corrigir',
  'Análise de Dados',
  'Você é especialista em qualidade de dados. Ensine-me a limpar esta planilha bagunçada:

[COLE AMOSTRA DOS DADOS - primeiras 10 linhas]

ANÁLISE DE QUALIDADE:

## PROBLEMAS ENCONTRADOS

**🔴 CRÍTICO (Corrigir JÁ)**
1. [Problema] - Encontrado em [X linhas]
   → Impacto: [Por que isso é ruim]
   → Como corrigir: [Passo a passo simples]

**🟡 ATENÇÃO (Corrigir Esta Semana)**
2. [Problema] - [Descrição]
   → Como corrigir: [Passo a passo]

**🟢 MELHORIA (Nice to Have)**
3. [Problema menor]
   → Como melhorar: [Sugestão]

## COMO LIMPAR (FAÇA NESTA ORDEM)

### Passo 1: Remover Duplicatas
1. Selecione toda a planilha (Ctrl+A)
2. Vá em Dados > Remover Duplicatas
3. Marque todas as colunas
4. Clique OK
→ Você vai ver quantas linhas foram removidas

### Passo 2: Padronizar [Problema Específico]
[Instruções claras e visuais]

### Passo 3: Preencher Valores Faltantes
[Estratégia específica para esses dados]

## CHECKLIST FINAL

Depois de limpar, confira:
- [ ] Zero duplicatas
- [ ] Datas no formato DD/MM/AAAA
- [ ] Números sem texto misturado
- [ ] Sem células vazias no meio dos dados
- [ ] Nomes padronizados (ex: todas maiúsculas)

## DICAS PARA NUNCA MAIS BAGUNÇAR

1. [Dica específica para este tipo de dado]
2. [Validação que pode configurar]
3. [Hábito para manter limpo]

REGRAS:
- Instruções visuais, não fórmulas complexas
- Passo a passo testável
- Sempre diga onde clicar
- Sem termos técnicos',
  2,
  'iniciante',
  '["limpeza", "qualidade", "dados"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '0ff96fdc-6663-4fbb-80da-5bec7626b5ef',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  'Cole Planilha, Receba Insights Acionáveis',
  'IA encontra padrões que você não vê',
  'Análise de Dados',
  'Você é analista de dados com visão de negócio. Analise estes dados e me diga o que FAZER:

[COLE DADOS EM TABELA OU DESCREVA PLANILHA]

CONTEXTO: [Vendas/Marketing/Ops/RH/Financeiro]
OBJETIVO: [O que você quer descobrir]

ANÁLISE OBRIGATÓRIA:

## O QUE OS DADOS DIZEM

**Padrão Principal:**
[O insight mais importante em 1 linha]

**Números que Chamam Atenção:**
- [Métrica X] está [muito alta/baixa] - [Y]% [acima/abaixo] do esperado
- [Métrica Z] cresceu/caiu [W]% - [possível causa]

**Comparações Relevantes:**
| Segmento | Desempenho | vs Média | Status |
|----------|------------|----------|--------|
| [A] | [Val] | +[X]% | 🟢 Ótimo |
| [B] | [Val] | -[Y]% | 🔴 Atenção |

## OUTLIERS (Valores Estranhos)

**Precisa investigar:**
- [Item X] com valor [Y] - [Z]% fora da curva
- Possível causa: [hipótese]

## 3 INSIGHTS ACIONÁVEIS

1. **[Insight]**
   → Ação: [O que fazer]
   → Impacto esperado: [Resultado]
   → Quem: [Responsável]

2. **[Insight]**
   → Ação: [O que fazer]

3. **[Insight]**
   → Ação: [O que fazer]

## PERGUNTAS QUE VOCÊ DEVERIA FAZER

1. [Pergunta que os dados sugerem]
2. [Dado adicional que ajudaria]
3. [Análise complementar necessária]

## SE EU FOSSE VOCÊ

[Recomendação direta do que priorizar esta semana]

REGRAS:
- Zero jargão estatístico
- Foco em "e daí?" não em "o que"
- Sempre sugira próxima ação
- Destaque o anormal, não o óbvio',
  3,
  'intermediario',
  '["análise", "dados", "insights"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '70a4b291-1d84-469c-a9f5-4972742251cd',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  '3 Planilhas Diferentes → 1 Consolidada',
  'Guia visual para consolidar dados',
  'Análise de Dados',
  'Preciso juntar estas planilhas. Me ensine o caminho mais simples:

PLANILHA 1 (Principal):
[Descreva colunas]

PLANILHA 2 (Buscar dados dela):
[Descreva colunas]

PLANILHA 3 (Buscar dados dela):
[Descreva colunas]

O QUE CONECTA TODAS: [Ex: ID do cliente, CPF, código]

PLANO DE CONSOLIDAÇÃO:

## PASSO 0: Preparação (5 min)

Antes de começar:
1. Salve todas as planilhas
2. Coloque todas na mesma pasta
3. Abra só a Planilha 1 (principal)

## PASSO 1: Estrutura da Consolidada (10 min)

Sua planilha final vai ter estas colunas:
| A | B | C | D (novo) | E (novo) |
|---|---|---|----------|----------|
| [P1] | [P1] | [P1] | [de P2] | [de P3] |

## PASSO 2: Buscar Dados da Planilha 2

**O que você quer:** [Dado específico da P2]

**Método mais simples:**
1. Na coluna D2, digite: `=PROCV(`
2. Clique na célula com [chave comum] (ex: A2)
3. Digite `; `
4. Vá na Planilha 2, selecione TUDO (Ctrl+A)
5. Digite `; [número da coluna que quer]; FALSO)`
6. Aperte Enter
7. Se deu certo, arraste pra baixo

**Se der erro #N/D:**
Significa que o [chave] não foi encontrado na Planilha 2.
Deixa em branco por enquanto.

## PASSO 3: Buscar Dados da Planilha 3

[Repita mesmo processo adaptado]

## PASSO 4: Validação (5 min)

Confira manualmente 3 linhas:
- Linha 2: [valor esperado]
- Linha 10: [valor esperado]
- Última linha: [valor esperado]

Se bateu, deu certo! ✓

## SE DER PROBLEMA

**"Não acho a função PROCV":**
Você está no Google Sheets? Use `VLOOKUP`

**"Deu #REF!":**
Você selecionou intervalo errado. Tente de novo.

**"Demora muito/trava":**
Suas planilhas têm mais de 5.000 linhas? [Solução alternativa]

REGRAS:
- Passo a passo testável
- Screenshots mentais (descreva o que ver)
- Sempre valide resultado',
  4,
  'intermediario',
  '["consolidação", "procv", "integração"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  'bab9fc10-6d61-4f90-9f2d-0b169e1e108b',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  'Encontre o Que Está Estranho Nos Dados',
  'IA aponta valores suspeitos e explica por quê',
  'Análise de Dados',
  'Você é auditor de dados. Analise como se algo estivesse errado:

[COLE DADOS]

CONTEXTO: [O que são esses dados]
PERÍODO: [Quando foram coletados]

INVESTIGAÇÃO:

## VALORES FORA DO NORMAL

**🔴 CRÍTICO - Investigar JÁ**

[Item X] com valor de [Y]:
- Está [Z]% acima do normal
- Última vez que aconteceu: [quando]
- Possíveis causas:
  1. [Hipótese mais provável]
  2. [Hipótese alternativa]
- **O que fazer:** [Ação específica]

[Repita para cada anomalia crítica]

**🟡 ATENÇÃO - Monitorar**

[Liste anomalias menores]

## PADRÕES SUSPEITOS

**Encontrei algo estranho:**
- [Padrão X] aparece [Y] vezes (esperado: 1-2)
- Pode ser: [duplicação / erro de sistema / fraude]
- Linhas afetadas: [liste]

## DADOS IMPOSSÍVEIS

**Coisas que não fazem sentido:**
- [ ] Datas no futuro: [liste]
- [ ] Valores negativos onde não deveria: [liste]
- [ ] Porcentagens > 100%: [liste]

## COMPARAÇÃO COM PADRÃO NORMAL

| Métrica | Normal | Hoje | Desvio | Status |
|---------|--------|------|--------|--------|
| [M1] | [V] | [V] | +[X]% | 🔴 |
| [M2] | [V] | [V] | -[Y]% | 🟢 |

## LINHA DO TEMPO DE PROBLEMAS

[Se houver datas, mostre quando começou]
```
Jan ████████  Normal
Fev █████████  Normal
Mar ███████████  Normal
Abr ██  ← AQUI! Caiu 80%
Mai ███  Ainda baixo
```

## RECOMENDAÇÕES URGENTES

1. **Prioridade 1:** [Anomalia] - [O que fazer]
   - Responsável: [Quem deve checar]
   - Prazo: [Hoje/Esta semana]
   
2. **Prioridade 2:** [Anomalia] - [O que fazer]

## VALIDAÇÕES QUE FALTAM

Para evitar isso no futuro, configure:
- [Validação 1]: Impedir que [X]
- [Validação 2]: Alertar se [Y]

REGRAS:
- Destaque só o que é REALMENTE anormal
- Sempre sugira causa provável
- Seja específico sobre ação',
  5,
  'intermediario',
  '["anomalia", "auditoria", "qualidade"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '0027684a-c0f6-4a41-8658-3b96d1220789',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  'Mês vs Mês / Ano vs Ano Explicado',
  'Compara e explica por que mudou',
  'Análise de Dados',
  'Compare estes períodos e me diga o que aconteceu:

PERÍODO 1 (Referência):
[Cole dados ou números principais]

PERÍODO 2 (Comparação):
[Cole dados ou números principais]

ANÁLISE COMPARATIVA:

## EM 1 FRASE

Período 2 foi [melhor/pior/similar] que Período 1.
Destaque: [O que mais chamou atenção].

## NÚMEROS LADO A LADO

| Métrica | Período 1 | Período 2 | Mudança | % | 📊 |
|---------|-----------|-----------|---------|----|----|
| [M1] | [V1] | [V2] | [±X] | [Y]% | ↑/↓/→ |
| [M2] | [V1] | [V2] | [±X] | [Y]% | ↑/↓/→ |

## O QUE MELHOROU 📈

**[Métrica que cresceu]:** +[X]%
- Provável motivo: [Hipótese]
- Isso é bom porque: [Impacto]
- Manter/acelerar: [Como]

## O QUE PIOROU 📉

**[Métrica que caiu]:** -[X]%
- Provável motivo: [Hipótese]
- Isso preocupa porque: [Impacto]
- Corrigir com: [Ação específica]

## O QUE NÃO MUDOU ➡️

[Métricas estáveis - variação <5%]
Interpretação: [Normal / Estagnado / Preocupante]

## ESSA MUDANÇA É SIGNIFICATIVA?

[Para cada métrica principal:]
- Variação de [X]% é: [RELEVANTE / NORMAL / RUÍDO]
- Por quê: [Contexto]

## SE CONTINUAR ASSIM...

Projetando para daqui 3 meses:
- [Métrica principal]: Chegará em [valor]
- Isso significa: [Consequência boa/ruim]

## O QUE FAZER AGORA

**Ação 1:** [Baseada no que melhorou - dobrar a aposta]
**Ação 2:** [Baseada no que piorou - corrigir rota]
**Ação 3:** [Monitorar o que estabilizou]

REGRAS:
- Sempre contextualize (X% é muito ou pouco?)
- Explique causa provável
- Sugira ação concreta',
  6,
  'intermediario',
  '["comparação", "períodos", "tendências"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '70a4b291-1d84-469c-a9f5-4972742251cd',
  true
);

INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, ordem, nivel_complexidade, 
  tags, ferramentas_recomendadas, modulo_id, ativo
) VALUES (
  'Dados → Wireframe de Dashboard',
  'Planeja dashboard antes de construir',
  'Análise de Dados',
  'Ajude-me a planejar um dashboard que realmente será usado:

ÁREA: [Vendas/Marketing/Ops/Financeiro/RH]
QUEM VAI VER: [Cargo/perfil]
DECISÃO QUE ESSE DASHBOARD DEVE APOIAR: [Seja específico]

DADOS DISPONÍVEIS:
[Liste suas fontes - planilhas, sistemas, etc]

PLANO DO DASHBOARD:

## OBJETIVO EM 1 FRASE
Este dashboard responde: "[Pergunta principal]"

## OS 5 NÚMEROS QUE IMPORTAM

Para cada KPI, explique:

**KPI 1: [Nome do indicador]**
- O que mede: [Definição clara]
- Por que importa: [Impacto na decisão]
- Meta: [Valor ideal]
- Como visualizar: [Número grande / Gráfico de linha / Barra]
- Onde buscar: [Fonte do dado]

[Repita para KPIs 2-5]

## LAYOUT VISUAL (Descrição)
```
┌─────────────────────────────────────────┐
│ TOPO: 3 Cards com números grandes       │
│ [KPI 1]    [KPI 2]    [KPI 3]          │
├─────────────────────────────────────────┤
│ MEIO-ESQUERDA: Gráfico principal (60%)  │
│ [Tendência temporal - últimos 90 dias]  │
│                                          │
│ MEIO-DIREITA: Alertas (40%)            │
│ 🔴 [Alerta crítico]                     │
│ 🟡 [Atenção]                            │
├─────────────────────────────────────────┤
│ RODAPÉ: Detalhamento                    │
│ [Tabela com top 10 + drill-down]       │
└─────────────────────────────────────────┘
```

## FILTROS ESSENCIAIS

- [ ] Período (padrão: últimos 30 dias)
- [ ] [Filtro específico - ex: Região]
- [ ] [Filtro específico - ex: Produto]

**Não adicione mais que 3 filtros!** (senão ninguém usa)

## ALERTAS AUTOMÁTICOS

Configure notificações quando:
- 🔴 [KPI X] < [valor]: Email para [quem]
- 🟡 [KPI Y] entre [X e Y]: Monitorar
- 🟢 [KPI Z] > [meta]: Celebrar!

## FREQUÊNCIA DE ATUALIZAÇÃO

[Este dashboard deve atualizar:]
- ⚡ Tempo real (se decisões urgentes)
- 📅 Uma vez por dia (se acompanhamento diário)
- 📊 Semanal (se planejamento)

Recomendação para seu caso: [Justificativa]

## PERGUNTAS QUE ESTE DASHBOARD RESPONDE

1. [Pergunta que o usuário faria]
2. [Pergunta que o usuário faria]
3. [Pergunta que o usuário faria]

## CHECKLIST ANTES DE CONSTRUIR

- [ ] KPIs alinhados com objetivo do usuário
- [ ] Dados estão acessíveis
- [ ] Layout prioriza o mais importante (topo esquerda)
- [ ] Menos de 7 visualizações (senão fica poluído)
- [ ] Ações claras quando ver problema

REGRAS:
- Dashboard não é depósito de gráficos
- Se precisa manual para usar, falhou
- Priorize ação sobre informação',
  7,
  'avancado',
  '["dashboard", "planejamento", "bi"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  'f9e45ec5-c918-4f58-8cd7-bab9f2254e45',
  true
);