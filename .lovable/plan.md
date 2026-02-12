

# Corrigir Entregas: Devem ser Atividades/Tarefas dos Projetos, Nao Copias

## Problema Identificado

As entregas geradas pela IA sao **copias identicas dos projetos** (mesmo titulo, 1 entrega por projeto). Isso esta errado.

**Exemplo do erro atual:**
- Projeto: "Automacao Inteligente de Abertura e Tratativa de RAIVs"
- Entrega: "Automacao Inteligente de Abertura e Tratativa de RAIVs" (identico!)

**Como deveria ser:**
- Projeto: "Automacao Inteligente de Abertura e Tratativa de RAIVs"
- Entrega 1: "Mapear fluxo atual de abertura de RAIVs no ERP"
- Entrega 2: "Configurar modelo de OCR para leitura de fotos de RAIVs"
- Entrega 3: "Criar script de integracao com API do ERP para abertura automatica"

## Causa Raiz

O prompt da edge function `gerar-entregas-skills` nao enfatiza suficientemente que as entregas devem ser **tarefas/atividades menores** que compoem o projeto. A IA interpreta "entrega" como sinonimo de "projeto" e simplesmente replica o titulo.

## Solucao

### 1. Corrigir o prompt na edge function `gerar-entregas-skills/index.ts`

Ajustar o prompt para:
- Deixar claro que entregas sao **etapas/tarefas/atividades** necessarias para completar o projeto
- Proibir explicitamente que o titulo da entrega seja igual ao titulo do projeto
- Exigir minimo de 2 entregas por projeto (antes era "1 a 3", agora sera "2 a 4")
- Dar exemplos concretos de entregas vs projetos no prompt

### 2. Limpar os dados errados e regenerar

- DELETE das entregas atuais da equipe Inovacao (Engelmig)
- Os dados corretos serao gerados quando o admin clicar novamente em "Gerar Entregas com IA"

## Detalhe Tecnico do Prompt Corrigido

O novo prompt vai incluir instrucoes como:

```text
REGRA CRITICA: Entregas NAO sao projetos. Entregas sao ETAPAS, TAREFAS e ATIVIDADES
praticas que a equipe precisa executar para que o projeto seja concluido.

PROIBIDO: O titulo da entrega NUNCA pode ser igual ou muito similar ao titulo do projeto.

Exemplo correto:
  Projeto: "Automacao de Analise e Geracao de Graficos para DFC"
  Entregas:
    1. "Mapear fontes de dados e KPIs da DFC atual"
    2. "Criar template de prompts para analise automatica de desvios"
    3. "Desenvolver script de geracao automatica de graficos contextuais"

Para cada projeto, gere de 2 a 4 entregas que sejam passos concretos de execucao.
```

## Arquivos Modificados

- `supabase/functions/gerar-entregas-skills/index.ts` -- corrigir prompt para gerar entregas como tarefas/atividades
- Dados corrigidos via DELETE + regeneracao pelo admin

## Resultado

- Cada projeto tera 2-4 entregas que sao etapas concretas de implementacao
- Titulos das entregas serao distintos dos titulos dos projetos
- Entregas serao accionaveis e com passos claros para execucao
