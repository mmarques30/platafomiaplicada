
# MarIAna avalia e confirma a fase do mentorado

## Problema
Atualmente, a MarIAna recebe os dados das fases do mentorado no prompt, mas a instrucao apenas diz "guie o usuario pelo processo". Isso faz com que ela pergunte genericamente "em que fase voce esta?" em vez de analisar os dados e afirmar: "Pelo que vejo, voce esta na Fase 3 - Projeto 1. Confere?"

## Alteracao

### Edge Function: `supabase/functions/ai-chat-user/index.ts`

Reescrever os blocos de instrucao de personalizacao (linhas ~359-420) para que o prompt:

1. **Declare a fase atual com confianca** em vez de perguntar:
   - Se ha fase "em_andamento": "O usuario esta na Fase X - Nome. Confirme isso e oriente sobre os proximos passos dessa fase."
   - Se todas as fases estao "pendente": "O usuario ainda nao iniciou o processo. Oriente-o a comecar pela Fase 1 - Diagnostico."
   - Se ha fases "concluida" e nenhuma "em_andamento": "O usuario concluiu ate a Fase X. Sugira iniciar a proxima fase."

2. **Inclua um resumo executivo do status** no prompt que a IA deve usar ao responder perguntas sobre progresso:
   - Diagnostico: completo/pendente
   - Quantidade de projetos ativos vs concluidos
   - Videos assistidos
   - Entregas pendentes (se Skills)

3. **Adicione instrucao explicita** ao modelo:
   - "Quando o mentorado perguntar sobre seu progresso ou proximos passos, NUNCA pergunte em que fase ele esta. Voce JA SABE. Afirme com confianca: 'Pelo que vejo nos seus dados, voce esta na fase X...' e peca confirmacao."
   - "Se os dados indicarem claramente a fase, use linguagem assertiva: 'Voce esta em...' seguido de 'Isso confere?' para validar."
   - "Se os dados forem ambiguos (ex: nenhuma fase em andamento mas algumas concluidas), faca uma deducao logica e apresente como hipotese: 'Pelos seus dados, parece que voce concluiu a fase X e esta pronto pra Y. Bora?'"

### Detalhes tecnicos

O bloco de personalizacao (linha ~359) sera expandido para construir um `statusResumo` antes de injetar no prompt:

```
// Calcular status resumido
const fasesCompletas = fases.filter(f => f.status === "concluida").length;
const projetosAtivos = projetos.filter(p => p.status === "em_andamento").length;
const projetosConcluidos = projetos.filter(p => p.status === "concluido").length;

let avaliacaoFase = "";
if (faseAtual) {
  avaliacaoFase = `FASE ATUAL CONFIRMADA: ${faseAtual.nome_fase} (Fase ${faseAtual.fase_numero}). O usuario ESTA nessa fase.`;
} else if (fasesCompletas > 0 && proximaFase) {
  avaliacaoFase = `Fases 1-${fasesCompletas} concluidas. PROXIMO PASSO: ${proximaFase.nome_fase} (Fase ${proximaFase.fase_numero}).`;
} else if (fasesCompletas === 0) {
  avaliacaoFase = `Nenhuma fase iniciada. O usuario precisa comecar pela Fase 1 - Diagnostico.`;
}
```

Esse `avaliacaoFase` sera injetado no prompt com instrucao de usar assertivamente.

A instrucao final no bloco Academy (linha ~420) sera substituida de:
```
"INSTRUCAO ACADEMY: Guie o usuario pelo processo de mentoria..."
```
Para:
```
"INSTRUCAO ACADEMY: Voce TEM os dados do mentorado. NUNCA pergunte em que fase ele esta - voce ja sabe.
Ao falar sobre progresso, AFIRME a fase com confianca e peca confirmacao.
Use: 'Pelo que vejo, voce esta na [fase]. Confere?' em vez de 'Em que fase voce esta?'"
```

A mesma logica sera aplicada aos blocos Skills e Business para consistencia.
