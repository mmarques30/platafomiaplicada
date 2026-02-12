

# Vincular Projetos a Trilhas Existentes (Personalizacao de Conteudo)

## Conceito

O conteudo ja esta disponivel na aba "Aprender". O que muda e que cada projeto gerado pela IA tera uma **recomendacao personalizada** de qual trilha assistir e quais modulos/videos priorizar para executar aquele projeto. O membro ve o mesmo conteudo, mas com orientacao de POR ONDE COMECAR baseado no seu projeto.

## O que muda

### 1. Novo campo JSONB em `backlog_skills`: `trilhas_recomendadas`

Em vez de um simples `trilha_id`, usar um campo JSONB que permite recomendar MULTIPLAS trilhas por projeto, com modulos prioritarios:

```text
ALTER TABLE backlog_skills
  ADD COLUMN trilhas_recomendadas JSONB DEFAULT '[]';
```

Estrutura do JSONB:
```text
[
  {
    "trilha_id": "uuid",
    "trilha_titulo": "Planilhas - Analise e Insights",
    "prioridade": "essencial",
    "modulos_prioritarios": [1, 2, 5],
    "justificativa": "Necessario para criar analises automatizadas de DFC"
  }
]
```

### 2. Novo campo JSONB em `entregas_skills`: `conteudo_suporte`

Cada entrega tera referencia direta ao conteudo que ajuda a executa-la:

```text
ALTER TABLE entregas_skills
  ADD COLUMN conteudo_suporte JSONB DEFAULT '[]';
```

Estrutura do JSONB:
```text
[
  {
    "trilha_id": "uuid",
    "trilha_titulo": "Fundamentos de Automacao",
    "modulos": [3, 4],
    "descricao": "Assistir modulos 3 e 4 para aprender a configurar workflows"
  }
]
```

### 3. Atualizar `gerar-projetos-skills`

Passar a lista de trilhas disponiveis (13 trilhas com ID, titulo e categoria) no prompt da IA. A IA retorna, para cada projeto, quais trilhas sao relevantes e por que.

Mudancas no prompt:
```text
TRILHAS DISPONIVEIS NA PLATAFORMA:
- [uuid] "Planilhas - Limpeza e Organizacao" (nucleo)
- [uuid] "Fundamentos de Automacao" (nucleo)
- [uuid] "Dashboard e Business Intelligence" (ferramentas)
- ... (todas as 13 trilhas)

Para cada projeto, indique quais trilhas o membro deve assistir para executar
o projeto, em ordem de prioridade ("essencial" ou "recomendado"),
e quais modulos sao prioritarios (numeros de 1 a 10).
```

Novo campo no tool_call schema:
```text
trilhas_recomendadas: {
  type: "array",
  items: {
    type: "object",
    properties: {
      trilha_id: { type: "string" },
      prioridade: { type: "string", enum: ["essencial", "recomendado"] },
      modulos_prioritarios: { type: "array", items: { type: "number" } },
      justificativa: { type: "string" }
    }
  }
}
```

No insert do `backlog_skills`, salvar o `trilhas_recomendadas` retornado pela IA (com validacao dos IDs contra trilhas reais).

### 4. Atualizar `gerar-entregas-skills`

Incluir as trilhas recomendadas do projeto pai no prompt, para que a IA indique para cada entrega quais modulos especificos assistir.

Mudancas:
- No select do backlog, incluir `trilhas_recomendadas`
- No prompt, mostrar as trilhas do projeto para que a IA sugira conteudo de suporte por entrega
- Novo campo `conteudo_suporte` no tool_call schema
- Salvar no insert da entrega

### 5. Nenhuma mudanca em conteudos_liberados ou na aba Aprender

O conteudo continua sendo exibido normalmente. A diferenca e que nos cards de projeto e entrega, o membro vera badges/links tipo: "Trilha recomendada: Fundamentos de Automacao -- Modulos 3 e 4".

## Fluxo Resultante

```text
IA gera projeto
  |-- Analisa diagnosticos + lista de trilhas disponiveis
  |-- Retorna projeto COM trilhas_recomendadas (JSONB)
  v
IA gera entregas
  |-- Recebe trilhas do projeto pai
  |-- Retorna entrega COM conteudo_suporte (JSONB)
  v
Membro ve no card do projeto/entrega:
  "Para executar, assista: Fundamentos de Automacao (Modulos 3-4)"
  [Link direto para a trilha no Aprender]
```

## Exemplo Pratico

Projeto: "Automacao de Relatorio DFC com IA"
- Trilhas recomendadas:
  - **Essencial**: "Planilhas - Analise e Insights" (modulos 1, 2, 5) -- para estruturar os dados
  - **Essencial**: "Fundamentos de Automacao" (modulos 3, 4) -- para criar o workflow
  - **Recomendado**: "Dashboard e BI" (modulos 1, 2) -- para visualizar resultados

Entrega 1: "Mapear fontes de dados e KPIs da DFC"
- Conteudo suporte: "Planilhas - Analise e Insights" modulos 1-2

Entrega 2: "Criar workflow de automacao do relatorio"
- Conteudo suporte: "Fundamentos de Automacao" modulos 3-4

## Detalhes Tecnicos

### Migracao SQL
- `backlog_skills`: ADD COLUMN `trilhas_recomendadas` JSONB DEFAULT '[]'
- `entregas_skills`: ADD COLUMN `conteudo_suporte` JSONB DEFAULT '[]'

### Arquivos Modificados
- `supabase/functions/gerar-projetos-skills/index.ts` -- incluir trilhas no prompt, novo campo no schema, salvar JSONB
- `supabase/functions/gerar-entregas-skills/index.ts` -- herdar trilhas do projeto, gerar conteudo_suporte por entrega
- Migracao SQL para as 2 colunas JSONB

### Validacao de IDs
Apos o retorno da IA, cruzar os `trilha_id` retornados com as trilhas reais do banco. Descartar IDs invalidos para garantir integridade.

