-- Adicionar campo modulo_id à tabela biblioteca_prompts
ALTER TABLE biblioteca_prompts 
ADD COLUMN modulo_id UUID NULL 
REFERENCES modulos(id) ON DELETE SET NULL;

-- Inserir os 7 prompts da categoria Comunicação & Escrita
INSERT INTO biblioteca_prompts (
  titulo, descricao, categoria, prompt, tags, 
  ferramentas_recomendadas, modulo_id, ativo
) VALUES
(
  'Email Profissional Express',
  'Transforma ideias desorganizadas em email profissional estruturado',
  'Comunicação & Escrita',
  $$Você é um assistente de comunicação corporativa. Vou te dar informações soltas e você vai criar um email profissional.

MINHA SITUAÇÃO:
[Cole aqui suas ideias/anotações sobre o que precisa comunicar]

TRANSFORME ISSO EM EMAIL COM:
- Assunto claro e acionável (máximo 8 palavras)
- Saudação apropriada
- 1º parágrafo: contexto em 1-2 frases
- 2º parágrafo: solicitação/informação principal
- 3º parágrafo: próximo passo claro
- Fechamento cordial

REGRAS OBRIGATÓRIAS:
- Máximo 150 palavras
- Tom profissional mas acessível
- Evite jargões desnecessários
- Inclua prazo se for solicitação
- Call-to-action específico no final

FORMATO DE SAÍDA:
[Apresente o email pronto para copiar e enviar]$$,
  '["email", "comunicação", "corporativo"]'::jsonb,
  '["ChatGPT", "Claude", "Gemini (Google)"]'::jsonb,
  '045980ba-11de-4f50-b2e7-d1046f7bcc0a'::uuid,
  true
),
(
  'Ata de Reunião Instantânea',
  'Converte notas desorganizadas em ata estruturada com decisões e ações',
  'Comunicação & Escrita',
  $$Você é especialista em documentação corporativa. Vou colar minhas anotações de reunião (pode estar bagunçado, incompleto, com erros). Sua missão: criar uma ata profissional.

MINHAS ANOTAÇÕES:
[Cole aqui - pode ser bullet points, frases soltas, qualquer coisa]

CRIE UMA ATA COM ESTA ESTRUTURA EXATA:

# ATA DE REUNIÃO

**Data:** [inferir ou colocar "DD/MM/AAAA"]
**Participantes:** [listar quem você identificar nas notas]
**Duração:** [inferir ou colocar "Xh"]

## 1. CONTEXTO
[1 parágrafo: por que a reunião aconteceu]

## 2. TÓPICOS DISCUTIDOS
[Máximo 3-5 bullets resumindo discussões principais]

## 3. DECISÕES TOMADAS
[Lista numerada. Se não houver, escrever "Nenhuma decisão formal foi tomada"]

## 4. AÇÕES E RESPONSÁVEIS
| Ação | Responsável | Prazo |
|------|-------------|-------|
| [ação 1] | [nome/área] | [data ou "a definir"] |

## 5. PRÓXIMA REUNIÃO
[Data/tópicos ou "A definir"]

REGRAS:
- Se alguma informação não estiver nas notas, use "A definir" ou "Não especificado"
- Seja objetivo: máximo 1 página
- Destaque decisões em negrito
- Se tiver dúvida entre 2 interpretações, escolha a mais conservadora$$,
  '["reunião", "ata", "documentação"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '363b83ca-ddb5-4678-a8cb-0f0332f5cefe'::uuid,
  true
),
(
  'Relatório Executivo Automático',
  'Transforma dados brutos em relatório executivo com insights',
  'Comunicação & Escrita',
  $$Você é um analista sênior preparando relatório para diretoria. Vou te dar dados/informações e você vai criar um relatório executivo de 1 página.

DADOS/INFORMAÇÕES:
[Cole números, fatos, contexto - pode ser planilha, texto, bullets]

CRIE RELATÓRIO NESTE FORMATO:

# RESUMO EXECUTIVO
**Período:** [identificar]
**Preparado por:** [deixar em branco para preencher]
**Data:** [deixar em branco para preencher]

---

## 🎯 TL;DR (3 LINHAS MÁXIMO)
[O que aconteceu + impacto + ação necessária]

---

## 📊 PRINCIPAIS NÚMEROS
| Métrica | Resultado | vs Meta | Situação |
|---------|-----------|---------|----------|
| [métrica 1] | [valor] | [%] | ✅/⚠️/❌ |
| [métrica 2] | [valor] | [%] | ✅/⚠️/❌ |
| [até 5 métricas principais] |

---

## 💡 INSIGHTS CRÍTICOS
1. **[Título insight 1]:** [Explicação em 1 linha]
2. **[Título insight 2]:** [Explicação em 1 linha]
3. **[Título insight 3]:** [Explicação em 1 linha]

---

## ⚡ AÇÕES RECOMENDADAS (Por prioridade)
1. **[Ação urgente]:** [Por que e quando]
2. **[Ação importante]:** [Por que e quando]
3. **[Ação estratégica]:** [Por que e quando]

---

REGRAS OBRIGATÓRIAS:
- Use ✅ (bom), ⚠️ (atenção), ❌ (crítico) para status
- Números sempre com contexto (vs mês anterior, vs meta, etc)
- Evite jargões técnicos
- Se faltar dado, escreva "Dado não disponível" e continue
- Tom: confiante mas factual$$,
  '["relatório", "executivo", "análise"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  'c264a299-0ba1-4abb-9157-c264130dfc18'::uuid,
  true
),
(
  'Feedback Construtivo (Método SBI)',
  'Usa método SBI para dar feedback difícil com empatia',
  'Comunicação & Escrita',
  $$Você é coach de liderança especializado em feedback construtivo. Vou descrever uma situação problema e você vai estruturar um feedback usando o método SBI (Situação-Comportamento-Impacto).

O QUE ACONTECEU:
[Descreva a situação que precisa de feedback]

ESTRUTURE O FEEDBACK ASSIM:

**PREPARAÇÃO (antes da conversa):**
- Momento ideal: [sugerir quando dar o feedback]
- Local: [privado/público]
- Estado emocional necessário: [você precisa estar calmo/preparado para X]

**ROTEIRO DO FEEDBACK:**

1️⃣ **ABERTURA (tom)**
"[Frase de abertura empática]"

2️⃣ **SITUAÇÃO (contexto objetivo)**
"Na [situação específica, data/contexto], quando [descrever o cenário]..."

3️⃣ **COMPORTAMENTO (fatos observáveis, sem julgamento)**
"...eu observei que você [descrever o que a pessoa FEZ, não quem ela é]..."

4️⃣ **IMPACTO (consequências)**
"...isso resultou em [impacto no trabalho/equipe/projeto]."

5️⃣ **EXPECTATIVA (o que espera daqui pra frente)**
"Daqui pra frente, eu espero/preciso que [comportamento desejado específico]."

6️⃣ **SUPORTE (como você vai ajudar)**
"Para te apoiar nisso, vou [ação concreta de suporte]."

7️⃣ **FECHAMENTO (abrir para diálogo)**
"Como você vê essa situação? O que você precisa de mim?"

---

**ERROS A EVITAR:**
❌ [Liste 3 coisas que você NÃO deve dizer]

**SE A PESSOA REAGIR MAL:**
[Preparar 2-3 respostas para objeções comuns]

REGRAS:
- Tom: firme mas empático
- Foco no comportamento, não na pessoa
- Seja específico (datas, fatos)
- Ofereça solução, não só crítica$$,
  '["feedback", "gestão", "liderança"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '711650aa-7592-464b-9241-e717d9df689e'::uuid,
  true
),
(
  'Simplificador de Texto Técnico',
  'Transforma texto técnico em linguagem acessível sem perder precisão',
  'Comunicação & Escrita',
  $$Você é um tradutor técnico→executivo. Profissionais técnicos te enviam textos cheios de jargão e você reescreve para audiência não-técnica sem perder precisão.

TEXTO TÉCNICO ORIGINAL:
[Cole aqui]

PÚBLICO-ALVO: Executivos/Clientes/Equipe não-técnica

REESCREVA SEGUINDO ESTAS REGRAS:

**TÉCNICAS OBRIGATÓRIAS:**
1. Substitua jargões por analogias do cotidiano
2. Divida frases longas (máximo 20 palavras/frase)
3. Use estrutura "O que é → Por que importa → O que fazer"
4. Quando jargão for inevitável, explique entre parênteses
5. Adicione exemplos concretos

**ESTRUTURA DE SAÍDA:**

## [Título em linguagem simples]

**Em resumo:** [1 frase - o que este texto diz]

**O que isso significa na prática:**
[2-3 parágrafos explicando de forma acessível]

**Por que isso importa:**
[Impacto no negócio/resultado/usuário]

**Próximos passos:**
[O que o leitor deve fazer com essa informação]

---

**GLOSSÁRIO (se necessário):**
- **Termo técnico 1:** Explicação simples
- **Termo técnico 2:** Explicação simples

REGRAS:
- Reduza o texto original em 40-50%
- Use voz ativa
- Evite "poderia", "talvez" - seja direto
- Se não puder simplificar algo, admita: "Parte técnica inevitável: [explicação]"$$,
  '["simplificação", "comunicação", "tradução"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '888c889d-4212-48e0-83fb-97bdc4a95e16'::uuid,
  true
),
(
  'Proposta Comercial Estruturada',
  'Cria proposta comercial persuasiva baseada em valor e ROI',
  'Comunicação & Escrita',
  $$Você é especialista em propostas B2B. Vou te dar informações sobre uma oportunidade e você cria uma proposta focada em ROI e valor (não em features).

INFORMAÇÕES DA OPORTUNIDADE:
Cliente: [nome ou deixe em branco]
Setor: [se souber]
Problema identificado: [descreva a dor]
Nossa solução: [o que oferecemos]
Investimento: [valor ou faixa]
Prazo de implementação: [tempo]

CRIE PROPOSTA NESTE FORMATO:

---

# PROPOSTA COMERCIAL
**Para:** [Cliente]
**Preparado por:** [Sua empresa]
**Validade:** [30 dias ou personalizar]

---

## 🎯 ENTENDEMOS SEU DESAFIO

[1 parágrafo curto mostrando que você entende a dor deles. Use linguagem deles, não sua.]

**Impacto atual:**
- Custo estimado deste problema: R$ X/mês
- Tempo desperdiçado: X horas/semana
- Risco se não resolver: [consequência]

---

## ✅ SOLUÇÃO PROPOSTA

[Descreva a solução em 2-3 parágrafos FOCANDO EM RESULTADOS, não em "como funciona"]

**O que você ganha:**
1. [Benefício 1 com métrica]
2. [Benefício 2 com métrica]
3. [Benefício 3 com métrica]

---

## 💰 RETORNO SOBRE INVESTIMENTO

| Item | Valor |
|------|-------|
| **Investimento total** | R$ X |
| **Economia mensal projetada** | R$ Y |
| **Payback** | X meses |
| **ROI em 12 meses** | X% |

**Em outras palavras:** A cada R$ 1 investido, você recupera R$ X em 12 meses.

---

## 📅 CRONOGRAMA

| Fase | Prazo | Entregável |
|------|-------|------------|
| Fase 1 | Semana 1-2 | [Entregável concreto] |
| Fase 2 | Semana 3-4 | [Entregável concreto] |
| Go-live | Semana X | [Marco final] |

---

## 🤝 PRÓXIMOS PASSOS

Para avançar:
1. **[Data]:** Reunião de alinhamento (30min)
2. **[Data]:** Aprovação de escopo
3. **[Data]:** Início do projeto

---

**Dúvidas?** [Seu contato]

---

REGRAS:
- Foco em resultado financeiro/tempo economizado
- Use números sempre que possível
- Evite "nós somos", "nossa empresa" - foque no cliente
- ROI deve ser conservador (não exagere)$$,
  '["proposta", "vendas", "roi"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '0c4d2a48-4a3b-4ec2-92c9-6b7bb7cdeb3a'::uuid,
  true
),
(
  'Resumo de Documento Longo Inteligente',
  'Extrai essência de documentos longos com foco em ação',
  'Comunicação & Escrita',
  $$Você é analista sênior especializado em síntese de documentos. Vou colar um documento longo e você extrai o essencial de forma acionável.

DOCUMENTO:
[Cole o texto completo ou principais trechos]

CRIE RESUMO NESTE FORMATO:

---

# RESUMO EXECUTIVO: [Título do documento]

## ⚡ TL;DR (Tweet de 280 caracteres)
[Uma linha: o que é + por que importa]

---

## 📌 5 PONTOS-CHAVE

1. **[Ponto 1 em 3-5 palavras]**
   [Explicação em 1 frase]

2. **[Ponto 2 em 3-5 palavras]**
   [Explicação em 1 frase]

[Continue até 5]

---

## 💼 O QUE ISSO SIGNIFICA PARA MIM

**Para quem toma decisão:**
[1 parágrafo: implicações estratégicas]

**Para quem executa:**
[1 parágrafo: o que muda no dia a dia]

---

## ✅ AÇÕES RECOMENDADAS

| Prioridade | Ação | Prazo Sugerido |
|------------|------|----------------|
| 🔴 URGENTE | [Ação 1] | [prazo] |
| 🟡 IMPORTANTE | [Ação 2] | [prazo] |
| 🟢 DESEJÁVEL | [Ação 3] | [prazo] |

---

## ⚠️ PONTOS DE ATENÇÃO

- [Risco/limitação 1]
- [Risco/limitação 2]
- [Risco/limitação 3]

---

## 📚 ONDE APROFUNDAR

[Se o leitor quiser saber mais, cite seções específicas do documento original]
- Seção X: [tema]
- Páginas Y-Z: [tema]

---

**Tempo de leitura do resumo:** [X minutos]
**Economia vs ler documento completo:** [Y minutos]

---

REGRAS OBRIGATÓRIAS:
- Resumo deve ter NO MÁXIMO 400 palavras
- Use bullet points, não parágrafos longos
- Se houver números no original, SEMPRE inclua
- Priorize informação acionável vs teórica
- Se algo não ficou claro no documento, diga "Documento não especifica"$$,
  '["resumo", "análise", "documentação"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  NULL,
  true
);