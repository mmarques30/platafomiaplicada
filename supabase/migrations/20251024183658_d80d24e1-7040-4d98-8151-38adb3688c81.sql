-- Adicionar 5 prompts de Produtividade à biblioteca
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
(
  'Tarefas → Matriz de Eisenhower Automática',
  'Prioriza tudo e diz o que fazer primeiro',
  'Produtividade',
  'Você é especialista em gestão do tempo. Classifique estas tarefas na Matriz de Eisenhower:

MINHAS TAREFAS:
[Liste tudo que está pendente]

MEU CONTEXTO:
- Objetivo principal esta semana/mês: [Especifique]
- Cargo/área: [Para entender importância]

CLASSIFICAÇÃO AUTOMÁTICA:

## QUADRANTE 1: 🔥 URGENTE E IMPORTANTE (FAZER JÁ)

**Fazer HOJE, não amanhã:**

1. **[Tarefa]**
   - Por que urgente: [Explicação]
   - Por que importante: [Impacto]
   - Prazo: [Quando]
   - Tempo estimado: [X] min
   - Fazer em: [Horário sugerido]

[Máximo 3 tarefas - se tiver mais, algo está errado]

---

## QUADRANTE 2: 📅 NÃO URGENTE MAS IMPORTANTE (AGENDAR)

**Agendar para esta semana:**

1. **[Tarefa]**
   - Por que importante: [Contribui para objetivo principal]
   - Quando fazer: [Dia/horário sugerido]
   - Tempo necessário: [X]h
   
[Essas são suas tarefas mais valiosas - 80% do resultado vem daqui]

---

## QUADRANTE 3: ⚡ URGENTE MAS NÃO IMPORTANTE (DELEGAR/SIMPLIFICAR)

**Resolver rápido ou delegar:**

1. **[Tarefa]**
   - Por que urgente mas não importante: [Explicação]
   - **Opções:**
     - Delegar para: [Quem poderia fazer]
     - Simplificar: [Fazer em 20% do tempo]
     - Automatizar: [Se repetitivo]
     - Template: [Se recorrente]

[Cuidado: Isso dá ilusão de produtividade mas não te leva à meta]

---

## QUADRANTE 4: 🗑️ NEM URGENTE NEM IMPORTANTE (ELIMINAR)

**Parar de fazer:**

1. **[Tarefa]**
   - Por que está na lista: [Motivo]
   - **Recomendação:** ELIMINAR
   - O que acontece se não fizer: [Provavelmente nada]

[Seja honesto: você pode simplesmente não fazer isso?]

---

## ANÁLISE DA SUA LISTA

**Distribuição atual:**
- Q1 (Urgente+Importante): [N] tarefas ([X]%)
- Q2 (Importante): [N] tarefas ([X]%)
- Q3 (Urgente): [N] tarefas ([X]%)
- Q4 (Eliminar): [N] tarefas ([X]%)

**Diagnóstico:**

✓ **Ideal:** 60-70% no Q2, 20-30% no Q1, 10% no Q3, 0% no Q4
❌ **Seu caso:** [Análise]

**Red flags:**
- [ ] Muitas tarefas em Q1? (Você está bombeiro, não estrategista)
- [ ] Poucas tarefas em Q2? (Está reagindo, não planejando)
- [ ] Muitas em Q3? (Está desperdiçando energia)

## PLANO DE AÇÃO

**HOJE:**
Fazer: [Q1 - tarefas]
Tempo total: [X] horas

**ESTA SEMANA:**
Agendar: [Q2 - tarefas]
Segunda: [tarefa]
Terça: [tarefa]
...

**DELEGAR/SIMPLIFICAR:**
[Q3 - como resolver rápido]

**ELIMINAR DA LISTA:**
[Q4 - liberar mental]

## PRÓXIMA SEMANA

Para não ter tantas tarefas em Q1 (urgente):
→ Bloqueie 2h/dia para Q2 (importante não urgente)
→ Diga não para [tipo de solicitação comum]
→ Automatize [processo repetitivo identificado]

REGRA: Se tudo é urgente, nada é urgente. Priorizar é dizer NÃO.',
  1,
  'intermediario',
  '["priorização", "eisenhower", "foco"]'::jsonb,
  '["ChatGPT", "Claude"]'::jsonb,
  'a1fb1c00-d7d7-4aa7-a5ff-14b48f9892bf'::uuid,
  true
),
(
  'Reunião em 2 Horas → Briefing Completo em 5 Min',
  'Prepara você para qualquer reunião rapidamente',
  'Produtividade',
  'Você é meu Chief of Staff. Prepare-me para esta reunião:

REUNIÃO: [Título/objetivo]
COM QUEM: [Nomes/cargos]
QUANDO: [Data/hora - daqui X horas]
DURAÇÃO: [X minutos]
CONTEXTO: [O que já aconteceu / decisão pendente]
MEU OBJETIVO: [O que EU quero que saia dessa reunião]

BRIEFING EXECUTIVO:

## TL;DR (Leia ISSO primeiro)

**Em 1 frase, esta reunião é sobre:**
[Resumo direto]

**Você precisa sair com:**
[Decisão/aprovação/alinhamento específico]

**Seu papel:**
[Liderar / Influenciar / Apenas ouvir / Apresentar]

---

## AGENDA PROPOSTA (com timebox)

Total: [X] minutos

**0-5min:** Contexto/alinhamento inicial
- Você: "[Frase de abertura sugerida]"

**5-15min:** [Tópico principal]
- Objetivo: [O que decidir]
- Pontos a cobrir: [liste]

**15-25min:** [Discussão/perguntas]
- Você deve: [Ouvir / Questionar / Propor]

**25-30min:** Próximos passos e responsáveis
- Você fecha com: "[Frase de fechamento sugerida]"

---

## O QUE VOCÊ DEVE FALAR

**Pontos obrigatórios para você levantar:**

1. **[Ponto crítico]**
   - Quando: [No início / No meio / Se ninguém falar]
   - Frase sugerida: "[Exemplo]"
   - Por que importa: [Justificativa]

2. **[Ponto importante]**
   - Quando: [Timing]
   - Como posicionar: [Tom/abordagem]

3. **[Pergunta estratégica]**
   - Para fazer se [situação X]
   - Pergunta: "[Exemplo]"

---

## PERGUNTAS QUE VÃO TE FAZER (e respostas)

**Provável pergunta 1:** "[Pergunta esperada]"
**Sua resposta:**
"[Resposta estruturada com dados/fatos]"
**Backup:** Se questionarem, mencione [dado adicional]

**Provável pergunta 2:** "[Pergunta difícil]"
**Sua resposta:**
"[Como responder sem se comprometer]"

**Pergunta armadilha:** "[Pergunta com pegadinha]"
**Como evitar:** "[Resposta que desvia]"

---

## PERFIL DOS PARTICIPANTES

**[Nome 1] - [Cargo]**
- Estilo: [Direto / Detalhista / Político]
- Quer ouvir: [Tipo de informação]
- Evite: [O que não dizer perto dele]
- Como conquistar: [Estratégia]

[Repita para participantes-chave]

---

## DECISÕES QUE PRECISAM SAIR

**Decisão 1:** [Especifique]
- Sua posição: [Favorável / Contra / Neutro]
- Argumentos: [Liste]
- Quem precisa aprovar: [Nome]

**Decisão 2:** [Especifique]
[Repita estrutura]

---

## FOLLOW-UPS OBRIGATÓRIOS

**Durante a reunião, combinar:**
- [ ] Responsável por [ação X]
- [ ] Prazo para [entrega Y]
- [ ] Próxima reunião em [quando]

**Imediatamente após:**
- [ ] Enviar email com resumo
- [ ] Agendar follow-up com [quem]
- [ ] Atualizar [sistema/doc]

---

## POSSÍVEIS CENÁRIOS

**CENÁRIO 1: Tudo vai bem**
→ Decisões saem conforme planejado
→ Você fecha com: "[Frase de fechamento positivo]"

**CENÁRIO 2: Alguém bloqueia decisão**
→ Pessoa: [Quem provavelmente]
→ Motivo: [Por quê]
→ Sua resposta: "[Como contornar]"
→ Plano B: [Reunião 1:1 depois]

**CENÁRIO 3: Falta informação crítica**
→ Você: "Vamos encerrar agora e reagendar com [dado X]?"
→ Novo prazo: [Quando]

---

## CHECKLIST PRÉ-REUNIÃO (5min antes)

- [ ] Releu este briefing
- [ ] Abriu [documento/planilha relevante]
- [ ] Água/café próximo
- [ ] Celular no silencioso
- [ ] Mental: Respire fundo, você está preparado

## TEMPLATE DE ATA PÓS-REUNIÃO
```
DECISÕES:
- [D1]
- [D2]

AÇÕES:
- [ ] [Ação] - [Responsável] - [Prazo]

PENDÊNCIAS:
- [O que ficou em aberto]

PRÓXIMA REUNIÃO:
[Data] para [decidir X]
```

REGRA: Reunião sem decisão é reunião perdida. Sempre feche com próximos passos claros.',
  2,
  'intermediario',
  '["reunião", "preparação", "briefing"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '4fc01345-48d5-4459-a10e-26fd18648721'::uuid,
  true
),
(
  'Tarefa → Briefing Completo de Delegação',
  'Delega com clareza para não voltar refazer',
  'Produtividade',
  'Você é coach de liderança. Me ajude a delegar esta tarefa sem perder controle:

TAREFA: [O que precisa ser feito]
PARA QUEM: [Nome/perfil - sênior/júnior/especialista]
PRAZO: [Quando precisa estar pronto]
POR QUE DELEGAR: [Seu objetivo ao delegar]

BRIEFING DE DELEGAÇÃO:

## TÍTULO DO PROJETO/TAREFA
"[Nome claro e orientado a resultado]"

---

## CONTEXTO (Por que isso importa)

**Situação atual:**
[Explique o problema/oportunidade em 2-3 linhas]

**Por que estamos fazendo:**
[Impacto/importância para o negócio]

**Como isso se conecta aos objetivos maiores:**
[Visão geral]

---

## OBJETIVO (O que é sucesso)

**Resultado esperado:**
[Seja específico - formato, qualidade, métricas]

**Sucesso se parece com:**
✓ [Critério 1 - mensurável]
✓ [Critério 2 - mensurável]
✓ [Critério 3 - mensurável]

**Não é sucesso se:**
❌ [Anti-padrão 1]
❌ [Anti-padrão 2]

---

## ENTREGÁVEL

**Formato:** [Doc / Planilha / Apresentação / Código / Relatório]

**Especificações:**
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

**Exemplo de referência:**
[Link para algo similar bem feito]

**Template (se houver):**
[Link ou anexo]

---

## RECURSOS DISPONÍVEIS

**Informações/dados que você tem:**
- [Fonte 1]: [Onde encontrar]
- [Fonte 2]: [Onde encontrar]

**Pessoas que podem ajudar:**
- [Nome 1]: Consultar sobre [o quê]
- [Nome 2]: Consultar sobre [o quê]

**Ferramentas/acessos necessários:**
- [Ferramenta]: [Como acessar]

**Tempo alocado:**
[X] horas (não precisa usar tudo, é limite máximo)

---

## AUTONOMIA E LIMITES

**Você pode decidir sozinho:**
- [Decisão tipo 1]
- [Decisão tipo 2]

**Precisa me consultar antes:**
- [Decisão crítica 1]
- [Decisão crítica 2]

**Não faça sem aprovação:**
- [Limite claro]

---

## CHECKPOINTS

**Checkpoint 1:** [Data/dia]
- Você deve ter: [Milestone específico]
- Vamos alinhar: [O quê revisar]
- Formato: [Mensagem / Call de 15min / Apresentar]

**Checkpoint 2:** [Data/dia]
- Você deve ter: [Milestone]
- Feedback esperado: [Tipo]

**Entrega final:** [Data/hora exata]

---

## PERGUNTAS FREQUENTES (antecipadas)

**"E se [situação comum]?"**
→ Nesse caso: [Orientação]

**"Qual prioridade entre [A e B]?"**
→ Priorize [A], porque [razão]

**"Posso fazer [variação]?"**
→ [Sim, desde que / Não, porque / Me consulte]

---

## CRITÉRIOS DE QUALIDADE

**Mínimo aceitável (70%):**
[Descrição do que é "ok mas não ótimo"]

**Bom trabalho (85%):**
[Descrição do que é "atende bem"]

**Excelente (95%+):**
[Descrição do que é "superou expectativa"]

**Para esta tarefa, espero:**
[Bom trabalho / Excelente] - Justificativa: [Por quê]

---

## COMUNICAÇÃO

**Como tirar dúvidas:**
- Dúvidas rápidas (<2min): [Slack/WhatsApp]
- Dúvidas complexas: [Agendar 15min]
- Urgências: [Como me achar]

**Status updates:**
[Não precisa / Diário / Ao final de cada checkpoint]

---

## SE ALGO DER ERRADO

**Se atrasar:**
→ Me avise com [X] dias de antecedência
→ Vamos ajustar: [Escopo / Prazo / Recursos]

**Se travar:**
→ Não fique mais de [X horas] travado
→ Peça ajuda para: [Mim / Colega Y]

**Se mudar o contexto:**
→ Podemos revalidar objetivo

---

## MOTIVAÇÃO (Por que você é a pessoa certa)

Esta tarefa foi delegada para você porque:
- [Skill específico que você tem]
- [Oportunidade de desenvolvimento]
- [Confiança em sua capacidade]

**Oportunidade de crescimento:**
[O que você vai aprender/demonstrar]

---

## CHECKLIST DE ACEITE

Antes de começar, confirme que você entendeu:
- [ ] O objetivo está claro?
- [ ] O entregável está claro?
- [ ] O prazo é viável?
- [ ] Tem os recursos necessários?
- [ ] Sabe onde buscar ajuda?

**Se qualquer resposta foi "não", vamos alinhar agora.**

---

## EXEMPLO DE EMAIL/MENSAGEM
```
Oi [Nome],

Preciso da sua ajuda com [tarefa]. Enviei briefing completo [anexo/link].

TL;DR:
- O quê: [1 linha]
- Por quê: [1 linha]
- Quando: [Prazo]
- Checkpoint 1: [Data]

Bate uma dúvida antes de começar?

Valeu!
```

REGRA: Delegação ruim = "Faz isso aí". Delegação boa = Briefing completo. Não volte para refazer.',
  3,
  'avancado',
  '["delegação", "briefing", "gestão"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  'a1fb1c00-d7d7-4aa7-a5ff-14b48f9892bf'::uuid,
  true
),
(
  '20+ Emails → 1 Resumo Executivo',
  'Extrai decisões e ações de thread longo',
  'Produtividade',
  'Você é assistente executivo. Resuma este thread de emails e extraia o que importa:

[COLE O THREAD COMPLETO DE EMAILS]

CONSOLIDAÇÃO:

## EM 1 FRASE
[O que este thread resolveu ou decidiu]

---

## CONTEXTO RÁPIDO
[Resumo em 3 linhas do que estava sendo discutido]

---

## DECISÕES TOMADAS

1. **[Decisão 1]**
   - Decidido por: [Quem]
   - Quando: [Data]
   - Justificativa: [Por quê]

2. **[Decisão 2]**
   [Repita]

**Se nenhuma decisão foi tomada:**
⚠️ Este thread tem [X] emails mas nenhuma decisão. Alguém precisa decidir.

---

## AÇÕES COMBINADAS (Action Items)

- [ ] [Ação 1] - Responsável: [Nome] - Prazo: [Data]
- [ ] [Ação 2] - Responsável: [Nome] - Prazo: [Data]

**Suas ações:**
- [ ] [O que VOCÊ precisa fazer]

---

## PENDÊNCIAS NÃO RESOLVIDAS

**Ainda falta definir:**
1. [Questão em aberto]
2. [Questão em aberto]

**Bloqueadores:**
- [O que está travando progresso]

---

## PRÓXIMOS PASSOS

**Imediato:**
[O que fazer agora]

**Esta semana:**
[O que agendar]

**Acompanhamento:**
[Quando revisar progresso]

---

## PARTICIPANTES E POSIÇÕES

**[Nome 1]:** [A favor / Contra / Neutro] - [Argumento principal]
**[Nome 2]:** [Posição] - [Argumento]

**Consenso?** [SIM / NÃO / PARCIAL]

---

## RED FLAGS

❌ [Algo que preocupa neste thread]
⚠️ [Risco identificado]
⏰ [Prazo apertado]

---

## TEMPLATE DE RESPOSTA (se necessário)
```
Time,

Consolidando nosso thread:

DECIDIMOS:
- [D1]
- [D2]

AÇÕES:
- [A1]
- [A2]

PRÓXIMO PASSO:
[Especificar]

[]
```

REGRA: Thread com >10 emails geralmente significa que reunião teria sido mais eficiente.',
  4,
  'iniciante',
  '["email", "consolidação", "resumo"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '13f999df-c5a1-428f-9993-79c9b0ca0ebc'::uuid,
  true
),
(
  'Check-in Semanal Estruturado e Produtivo',
  'Pauta que transforma 1:1 em ferramenta de desenvolvimento',
  'Produtividade',
  'Você é coach de liderança. Prepare minha reunião 1:1 com liderado:

LIDERADO: [Nome]
CARGO: [Posição]
ÚLTIMA 1:1: [Resumo ou principais pontos]
PROJETOS ATUAIS: [Liste]
OBJETIVO DO MÊS: [Objetivo dele]

PAUTA ESTRUTURADA:

## PRÉ-1:1 (Enviar 1 dia antes)
```
Oi [Nome]!

Nossa 1:1 é amanhã às [hora]. Para aproveitarmos bem os 30min, me manda até [hora] de hoje:

1. Como você está (pessoal/profissional)?
2. Progresso nos projetos (vitórias/obstáculos)?
3. O que você precisa de mim?

Valeu!
```

---

## AGENDA DA 1:1 (30 minutos)

### 0-5min: CHECK-IN PESSOAL 🤝

**Você pergunta:**
"Como você está? E fora do trabalho?"

**O que ouvir:**
- Sinais de burnout (cansaço, desmotivação)
- Situações pessoais afetando trabalho
- Nível de satisfação geral

**Se identificar problema:**
→ "O que eu posso fazer para ajudar?"
→ Não resolver, mas oferecer suporte

---

### 5-20min: PROJETOS E PROGRESSO 🎯

**Para cada projeto ativo:**

**[Projeto 1]:**
- Status: [Verde/Amarelo/Vermelho]
- Progresso desde última 1:1: [O que avançou]
- Próximo milestone: [Data]

**Você pergunta:**
- "O que está travando?"
- "Você tem o que precisa?"
- "Onde posso destravar?"

**Vitórias para celebrar:**
[O que deu certo - sempre reconheça]

**Obstáculos:**
[Liste e defina ação para cada]

**Decisões necessárias:**
[O que ele precisa de você]

---

### 20-28min: DESENVOLVIMENTO 📈

**Rotacionar semanalmente:**

**SEMANA 1:** Desenvolvimento de skill
- "O que você quer melhorar?"
- "Como posso te ajudar?"
- Recomendar: [Curso / Livro / Pessoa para conversar]

**SEMANA 2:** Feedback
- Dar 1 feedback específico (positivo ou construtivo)
- Pedir feedback sobre sua liderança
- Formato SBI: Situação-Comportamento-Impacto

**SEMANA 3:** Visão de carreira
- "Onde você se vê daqui 1 ano?"
- "O que falta para chegar lá?"
- Alinhar expectativas

**SEMANA 4:** Livre
- "O que você quer conversar hoje?"
- Espaço para trazer tópicos dele

---

### 28-30min: FECHAMENTO E PRÓXIMOS PASSOS ✅

**Recapitular:**
- Decisões tomadas: [Liste]
- Ações minhas: [O que EU vou fazer]
- Ações dele: [O que ELE vai fazer]

**Você fecha com:**
"Mais alguma coisa que eu deveria saber?"
[Sempre dê chance de trazer assunto extra]

---

## CHECKLIST PÓS-1:1 (Fazer hoje)

- [ ] Enviar resumo por escrito
- [ ] Cumprir ações que prometi
- [ ] Atualizar doc de desenvolvimento dele
- [ ] Agendar próxima 1:1

---

## TEMPLATE DE RESUMO
```
[Nome],

Nossa 1:1 de hoje:

DECISÕES:
- [D1]

AÇÕES MINHAS:
- [ ] [A1] - até [data]

AÇÕES SUAS:
- [ ] [A2] - até [data]

PRÓXIMA 1:1:
[Data/hora]

Esqueci algo?
```

---

## PERGUNTAS PODEROSAS (use 1-2 por 1:1)

**Sobre progresso:**
- "Do 0-10, como você avalia seu progresso esta semana?"
- "O que te deixaria em 10?"

**Sobre obstáculos:**
- "Se você pudesse mudar uma coisa para facilitar seu trabalho, o que seria?"
- "O que eu estou fazendo que atrapalha você?"

**Sobre motivação:**
- "O que te energizou esta semana?"
- "O que te drenou energia?"

**Sobre desenvolvimento:**
- "Que habilidade você quer ter daqui 6 meses?"
- "Quem na empresa você admira e por quê?"

---

## RED FLAGS PARA IDENTIFICAR

⚠️ **Desmotivação:**
- Respostas curtas/monossilábicas
- "Tudo bem" quando claramente não está
- Perda de entusiasmo

⚠️ **Sobrecarga:**
- Mencionando trabalhar noite/fim de semana
- Projetos atrasando consistentemente
- Sinais físicos de cansaço

⚠️ **Desalinhamento:**
- Foco em coisas que não são prioridade
- Não lembra objetivos do mês
- Questionando decisões já tomadas

**Se identificar:**
→ Endereçe NA HORA, não espere
→ Seja direto: "Percebi [X], o que está acontecendo?"

---

## FREQUÊNCIA E CONSISTÊNCIA

**Regra de ouro:**
- 1:1s são **SAGRADAS**
- Só remarcar em emergência
- Nunca cancelar, sempre reagendar

**Se você remarcar >2x:**
→ Você está dizendo que ele não é prioridade
→ Confiança quebra

---

## ERROS COMUNS A EVITAR

❌ Transformar em status report (ele já manda isso)
❌ Você falar 80% do tempo (deve ser 20/80)
❌ Usar para dar bronca (agende outra call)
❌ Olhar celular/emails (respeito total)
❌ Não cumprir ações que prometeu

✓ Escute mais que fala
✓ Faça perguntas, não dê respostas prontas
✓ Foque nele, não em você

REGRA: 1:1 é o tempo DELE, não reunião de status. Use para desenvolver, não para controlar.',
  5,
  'avancado',
  '["1:1", "liderança", "desenvolvimento"]'::jsonb,
  '["Claude", "ChatGPT"]'::jsonb,
  '996e5c83-d930-41a9-ba4e-768a84a07d2f'::uuid,
  true
);