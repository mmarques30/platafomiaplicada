-- Adicionar prompts de Apresentações e Vendas
INSERT INTO biblioteca_prompts (
  titulo, 
  descricao, 
  categoria, 
  prompt, 
  ordem,
  nivel_complexidade, 
  tags, 
  ferramentas_recomendadas,
  modulo_id, 
  ativo
) VALUES
  -- Prompt 27: Estruturador de Apresentação Executiva
  (
    'Ideia → Estrutura de Slides que Convence',
    'Cria storytelling e sequência lógica de slides',
    'Apresentações',
    'Você é especialista em storytelling executivo. Estruture esta apresentação para convencer:

OBJETIVO: [O que você quer que aprovem/decidam]
AUDIÊNCIA: [CEO/Diretores/Investidores/Equipe]
TEMPO: [X minutos]
CONTEXTO: [Situação atual / Por que apresentar]

ESTRUTURA ESTRATÉGICA:

## SLIDE 1: O PEDIDO (O Ask)

**NÃO comece com "Quem somos"**

**Título:** [Frase de impacto]

**Conteúdo:**
"Estamos aqui para pedir [DECISÃO ESPECÍFICA]."

Por quê agora: [1 frase]
Impacto: [1 número]

**Regra:** Executivo quer saber O QUÊ você quer logo no início.

---

## SLIDE 2: O Problema (Por que importa)

**Título:** [Formulação do problema]

**Conteúdo:**
"Hoje, [SITUAÇÃO PROBLEMÁTICA]."

**Impacto quantificado:**
- Perdemos: R$ [X]/mês
- Desperdiçamos: [Y] horas/semana
- Risco: [Z]% de [consequência]

**Storytelling:** [Exemplo concreto de 2 linhas]

---

## SLIDE 3: Tentativas Anteriores (O que já tentamos)

**Título:** "O que já fizemos (e por que não funcionou)"

**Conteúdo:**
Tentativa 1: [Ação] → Resultado: [Falhou porque X]
Tentativa 2: [Ação] → Resultado: [Falhou porque Y]

**Aprendizado:** [O que descobrimos]

**Por que esse slide:** Mostra que você não está sendo ingênuo.

---

## SLIDE 4: A Solução (Nossa proposta)

**Título:** [Nome da solução - orientado a benefício]

**Conteúdo:**
[Explicação visual em 3 bullets máximo]

**Diferencial:** O que isso faz que as outras tentativas não fizeram?

**Visual sugerido:** [Diagrama simples / Before→After / Fluxo]

---

## SLIDE 5: Como Funciona (Prova de viabilidade)

**Título:** "Como vai funcionar"

**Conteúdo:**
Fase 1 (Semana 1-X): [Marco]
Fase 2 (Semana Y-Z): [Marco]
Fase 3 (Mês W+): [Resultado]

**Recursos necessários:** [Resumo]

**Visual:** Timeline ou diagrama de 3 etapas

---

## SLIDE 6: Evidências (Por que vai dar certo)

**Título:** "Por que temos confiança"

**Conteúdo:**
✓ [Dado 1 - case interno ou externo]
✓ [Dado 2 - tendência de mercado]
✓ [Dado 3 - expertise da equipe]

**Benchmark:** "[Empresa X] fez similar e obteve [resultado Y]"

---

## SLIDE 7: ROI (Os números)

**Título:** "Retorno do investimento"

**Conteúdo:**
| Item | Valor |
|------|-------|
| Investimento | R$ [X] |
| Retorno anual | R$ [Y] |
| Payback | [Z] meses |
| ROI | [W]% |

**Cenários:**
- Conservador: [Números]
- Realista: [Números]
- Otimista: [Números]

---

## SLIDE 8: Riscos e Mitigação

**Título:** "O que pode dar errado (e como evitar)"

**Conteúdo:**
Risco 1: [Descrever]
→ Mitigação: [Como prevenir]
→ Plano B: [Se acontecer]

**Por que esse slide:** Mostra maturidade e planejamento.

---

## SLIDE 9: Próximos Passos

**Título:** "O que acontece se aprovado hoje"

**Conteúdo:**
Esta semana: [Ação 1]
Semana 2: [Ação 2]
Mês 1: [Resultado visível]

**Responsáveis:** [Quem faz o quê]

---

## SLIDE 10: Recapitulação e Decisão

**Título:** "Recapitulando"

**Conteúdo:**
✓ Problema: [1 linha]
✓ Solução: [1 linha]
✓ Investimento: R$ [X]
✓ Retorno: R$ [Y] em [Z] meses

**PEDIDO NOVAMENTE:**
"Estamos pedindo [DECISÃO] para [QUANDO]."

---

## REGRAS DE OURO

**Cada slide deve:**
- 1 ideia = 1 slide
- Título acionável (não "Introdução", mas "Por que agora")
- Máximo 3 bullets por slide
- Números sempre com contexto (vs algo)

**Visuais > Texto:**
- Gráfico > Tabela
- Diagrama > Parágrafo
- Imagem > Descrição

**Tom:**
- Confiante, não arrogante
- Dados, não opiniões
- Específico, não genérico

---

## PREPARAÇÃO PARA PERGUNTAS

**Provável pergunta 1:** "Por que não fazer [alternativa X]?"
**Resposta:** [Antecipe]

**Provável pergunta 2:** "Quanto custa realmente?"
**Resposta:** [Detalhamento]

**Provável pergunta 3:** "E se não funcionar?"
**Resposta:** [Plano de saída]

---

## BACKUP SLIDES (Não apresentar, só se pedirem)

Slide 11: Detalhamento técnico
Slide 12: Casos de sucesso completos
Slide 13: Cronograma detalhado
Slide 14: Equipe e expertise

REGRA: Apresentação não é documento. Se tem >15 slides, vire relatório e apresente resumo.',
    1,
    'avancado',
    '["apresentação", "storytelling", "pitch"]'::jsonb,
    '["Claude", "ChatGPT", "Gamma"]'::jsonb,
    'be2b2d8b-03c7-4edc-8278-7624e5d5d00e',
    true
  ),
  
  -- Prompt 28: Copywriter de Slides
  (
    'Conteúdo Técnico → Copy que Prende Atenção',
    'Transforma slides densos em mensagens claras',
    'Apresentações',
    'Você é copywriter de apresentações corporativas. Transforme este conteúdo em slide impactante:

CONTEÚDO ATUAL:
[Cole o texto que está no slide hoje]

OBJETIVO DO SLIDE:
[O que você quer que a audiência entenda/sinta]

SLIDE OTIMIZADO:

## TÍTULO
**ANTES:** [Título genérico atual]
**DEPOIS:** [Título específico e orientado a benefício]

**Regra:** Título deve comunicar a mensagem, não o tópico.
❌ "Resultados Q3"
✅ "Crescemos 40% no Q3 mesmo com mercado em queda"

---

## CONTEÚDO

**ANTES:**
[Seu texto atual - provavelmente cheio de palavras]

**DEPOIS:**
- [Bullet 1 - máx 8 palavras]
- [Bullet 2 - máx 8 palavras]
- [Bullet 3 - máx 8 palavras]

**Regra:** Se não cabe em 3 bullets, são 2 slides.

---

## VISUAL SUGERIDO

**Tipo:** [Gráfico/Diagrama/Imagem/Número grande]

**Descrição:**
[Como deve parecer visualmente]

**Por que funciona:**
[Explicação do impacto visual]

---

## TEXTO DO APRESENTADOR (O que FALAR)

**Enquanto mostra o slide, dizer:**
"[Script de 30-45 segundos]"

**Ênfases:**
- Pause após: [Frase X]
- Destaque: [Número Y]
- Conecte com: [Slide anterior/próximo]

---

## VARIAÇÕES POR AUDIÊNCIA

**Para CEO (30 seg):**
"[Versão ultra-resumida focada em decisão]"

**Para Gerência (1 min):**
"[Versão com um pouco mais de contexto]"

**Para Equipe (2 min):**
"[Versão com detalhes de implementação]"

---

## CHECKLIST DE QUALIDADE

- [ ] Título comunica mensagem principal?
- [ ] Cabe em <20 palavras de texto?
- [ ] Tem visual claro (não só texto)?
- [ ] Números têm contexto (vs algo)?
- [ ] Próxima pessoa entende sem você?

**Se algum "não", revisar.**

REGRA: Slide é apoio visual, não teleprompter. Se você está lendo slide, falhou.',
    2,
    'intermediario',
    '["copy", "slides", "comunicação"]'::jsonb,
    '["ChatGPT", "Claude"]'::jsonb,
    '3df52bde-4934-4477-ab4a-58fd6781f5fc',
    true
  ),
  
  -- Prompt 29: Qualificador de Leads (BANT)
  (
    'Lead → Score de Prioridade Automático',
    'Identifica quais leads perseguir primeiro',
    'Vendas',
    'Você é SDR experiente. Qualifique este lead usando framework BANT:

INFORMAÇÕES DO LEAD:
[Cole o que você sabe - pode ser pouco]

Nome: [X]
Empresa: [Y]
Cargo: [Z]
Como chegou: [Inbound/Outbound/Indicação]
Interesse: [O que pediu/perguntou]

QUALIFICAÇÃO BANT:

## B - BUDGET (Orçamento) 💰

**Sinais capturados:**
[O que sugere que tem/não tem budget]

**Score:** [0-25 pontos]
- 25: Orçamento confirmado
- 15: Empresa de porte adequado
- 5: Sem sinais claros
- 0: Claramente sem budget

**Perguntas para descobrir:**
- "Vocês já investem em [categoria]? Quanto?"
- "Qual o budget alocado para [objetivo] este ano?"
- "Quem aprova investimentos nessa faixa?"

---

## A - AUTHORITY (Autoridade) 👤

**Nível do contato:**
- Decisor final (CEO/Diretor)
- Influenciador (Gerente/Coord)
- Usuário final (Analista)
- Pesquisando (Estagiário/RH)

**Score:** [0-25 pontos]
- 25: Decisor direto
- 20: Acesso ao decisor
- 10: Influenciador
- 0: Sem poder de decisão

**Próximo passo:**
[Como chegar no decisor se não for]

---

## N - NEED (Necessidade) 🎯

**Dor identificada:**
[Problema específico que ele tem]

**Urgência:**
- 🔥 Crítica: Perdendo dinheiro/cliente AGORA
- ⚡ Alta: Meta do trimestre depende
- 📅 Média: Está no roadmap
- 🤷 Baixa: "Seria legal ter"

**Score:** [0-25 pontos]
- 25: Dor crítica + urgência
- 15: Problema claro, não urgente
- 5: Interesse vago
- 0: Não tem problema que resolvemos

**Validação:**
"Quanto isso está custando hoje?"
"O que acontece se não resolver?"

---

## T - TIMELINE (Cronograma) ⏰

**Quando precisam decidir:**
- Esta semana
- Este mês
- Este trimestre
- "Estamos só olhando"

**Score:** [0-25 pontos]
- 25: Decisão este mês
- 15: Decisão este trimestre
- 5: Timeline vago
- 0: Sem urgência

**Red flags:**
- "Vou te dar um retorno"
- "Estamos avaliando opções"
- "Talvez ano que vem"

---

## SCORE TOTAL: [0-100]
```
╔════════════════════════════╗
║  SCORE: [X]/100 - [RATING]  ║
╚════════════════════════════╝
```

**Rating:**
- 80-100: 🔥 HOT - Perseguir agora
- 60-79: ⚡ WARM - Follow-up esta semana
- 40-59: 📧 NURTURE - Drip campaign
- 0-39: 🗑️ DESQUALIFICAR - Não vale o tempo

---

## RECOMENDAÇÃO

**Prioridade:** [Alta/Média/Baixa/Desqualificar]

**Próximo passo:**
[Ação específica - call/proposta/demo/desqualificar]

**Timing:**
[Quando fazer o próximo passo]

**Ângulo de abordagem:**
[Como posicionar baseado no que você descobriu]

---

## PERGUNTAS PARA PRÓXIMA CALL

**Sobre Budget:**
- [Pergunta específica]

**Sobre Autoridade:**
- [Pergunta específica]

**Sobre Need:**
- [Pergunta específica]

**Sobre Timeline:**
- [Pergunta específica]

---

## RED FLAGS IDENTIFICADOS

⚠️ [Lista problemas que podem travar venda]

**Como contornar:**
[Estratégia para cada red flag]

---

## TEMPLATE DE EMAIL DE FOLLOW-UP
```
Oi [Nome],

[Referência à última interação]

Pelo que entendi, [resumo da dor dele].

Empresas similares reduzem [X] em [Y]% com [solução].

Vale 15min esta semana para explorar?

[Calendly link]

[]
```

REGRA: Se score <60, pergunte mais antes de investir tempo. Não faça proposta sem BANT completo.',
    1,
    'intermediario',
    '["vendas", "qualificação", "leads"]'::jsonb,
    '["ChatGPT", "Claude"]'::jsonb,
    'a0a0d3e1-bfdb-4dd4-93c5-3dce20001d14',
    true
  ),
  
  -- Prompt 30: Criador de Pitch de Vendas
  (
    'Produto → Pitch de 60 Segundos que Abre Portas',
    'Cria elevator pitch memorável e eficaz',
    'Vendas',
    'Você é consultor de vendas. Crie pitch matador para abrir conversas:

PRODUTO/SERVIÇO: [O que você vende]
PÚBLICO-ALVO: [Quem compra]
PRINCIPAL BENEFÍCIO: [O que resolve]
DIFERENCIAL: [Por que escolher você]

PITCH ESTRUTURADO:

## VERSÃO 1: ELEVATOR PITCH (30 segundos)

**Estrutura: Problema → Solução → Prova → Call-to-Action**

"[Nome da empresa] ajuda [público-alvo] a [resolver problema específico].

Diferente de [alternativa comum], nós [diferencial].

[Cliente/Número de prova] conseguiu [resultado específico] em [tempo].

Vale 15 minutos para explorar se faz sentido para você?"

**Exemplo preenchido:**
[Versão completa com seus dados]

---

## VERSÃO 2: ABORDAGEM FRIA (45 segundos)

**Estrutura: Insight → Dor → Solução → Próximo passo**

"[Nome], notei que empresas como [empresa similar] normalmente enfrentam [problema comum].

Isso gera [consequência mensurável - ex: perda de X/mês].

Ajudamos [público] a [solução específica] sem [objeção comum].

Faz sentido uma call rápida para ver se aplica no seu caso?"

**Exemplo preenchido:**
[Versão completa]

---

## VERSÃO 3: PÓS-DEMO (20 segundos)

**Estrutura: Recapitular → Benefício → Fechar**

"Recapitulando: você viu como [funcionalidade] resolve [dor específica] que você mencionou.

Isso economizaria [X horas/R$] por [período].

O que você acha? Faz sentido avançar?"

**Exemplo preenchido:**
[Versão completa]

---

## HOOKS DE ABERTURA (escolha 1)

**Hook Estatístico:**
"Sabia que [X]% de [segmento] perde [Y] por [problema]?"

**Hook Provocativo:**
"E se eu te dissesse que [afirmação contraintuitiva]?"

**Hook Storytelling:**
"Semana passada, [cliente] estava [situação]. Hoje, [resultado]."

**Hook Curiosidade:**
"Posso te mostrar como [resultado impossível] em [tempo curto]?"

**Qual usar:**
[Recomendação baseada no seu público]

---

## OBJEÇÕES COMUNS (e respostas)

**"Não tenho tempo agora"**
→ "Entendo completamente. E se eu mandar um case de 3min que você lê quando puder?"

**"Já usamos [concorrente]"**
→ "Ótimo! Muitos clientes vinham de [concorrente] justamente porque [diferencial]. Vale comparar?"

**"Manda mais informações"**
→ "Claro! Só para personalizar: qual o maior desafio com [área]?"

**"Quanto custa?"**
→ "Depende de [variável]. Normalmente entre [range]. Mas antes, vale confirmar se resolve seu problema?"

**"Preciso pensar"**
→ "Faz sentido. O que especificamente você precisa validar?"

---

## CALL-TO-ACTIONS GRADUADOS

**CTA Leve (menos compromisso):**
- "Vale eu mandar um case rápido?"
- "Quer ver como funciona em 5min?"
- "Posso te adicionar no calendário?"

**CTA Médio:**
- "15min esta semana para explorar?"
- "Demo personalizada na próxima?"

**CTA Direto:**
- "Quando podemos implementar?"
- "Quer começar este mês ou próximo?"

**Quando usar cada:**
[Recomendação baseada no estágio]

---

## ESTRUTURA DE COLD CALL

**15 seg:** Permissão
"Oi [Nome], [Seu nome] da [Empresa]. Peguei você num mau momento?"

**30 seg:** Motivo
"Te liguei porque [razão específica não genérica]."

**45 seg:** Valor
"Ajudamos [segmento] a [resultado] sem [objeção]."

**60 seg:** Próximo passo
"Vale 15min esta semana?"

---

## PERSONALIZAÇÃO POR SEGMENTO

**Para Startups:**
Foco: Velocidade, custo-benefício, escala
Tom: Casual, ágil
Proof: Outras startups conhecidas

**Para Corporates:**
Foco: ROI, segurança, compliance
Tom: Formal, estruturado
Proof: Cases enterprise, números

**Para PMEs:**
Foco: Simplicidade, suporte, resultado rápido
Tom: Próximo, consultivo
Proof: Antes/depois visual

---

## TESTE A/B

**Versão A:** [Pitch focado em problema]
**Versão B:** [Pitch focado em resultado]

**Como testar:**
Use A com 10 prospects, B com 10 prospects
Medir: Taxa de agendamento

---

## SCRIPT COMPLETO DE APROXIMAÇÃO
```
[Intro - 5seg]
[Hook - 10seg]
[Problema - 15seg]
[Solução - 15seg]
[Prova - 10seg]
[CTA - 5seg]
```

**Total:** 60 segundos

REGRA: Pitch não é sobre você, é sobre a dor DELES. Menos features, mais resultados.',
    2,
    'intermediario',
    '["pitch", "vendas", "prospecção"]'::jsonb,
    '["ChatGPT", "Claude"]'::jsonb,
    'f0fcc6e0-bcf7-4b21-ab42-7a9f9051621b',
    true
  );