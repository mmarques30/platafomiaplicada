import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════

interface PassoExtraido {
  numero: number;
  titulo: string;
  entregaNumero: number;
  conteudo_completo: string;
  descricao: string;
  prompt_sugerido?: string;
  dicas?: string;
  ferramenta: string;
  responsavel: string;
}

interface AncorasLiterais {
  fases: { numero: number; titulo: string; conteudo: string }[];
  entregas: { numero: number; titulo: string; faseNumero: number }[];
  passos: PassoExtraido[];
  checklists: { titulo: string; entregaNumero: number }[];
  mvp: { titulo: string }[];
  conjuntas: { titulo: string; status: string }[];
  backlog: { titulo: string; secao: string }[];
}

interface ResultadoParcial {
  etapas: any[];
  entregas: any[];
  instrucoes: any[];
  tasks: any[];
  backlog: any[];
}

// ═══════════════════════════════════════════════════════════════════
// NORMALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════

const FERRAMENTAS_VALIDAS = ["claude", "lovable", "drive", "notion", "supabase", "make", "n8n", "zapier", "mapa", "reuniao", "outro"];

function normalizarFerramenta(ferramenta: string | undefined): string {
  if (!ferramenta) return "outro";
  
  const ferramentaLower = ferramenta.toLowerCase().trim();
  
  const mapeamento: Record<string, string> = {
    "claude": "claude",
    "lovable": "lovable",
    "mapa": "mapa",
    "drive": "drive",
    "google drive": "drive",
    "notion": "notion",
    "supabase": "supabase",
    "make": "make",
    "n8n": "n8n",
    "zapier": "zapier",
    "reunião": "reuniao",
    "reuniao": "reuniao",
    "call": "reuniao",
    "grupo": "reuniao",
    "meet": "reuniao",
    "zoom": "reuniao",
  };
  
  return mapeamento[ferramentaLower] || 
         (FERRAMENTAS_VALIDAS.includes(ferramentaLower) ? ferramentaLower : "outro");
}

function normalizarResponsavel(texto: string | undefined): "voce" | "mentor" | "conjunto" {
  if (!texto) return "voce";
  
  const textoLower = texto.toLowerCase().trim();
  
  if (textoLower.includes("conjunto") || 
      textoLower.includes("juntos") || 
      textoLower.includes("mariana + paula") ||
      textoLower.includes("paula + mariana") ||
      textoLower.includes("em conjunto")) {
    return "conjunto";
  }
  
  if (textoLower.includes("mariana") || 
      textoLower.includes("mari") || 
      textoLower.includes("mentora") ||
      textoLower === "mentor") {
    return "mentor";
  }
  
  return "voce";
}

// ═══════════════════════════════════════════════════════════════════
// DETECÇÃO AUTOMÁTICA DE FERRAMENTA E RESPONSÁVEL
// ═══════════════════════════════════════════════════════════════════

function detectarFerramenta(texto: string): string {
  const textoLower = texto.toLowerCase();
  
  // Ordem de prioridade: mais específico primeiro
  if (textoLower.includes('lovable')) return 'lovable';
  if (textoLower.includes('claude') || textoLower.includes('prompt') || textoLower.includes(' ia ') || textoLower.includes('copie e cole')) return 'claude';
  if (textoLower.includes('mapa') || textoLower.includes('fluxo') || textoLower.includes('proceso')) return 'mapa';
  if (textoLower.includes('drive') || textoLower.includes('google')) return 'drive';
  if (textoLower.includes('notion')) return 'notion';
  if (textoLower.includes('supabase')) return 'supabase';
  if (textoLower.includes('make')) return 'make';
  if (textoLower.includes('n8n')) return 'n8n';
  if (textoLower.includes('zapier')) return 'zapier';
  if (textoLower.includes('reunião') || textoLower.includes('call') || textoLower.includes('meet') || textoLower.includes('grupo')) return 'reuniao';
  
  return 'outro';
}

function detectarResponsavel(texto: string): "voce" | "mentor" | "conjunto" {
  const textoLower = texto.toLowerCase();
  
  if (textoLower.includes('em conjunto') || textoLower.includes('juntos') || textoLower.includes('mariana + paula')) {
    return 'conjunto';
  }
  if (textoLower.includes('mariana') || textoLower.includes('mentora') || textoLower.includes('mari ')) {
    return 'mentor';
  }
  
  return 'voce';
}

// ═══════════════════════════════════════════════════════════════════
// EXTRAÇÃO DE PROMPTS E DICAS DO CONTEÚDO
// ═══════════════════════════════════════════════════════════════════

function extrairPrompt(conteudo: string): string | undefined {
  // Padrão 1: Texto entre aspas após "prompt" ou "cole"
  const regexAspas = /(?:prompt|cole\s+o\s+prompt|copie\s+e\s+cole|mensagem)[:\s]*["'"]([\s\S]+?)["'"]/i;
  const matchAspas = conteudo.match(regexAspas);
  if (matchAspas && matchAspas[1].length > 30) {
    return matchAspas[1].trim();
  }
  
  // Padrão 2: Bloco de texto grande após "Prompt:" ou similar
  const regexBloco = /(?:prompt|cole\s+no\s+claude|envie\s+para\s+o\s+claude)[:\s]*([\s\S]{50,}?)(?=\n\n|\nDICA|\nOBS|\nATENÇÃO|\nIMPORTANTE|\nPASSO|$)/i;
  const matchBloco = conteudo.match(regexBloco);
  if (matchBloco && matchBloco[1].length > 50) {
    return matchBloco[1].trim();
  }
  
  // Padrão 3: Texto entre aspas curvas ou retas
  const regexAspasLongas = /["'"]([\s\S]{80,}?)["'"]/;
  const matchAspaslongas = conteudo.match(regexAspasLongas);
  if (matchAspaslongas) {
    return matchAspaslongas[1].trim();
  }
  
  return undefined;
}

function extrairDicas(conteudo: string): string | undefined {
  // Padrão: "DICA:", "DICAS:", "Obs:", "ATENÇÃO:", "IMPORTANTE:"
  const regexDicas = /(?:DICAS?|OBS|ATENÇÃO|IMPORTANTE|OBSERVAÇÃO)[:\s]*([^\n]+(?:\n(?!\s*PASSO|\s*\d+\s*[-–:])[^\n]+)*)/i;
  const match = conteudo.match(regexDicas);
  if (match && match[1].length > 5) {
    return match[1].trim();
  }
  
  return undefined;
}

function extrairDescricao(conteudo: string, titulo: string): string {
  // Remover título e extrair descrição (linhas após título, antes de prompt/dicas)
  const linhas = conteudo.split('\n');
  const descricaoLinhas: string[] = [];
  let iniciou = false;
  
  for (const linha of linhas) {
    const linhaTrimmed = linha.trim();
    
    // Pular linha do título
    if (!iniciou && linhaTrimmed.toLowerCase().includes(titulo.toLowerCase().substring(0, 20))) {
      iniciou = true;
      continue;
    }
    
    if (!iniciou) continue;
    
    // Parar em marcadores de prompt/dicas
    if (linhaTrimmed.match(/^(prompt|dica|obs|atenção|importante|copie|cole)/i)) {
      break;
    }
    
    // Parar em aspas (início de prompt)
    if (linhaTrimmed.startsWith('"') || linhaTrimmed.startsWith("'") || linhaTrimmed.startsWith('"')) {
      break;
    }
    
    if (linhaTrimmed.length > 2) {
      descricaoLinhas.push(linhaTrimmed);
    }
  }
  
  return descricaoLinhas.slice(0, 5).join(' ').trim(); // Limitar a 5 linhas
}

// ═══════════════════════════════════════════════════════════════════
// EXTRAÇÃO DE JSON
// ═══════════════════════════════════════════════════════════════════

function extractJsonFromResponse(response: string): any {
  let cleaned = response
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object found in response");
  }

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  cleaned = cleaned
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\r\n/g, "\\n")
    .replace(/\r/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("First parse failed, attempting recovery...");
    
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\\n/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, "'")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2026/g, "...")
      .replace(/[\u2013\u2014]/g, "-");

    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      console.log("Second parse failed, returning empty structure");
      return {
        etapas: [],
        entregas: [],
        instrucoes: [],
        tasks: [],
        backlog: []
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PRE-PARSER COM REGEX - EXTRAI ÂNCORAS LITERAIS ANTES DA IA
// ═══════════════════════════════════════════════════════════════════

function extrairAncorasLiterais(texto: string): AncorasLiterais {
  console.log("=== PRE-PARSER: Extraindo âncoras literais ===");
  
  const ancoras: AncorasLiterais = {
    fases: [],
    entregas: [],
    passos: [],
    checklists: [],
    mvp: [],
    conjuntas: [],
    backlog: [],
  };
  
  // 1. FASES - Padrões: "FASE 1:", "FASE 1 -", "FASE 1.", "# FASE 1"
  const regexFase = /(?:^|\n)[\s#]*(?:FASE|ETAPA)\s*(\d+)\s*[:\-–.]\s*(.+?)(?=\n|$)/gi;
  let matchFase;
  while ((matchFase = regexFase.exec(texto)) !== null) {
    const numero = parseInt(matchFase[1]);
    const titulo = matchFase[2].trim()
      .replace(/\*+/g, '')
      .replace(/\(.*?\)/, '')
      .trim();
    
    if (titulo.length > 2 && !ancoras.fases.some(f => f.numero === numero)) {
      // Encontrar conteúdo até próxima fase
      const startPos = matchFase.index;
      const nextFaseMatch = texto.substring(startPos + matchFase[0].length).match(/(?:^|\n)[\s#]*(?:FASE|ETAPA)\s*\d+\s*[:\-–.]/i);
      const endPos = nextFaseMatch 
        ? startPos + matchFase[0].length + (nextFaseMatch.index || 0)
        : texto.length;
      
      ancoras.fases.push({
        numero,
        titulo,
        conteudo: texto.substring(startPos, endPos)
      });
      console.log(`  FASE ${numero}: ${titulo}`);
    }
  }
  
  // 2. ENTREGAS - Padrões: "ENTREGA 1:", "Entrega 3 -"
  const regexEntrega = /(?:^|\n)\s*(?:ENTREGA)\s*(\d+)\s*[:\-–.]\s*(.+?)(?=\n|$)/gi;
  let matchEntrega;
  let ultimaFase = 1;
  
  while ((matchEntrega = regexEntrega.exec(texto)) !== null) {
    const numero = parseInt(matchEntrega[1]);
    const titulo = matchEntrega[2].trim()
      .replace(/\*+/g, '')
      .trim();
    
    // Determinar a qual fase pertence
    const posicaoEntrega = matchEntrega.index;
    for (const fase of ancoras.fases) {
      const faseStart = texto.indexOf(fase.conteudo);
      const faseEnd = faseStart + fase.conteudo.length;
      if (posicaoEntrega >= faseStart && posicaoEntrega < faseEnd) {
        ultimaFase = fase.numero;
        break;
      }
    }
    
    if (titulo.length > 2 && !ancoras.entregas.some(e => e.numero === numero)) {
      ancoras.entregas.push({
        numero,
        titulo,
        faseNumero: ultimaFase
      });
      console.log(`  ENTREGA ${numero}: ${titulo} (Fase ${ultimaFase})`);
    }
  }
  
  // 3. PASSOS - EXTRAÇÃO COMPLETA com prompt, dicas, ferramenta, responsável
  console.log("  Extraindo PASSOS com conteúdo completo...");
  
  for (const entrega of ancoras.entregas) {
    // Encontrar todo o texto da entrega até a próxima entrega
    const regexEntregaConteudo = new RegExp(
      `ENTREGA\\s*${entrega.numero}[\\s\\S]*?(?=ENTREGA\\s*${entrega.numero + 1}|ENTREGAS\\s+EM\\s+CONJUNTO|$)`, 
      'i'
    );
    const entregaMatch = texto.match(regexEntregaConteudo);
    
    if (entregaMatch) {
      const textoEntrega = entregaMatch[0];
      
      // Regex que captura PASSO + TODO conteúdo até próximo PASSO ou fim
      const regexPassoCompleto = /PASSO\s*(\d{1,2})\s*[:\-–]\s*([\s\S]*?)(?=\nPASSO\s*\d{1,2}\s*[:\-–]|\nENTREGA\s*\d|☐|$)/gi;
      
      let mp;
      while ((mp = regexPassoCompleto.exec(textoEntrega)) !== null) {
        const numPasso = parseInt(mp[1]);
        const conteudoCompleto = mp[2].trim();
        
        // Extrair título (primeira linha significativa, sem asteriscos)
        const primeiraLinha = conteudoCompleto.split('\n')[0];
        const titulo = primeiraLinha
          .replace(/\*+/g, '')
          .replace(/^[-–:\s]+/, '')
          .trim();
        
        if (titulo.length < 3 || titulo.length > 200) continue;
        
        // Extrair detalhes do conteúdo
        const prompt = extrairPrompt(conteudoCompleto);
        const dicas = extrairDicas(conteudoCompleto);
        const descricao = extrairDescricao(conteudoCompleto, titulo);
        const ferramenta = detectarFerramenta(conteudoCompleto);
        const responsavel = detectarResponsavel(conteudoCompleto);
        
        ancoras.passos.push({
          numero: numPasso,
          titulo,
          entregaNumero: entrega.numero,
          conteudo_completo: conteudoCompleto,
          descricao: descricao || '',
          prompt_sugerido: prompt,
          dicas: dicas,
          ferramenta,
          responsavel
        });
        
        console.log(`    PASSO ${numPasso} (Entrega ${entrega.numero}): ${titulo.substring(0, 40)}... [${ferramenta}] ${prompt ? '📋 PROMPT' : ''} ${dicas ? '💡 DICAS' : ''}`);
      }
    }
  }
  
  console.log(`  Total de passos extraídos com detalhes: ${ancoras.passos.length}`);
  
  // 4. CHECKLISTS - Padrões: "☐", "□", "[ ]", "✓"
  const regexChecklist = /[☐□✓✔]\s*(.+?)(?=\n|$)/gi;
  let matchCheck;
  let ultimaEntrega = 1;
  
  while ((matchCheck = regexChecklist.exec(texto)) !== null) {
    const titulo = matchCheck[1].trim()
      .replace(/\?$/, '?')
      .replace(/\*+/g, '')
      .trim();
    
    // Determinar entrega do checklist
    const posicao = matchCheck.index;
    for (const entrega of ancoras.entregas.slice().reverse()) {
      const entregaMatch = texto.indexOf(`ENTREGA ${entrega.numero}`);
      if (entregaMatch !== -1 && posicao > entregaMatch) {
        ultimaEntrega = entrega.numero;
        break;
      }
    }
    
    if (titulo.length > 3 && titulo.length < 300) {
      ancoras.checklists.push({
        titulo,
        entregaNumero: ultimaEntrega
      });
    }
  }
  console.log(`  Checklists encontrados: ${ancoras.checklists.length}`);
  
  // 5. MVP - Seção "MVP" ou "Primeira Entrega"
  const mvpMatch = texto.match(/(?:MVP|Primeira Entrega|Escopo Acordado)[\s\S]*?(?=Pós-MVP|FASE|ENTREGAS EM CONJUNTO|$)/i);
  if (mvpMatch) {
    const mvpText = mvpMatch[0];
    const regexItem = /[-•]\s*([^-•\n]+)/g;
    let itemMatch;
    while ((itemMatch = regexItem.exec(mvpText)) !== null) {
      const titulo = itemMatch[1].trim()
        .replace(/\*+/g, '')
        .trim();
      if (titulo.length > 5 && titulo.length < 200 && !titulo.toLowerCase().includes('pós-mvp')) {
        ancoras.mvp.push({ titulo });
      }
    }
    console.log(`  MVP items: ${ancoras.mvp.length}`);
  }
  
  // 6. ENTREGAS EM CONJUNTO
  const conjuntaMatch = texto.match(/ENTREGAS EM CONJUNTO[\s\S]*?(?=\d+\.\s*(?:ENTREGAS|FASES)|MVP|$)/i);
  if (conjuntaMatch) {
    const conjuntaText = conjuntaMatch[0];
    
    // Procurar linhas de tabela ou lista
    const linhas = conjuntaText.split('\n');
    for (const linha of linhas) {
      const linhaLimpa = linha.replace(/\|/g, ' ').trim();
      if (linhaLimpa.length > 10 && !linhaLimpa.includes('---') && !linhaLimpa.toLowerCase().includes('entrega')) {
        // Extrair título (primeira parte significativa)
        const partes = linhaLimpa.split(/\s{2,}|\t/);
        const titulo = partes[0]?.trim();
        
        // Determinar status
        const status = (linha.includes('✅') || linha.toLowerCase().includes('feito') || linha.toLowerCase().includes('concluíd')) 
          ? 'concluida' 
          : 'pendente';
        
        if (titulo && titulo.length > 3 && titulo.length < 200 && !titulo.match(/^\d+$/)) {
          ancoras.conjuntas.push({ titulo, status });
        }
      }
    }
    console.log(`  Entregas conjuntas: ${ancoras.conjuntas.length}`);
  }
  
  // 7. BACKLOG - Seções "Pós-MVP", "Melhorias Futuras"
  const backlogSections = [
    { regex: /Pós[-\s]?MVP[\s\S]*?(?=Melhorias Futuras|FASE|$)/i, secao: 'Pós-MVP' },
    { regex: /Melhorias Futuras[\s\S]*?(?=FASE|ENTREGAS|$)/i, secao: 'Melhorias Futuras' },
    { regex: /Próximos Passos[\s\S]*?(?=FASE|$)/i, secao: 'Próximos Passos' }
  ];
  
  for (const { regex, secao } of backlogSections) {
    const match = texto.match(regex);
    if (match) {
      const regexItem = /[-•]\s*([^-•\n]+)/g;
      let itemMatch;
      while ((itemMatch = regexItem.exec(match[0])) !== null) {
        const titulo = itemMatch[1].trim()
          .replace(/\*+/g, '')
          .trim();
        if (titulo.length > 5 && titulo.length < 200) {
          ancoras.backlog.push({ titulo, secao });
        }
      }
    }
  }
  console.log(`  Backlog items: ${ancoras.backlog.length}`);
  
  return ancoras;
}

// ═══════════════════════════════════════════════════════════════════
// CHAMAR IA COM PROMPT ULTRA-RESTRITIVO
// ═══════════════════════════════════════════════════════════════════

async function callAI(apiKey: string, prompt: string, maxTokens: number = 4096): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0, // DETERMINÍSTICO - não inventar
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

// ═══════════════════════════════════════════════════════════════════
// PROCESSAR COM IA RESTRITA (FALLBACK/COMPLEMENTO)
// ═══════════════════════════════════════════════════════════════════

async function processarComIARestrita(
  apiKey: string,
  texto: string,
  ancoras: AncorasLiterais,
  modulosLista: string
): Promise<ResultadoParcial> {
  console.log("=== PROCESSANDO COM IA RESTRITA ===");
  
  // Criar lista de âncoras para validação
  const fasesLista = ancoras.fases.map(f => `FASE ${f.numero}: ${f.titulo}`).join('\n');
  const entregasLista = ancoras.entregas.map(e => `ENTREGA ${e.numero}: ${e.titulo} (Fase ${e.faseNumero})`).join('\n');
  const passosLista = ancoras.passos.map(p => `PASSO ${p.numero} (Entrega ${p.entregaNumero}): ${p.titulo}`).join('\n');
  
  const prompt = `VOCÊ É UM ORGANIZADOR DE DADOS - NÃO UM CRIADOR.

═══════════════════════════════════════════════════════════════
ÂNCORAS LITERAIS JÁ ENCONTRADAS NO DOCUMENTO:
═══════════════════════════════════════════════════════════════

FASES:
${fasesLista || 'Nenhuma fase detectada'}

ENTREGAS:
${entregasLista || 'Nenhuma entrega detectada'}

PASSOS:
${passosLista || 'Nenhum passo detectado'}

═══════════════════════════════════════════════════════════════
SUA TAREFA - APENAS ORGANIZAR E PREENCHER DETALHES:
═══════════════════════════════════════════════════════════════

Para cada ENTREGA listada acima, extraia do texto abaixo:
1. Descrição/objetivo (copie literalmente)
2. Módulo relacionado (se mencionado)
3. Ferramenta de cada passo (Claude, Lovable, MAPA, Drive, etc.)
4. Responsável de cada passo (Paula/mentorada="voce", Mariana/mentora="mentor", Em Conjunto="conjunto")

═══════════════════════════════════════════════════════════════
PROIBIÇÕES ABSOLUTAS:
═══════════════════════════════════════════════════════════════

❌ PROIBIDO inventar títulos que NÃO estão na lista acima
❌ PROIBIDO usar termos genéricos: "Planejamento", "Canvas", "Proposta de Valor", "Estruturação"
❌ PROIBIDO resumir ou parafrasear títulos
❌ PROIBIDO adicionar fases/entregas que não existem no documento
❌ PROIBIDO criar conteúdo da metodologia "IAplicada" genérica

DOCUMENTO A ANALISAR:
${texto.substring(0, 25000)}

Responda APENAS com JSON válido seguindo EXATAMENTE as âncoras acima:
{
  "etapas": [
    {
      "numero": 1,
      "titulo": "USAR TÍTULO EXATO DA LISTA ACIMA",
      "objetivo": "Copiar objetivo do documento"
    }
  ],
  "entregas": [
    {
      "etapa_numero": 1,
      "numero_entrega": 1,
      "titulo": "USAR TÍTULO EXATO DA LISTA ACIMA",
      "descricao": "Copiar descrição do documento",
      "tipo": "ativa",
      "prioridade": "alta",
      "modulo_relacionado": "Módulo mencionado ou null"
    }
  ],
  "instrucoes": [
    {
      "entrega_numero": 1,
      "titulo": "USAR TÍTULO EXATO DO PASSO",
      "descricao": "Detalhes completos do passo - COPIE DO DOCUMENTO",
      "prompt_sugerido": "Prompt completo se existir - COPIE EXATAMENTE COMO ESTÁ",
      "dicas": "Dicas, observações, atenções - COPIE DO DOCUMENTO",
      "responsavel": "voce",
      "ferramenta": "lovable",
      "ordem": 1
    }
  ],
  "tasks": [],
  "backlog": []
}`;

  try {
    const content = await callAI(apiKey, prompt, 8192);
    const parsed = extractJsonFromResponse(content);
    
    // Validar que títulos correspondem às âncoras
    const resultado = validarContraAncoras(parsed, ancoras);
    
    return resultado;
  } catch (error) {
    console.error("Erro ao processar com IA:", error);
    // Retornar estrutura baseada APENAS nas âncoras
    return construirResultadoDeAncoras(ancoras);
  }
}

// ═══════════════════════════════════════════════════════════════════
// VALIDAR RESULTADO CONTRA ÂNCORAS LITERAIS
// ═══════════════════════════════════════════════════════════════════

function validarContraAncoras(resultado: any, ancoras: AncorasLiterais): ResultadoParcial {
  console.log("=== VALIDANDO CONTRA ÂNCORAS ===");
  
  const etapasValidas: any[] = [];
  const entregasValidas: any[] = [];
  const instrucoesValidas: any[] = [];
  const tasksValidas: any[] = [];
  
  // Termos proibidos (genéricos)
  const termosProibidos = [
    'planejamento', 'estruturação', 'canvas', 'proposta de valor',
    'definição do problema', 'preparação inicial', 'organização do projeto',
    'mapeamento de necessidades', 'análise de mercado', 'validação de hipóteses'
  ];
  
  // Validar etapas
  for (const etapa of (resultado.etapas || [])) {
    const tituloLower = (etapa.titulo || '').toLowerCase();
    
    // Verificar se é termo proibido
    const isProibido = termosProibidos.some(t => tituloLower.includes(t));
    if (isProibido) {
      console.warn(`  ❌ Etapa "${etapa.titulo}" REJEITADA - termo genérico`);
      continue;
    }
    
    // Verificar se corresponde a alguma âncora
    const ancoraCorrespondente = ancoras.fases.find(f => 
      tituloLower.includes(f.titulo.toLowerCase()) || 
      f.titulo.toLowerCase().includes(tituloLower) ||
      f.numero === etapa.numero
    );
    
    if (ancoraCorrespondente || ancoras.fases.length === 0) {
      etapasValidas.push({
        ...etapa,
        titulo: ancoraCorrespondente?.titulo || etapa.titulo
      });
      console.log(`  ✓ Etapa ${etapa.numero}: ${etapa.titulo}`);
    } else {
      console.warn(`  ❌ Etapa "${etapa.titulo}" REJEITADA - não encontrada no documento`);
    }
  }
  
  // ⚠️ FALLBACK: Se nenhuma etapa foi validada mas existem âncoras, usar âncoras diretamente
  if (etapasValidas.length === 0 && ancoras.fases.length > 0) {
    console.log("  ⚠️ Nenhuma etapa validada pela IA - usando âncoras diretamente como fallback");
    for (const fase of ancoras.fases) {
      etapasValidas.push({
        numero: fase.numero,
        titulo: fase.titulo,
        objetivo: ''
      });
      console.log(`  ✓ Etapa ${fase.numero}: ${fase.titulo} (fallback âncora)`);
    }
  }
  
  // Validar entregas
  for (const entrega of (resultado.entregas || [])) {
    const tituloLower = (entrega.titulo || '').toLowerCase();
    
    const isProibido = termosProibidos.some(t => tituloLower.includes(t));
    if (isProibido) {
      console.warn(`  ❌ Entrega "${entrega.titulo}" REJEITADA - termo genérico`);
      continue;
    }
    
    const ancoraCorrespondente = ancoras.entregas.find(e => 
      tituloLower.includes(e.titulo.toLowerCase()) || 
      e.titulo.toLowerCase().includes(tituloLower) ||
      e.numero === entrega.numero_entrega
    );
    
    if (ancoraCorrespondente || ancoras.entregas.length === 0) {
      entregasValidas.push({
        ...entrega,
        titulo: ancoraCorrespondente?.titulo || entrega.titulo,
        etapa_numero: ancoraCorrespondente?.faseNumero || entrega.etapa_numero
      });
      console.log(`  ✓ Entrega ${entrega.numero_entrega}: ${entrega.titulo}`);
    } else {
      console.warn(`  ❌ Entrega "${entrega.titulo}" REJEITADA - não encontrada no documento`);
    }
  }
  
  // ⚠️ FALLBACK: Se nenhuma entrega foi validada mas existem âncoras, usar âncoras diretamente
  if (entregasValidas.length === 0 && ancoras.entregas.length > 0) {
    console.log("  ⚠️ Nenhuma entrega validada pela IA - usando âncoras diretamente como fallback");
    for (const entrega of ancoras.entregas) {
      entregasValidas.push({
        etapa_numero: entrega.faseNumero,
        numero_entrega: entrega.numero,
        titulo: entrega.titulo,
        descricao: '',
        tipo: 'ativa' as const,
        prioridade: 'alta',
        modulo_relacionado: null
      });
      console.log(`  ✓ Entrega ${entrega.numero}: ${entrega.titulo} (fallback âncora)`);
    }
  }
  
  // Validar instruções - PRIORIZAR dados das âncoras (que têm prompt/dicas)
  for (const instrucao of (resultado.instrucoes || [])) {
    const ancoraCorrespondente = ancoras.passos.find(p => 
      p.entregaNumero === instrucao.entrega_numero &&
      (p.numero === instrucao.ordem || p.titulo.toLowerCase().includes((instrucao.titulo || '').toLowerCase().substring(0, 20)))
    );
    
    instrucoesValidas.push({
      ...instrucao,
      titulo: ancoraCorrespondente?.titulo || instrucao.titulo,
      descricao: ancoraCorrespondente?.descricao || instrucao.descricao || '',
      prompt_sugerido: ancoraCorrespondente?.prompt_sugerido || instrucao.prompt_sugerido || '',
      dicas: ancoraCorrespondente?.dicas || instrucao.dicas || '',
      responsavel: ancoraCorrespondente?.responsavel || normalizarResponsavel(instrucao.responsavel),
      ferramenta: ancoraCorrespondente?.ferramenta || normalizarFerramenta(instrucao.ferramenta)
    });
  }
  
  // ⚠️ FALLBACK: Se nenhuma instrução foi validada mas existem passos nas âncoras, usar âncoras diretamente
  if (instrucoesValidas.length === 0 && ancoras.passos.length > 0) {
    console.log("  ⚠️ Nenhuma instrução validada pela IA - usando âncoras diretamente como fallback");
    for (const passo of ancoras.passos) {
      instrucoesValidas.push({
        entrega_numero: passo.entregaNumero,
        titulo: passo.titulo,
        descricao: passo.descricao || '',
        prompt_sugerido: passo.prompt_sugerido || '',
        dicas: passo.dicas || '',
        responsavel: passo.responsavel || 'voce',
        ferramenta: passo.ferramenta || 'outro',
        ordem: passo.numero
      });
    }
    console.log(`  ✓ ${instrucoesValidas.length} instruções adicionadas via fallback âncoras`);
  }
  
  // Tasks dos checklists
  for (const check of ancoras.checklists) {
    tasksValidas.push({
      entrega_numero: check.entregaNumero,
      titulo: check.titulo,
      tipo: 'validacao',
      prioridade: 'alta',
      instrucoes_validacao: 'Verificar se o item está funcionando corretamente'
    });
  }
  
  return {
    etapas: etapasValidas,
    entregas: entregasValidas,
    instrucoes: instrucoesValidas,
    tasks: tasksValidas,
    backlog: resultado.backlog || []
  };
}

// ═══════════════════════════════════════════════════════════════════
// CONSTRUIR RESULTADO APENAS COM ÂNCORAS (SEM IA)
// ═══════════════════════════════════════════════════════════════════

function construirResultadoDeAncoras(ancoras: AncorasLiterais): ResultadoParcial {
  console.log("=== CONSTRUINDO RESULTADO DIRETO DAS ÂNCORAS ===");
  
  const etapas = ancoras.fases.map(f => ({
    numero: f.numero,
    titulo: f.titulo,
    objetivo: ''
  }));
  
  const entregas = ancoras.entregas.map(e => ({
    etapa_numero: e.faseNumero,
    numero_entrega: e.numero,
    titulo: e.titulo,
    descricao: '',
    tipo: 'ativa' as const,
    prioridade: 'alta',
    modulo_relacionado: null
  }));
  
  // USAR DADOS COMPLETOS DOS PASSOS - com prompt, dicas, ferramenta, responsável
  const instrucoes = ancoras.passos.map((p, idx) => ({
    entrega_numero: p.entregaNumero,
    titulo: p.titulo,
    descricao: p.descricao || '',
    prompt_sugerido: p.prompt_sugerido || '',
    dicas: p.dicas || '',
    responsavel: p.responsavel || 'voce',
    ferramenta: p.ferramenta || 'outro',
    ordem: p.numero || idx + 1
  }));
  
  const tasks = ancoras.checklists.map(c => ({
    entrega_numero: c.entregaNumero,
    titulo: c.titulo,
    tipo: 'validacao',
    prioridade: 'alta',
    instrucoes_validacao: ''
  }));
  
  const backlog = ancoras.backlog.map(b => ({
    titulo: b.titulo,
    descricao: '',
    justificativa: b.secao
  }));
  
  return { etapas, entregas, instrucoes, tasks, backlog };
}

// ═══════════════════════════════════════════════════════════════════
// PROCESSAR MVP E CONJUNTAS SEPARADAMENTE
// ═══════════════════════════════════════════════════════════════════

function processarMVPeConjuntas(ancoras: AncorasLiterais, texto: string): { 
  mvpEntregas: any[], 
  conjuntaEntrega: any | null,
  conjuntasInstrucoes: any[]
} {
  console.log("=== PROCESSANDO MVP E CONJUNTAS ===");
  
  // MVP como entregas sem etapa (ordem negativa para aparecer primeiro)
  const mvpEntregas = ancoras.mvp.map((item, idx) => ({
    etapa_numero: 0,
    numero_entrega: -(ancoras.mvp.length - idx),
    titulo: item.titulo,
    descricao: 'Item do MVP - escopo acordado',
    tipo: 'ativa' as const,
    prioridade: 'alta',
    modulo_relacionado: null,
    responsavel: 'voce'
  }));
  console.log(`  MVP: ${mvpEntregas.length} entregas`);
  
  // ENTREGAS EM CONJUNTO - UMA ÚNICA ENTREGA GLOBAL
  let conjuntaEntrega: any | null = null;
  const conjuntasInstrucoes: any[] = [];
  
  if (ancoras.conjuntas.length > 0) {
    // Extrair nome do responsável conjunto do texto (ex: "Mariana + Paula")
    const regexResponsaveis = /(?:Mariana\s*\+\s*\w+|\w+\s*\+\s*Mariana)/i;
    const responsaveisMatch = texto.match(regexResponsaveis);
    const responsaveisNome = responsaveisMatch ? responsaveisMatch[0] : 'Conjunto';
    
    // Criar UMA única entrega conjunta na Fase 1 como referência
    conjuntaEntrega = {
      etapa_numero: 1,
      numero_entrega: 0, // Número simples, não 9000
      titulo: `Entregas em Conjunto (${responsaveisNome})`,
      descricao: 'Trabalho colaborativo entre mentor e mentorado',
      tipo: 'ativa' as const,
      prioridade: 'media',
      modulo_relacionado: null,
      responsavel: 'conjunto',
      is_conjuntas: true,
      ordem: 0
    };
    
    // Criar instruções - cada item da tabela vira uma instrução
    ancoras.conjuntas.forEach((item, idx) => {
      conjuntasInstrucoes.push({
        entrega_numero: 0, // Vinculada à entrega conjunta (numero_entrega = 0)
        titulo: item.titulo,
        descricao: '',
        prompt_sugerido: '',
        dicas: '',
        responsavel: 'conjunto',
        ferramenta: 'reuniao',
        ordem: idx + 1,
        status: item.status
      });
    });
    
    console.log(`  Conjuntas: 1 entrega global com ${conjuntasInstrucoes.length} instruções`);
  }
  
  return { mvpEntregas, conjuntaEntrega, conjuntasInstrucoes };
}

// ═══════════════════════════════════════════════════════════════════
// CLONAR PASSOS PARA ENTREGAS QUE USAM MESMO FLUXO
// ═══════════════════════════════════════════════════════════════════

function clonarPassosParaEntregas(
  instrucoes: any[], 
  entregas: any[],
  texto: string
): any[] {
  console.log("=== CLONANDO PASSOS PARA ENTREGAS ===");
  
  // Encontrar entrega com mais passos (modelo)
  const passosCount: Record<number, number> = {};
  for (const inst of instrucoes) {
    passosCount[inst.entrega_numero] = (passosCount[inst.entrega_numero] || 0) + 1;
  }
  
  let entregaModelo = 0;
  let maxPassos = 0;
  for (const [entrega, count] of Object.entries(passosCount)) {
    if (count > maxPassos) {
      maxPassos = count;
      entregaModelo = parseInt(entrega);
    }
  }
  
  if (maxPassos < 5) {
    console.log("  Não há entrega modelo com passos suficientes");
    return instrucoes;
  }
  
  console.log(`  Entrega modelo: ${entregaModelo} com ${maxPassos} passos`);
  
  // Passos da entrega modelo
  const passosModelo = instrucoes.filter(i => i.entrega_numero === entregaModelo);
  
  // Verificar no texto quais entregas devem usar o mesmo fluxo
  const regexFluxo = /(?:segui[r]?\s*(?:o\s*)?mesmo\s*fluxo|mesmos?\s*passos?|mesma\s*lógica)/gi;
  const mencoesFluxo = texto.match(regexFluxo);
  
  // Entregas que NÃO têm passos próprios
  const entregasSemPassos = entregas
    .filter(e => !passosCount[e.numero_entrega] || passosCount[e.numero_entrega] < 3)
    .filter(e => e.numero_entrega > entregaModelo);
  
  const novasInstrucoes = [...instrucoes];
  
  if (mencoesFluxo && mencoesFluxo.length > 0) {
    console.log(`  Detectado: "${mencoesFluxo[0]}" - clonando para ${entregasSemPassos.length} entregas`);
    
    for (const entrega of entregasSemPassos) {
      for (const passo of passosModelo) {
        novasInstrucoes.push({
          ...passo,
          entrega_numero: entrega.numero_entrega
        });
      }
      console.log(`    Clonado ${passosModelo.length} passos para Entrega ${entrega.numero_entrega}`);
    }
  }
  
  return novasInstrucoes;
}

// ═══════════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texto, modulos_contratados, contexto_cliente } = await req.json();

    if (!texto) {
      throw new Error("Texto do documento é obrigatório");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const modulosLista = modulos_contratados?.length > 0 
      ? modulos_contratados.join(", ") 
      : "Não especificados";

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("INÍCIO DO PROCESSAMENTO - MODO EXTRAÇÃO LITERAL COMPLETA");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Tamanho do documento: ${texto.length} caracteres`);
    console.log(`Módulos contratados: ${modulosLista}`);

    // ═══════════════════════════════════════════════════════════════
    // PASSO 1: PRE-PARSER - Extrair âncoras ANTES de chamar a IA
    // ═══════════════════════════════════════════════════════════════
    const ancoras = extrairAncorasLiterais(texto);
    
    const temFases = ancoras.fases.length > 0;
    const temEntregas = ancoras.entregas.length > 0;
    
    console.log(`\nÂncoras encontradas: ${temFases ? ancoras.fases.length : 0} fases, ${temEntregas ? ancoras.entregas.length : 0} entregas`);
    console.log(`Passos com detalhes: ${ancoras.passos.length}`);
    console.log(`  - Com prompt: ${ancoras.passos.filter(p => p.prompt_sugerido).length}`);
    console.log(`  - Com dicas: ${ancoras.passos.filter(p => p.dicas).length}`);
    
    // ═══════════════════════════════════════════════════════════════
    // PASSO 2: Processar MVP e Conjuntas (1 ENTREGA GLOBAL)
    // ═══════════════════════════════════════════════════════════════
    const { mvpEntregas, conjuntaEntrega, conjuntasInstrucoes } = processarMVPeConjuntas(ancoras, texto);
    
    // ═══════════════════════════════════════════════════════════════
    // PASSO 3: Processar com IA ou apenas com âncoras
    // ═══════════════════════════════════════════════════════════════
    let resultado: ResultadoParcial;
    
    if (temFases && temEntregas) {
      // Documento estruturado - usar IA para preencher detalhes
      resultado = await processarComIARestrita(apiKey, texto, ancoras, modulosLista);
    } else {
      // Fallback: usar IA com prompt genérico restritivo
      console.log("Documento sem estrutura clara - usando fallback IA");
      resultado = construirResultadoDeAncoras(ancoras);
      
      // Se não encontrou nada, tentar IA
      if (resultado.etapas.length === 0 && resultado.entregas.length === 0) {
        resultado = await processarComIARestrita(apiKey, texto, ancoras, modulosLista);
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // PASSO 4: Clonar passos se documento indicar
    // ═══════════════════════════════════════════════════════════════
    resultado.instrucoes = clonarPassosParaEntregas(
      resultado.instrucoes, 
      resultado.entregas,
      texto
    );
    
    // ═══════════════════════════════════════════════════════════════
    // PASSO 5: Combinar tudo
    // ═══════════════════════════════════════════════════════════════
    
    // Adicionar MVP e Conjunta às entregas (1 entrega global)
    const todasEntregas = [
      ...mvpEntregas,
      ...resultado.entregas,
      ...(conjuntaEntrega ? [conjuntaEntrega] : [])
    ];
    
    // Adicionar instruções das conjuntas
    const todasInstrucoes = [
      ...resultado.instrucoes,
      ...conjuntasInstrucoes
    ];
    
    // NÃO gerar backlog automaticamente - será manual via BacklogEditor
    // Apenas manter backlog que veio de âncoras literais do documento
    const backlogLiteral = ancoras.backlog.map(b => ({
      titulo: b.titulo,
      descricao: '',
      justificativa: b.secao
    }));
    
    // Resultado final
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("RESULTADO FINAL");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Total de etapas: ${resultado.etapas.length}`);
    console.log(`Total de entregas: ${todasEntregas.length} (MVP: ${mvpEntregas.length}, Principais: ${resultado.entregas.length}, Conjunta: ${conjuntaEntrega ? 1 : 0})`);
    console.log(`Total de instruções: ${todasInstrucoes.length}`);
    console.log(`  - Com prompt: ${todasInstrucoes.filter(i => i.prompt_sugerido).length}`);
    console.log(`  - Com dicas: ${todasInstrucoes.filter(i => i.dicas).length}`);
    console.log(`Total de tasks: ${resultado.tasks.length}`);
    console.log(`Total de backlog literal: ${backlogLiteral.length}`);

    const finalResult = {
      etapas: resultado.etapas,
      entregas: todasEntregas,
      instrucoes: todasInstrucoes,
      tasks: resultado.tasks,
      backlog: backlogLiteral, // Apenas literais, o resto é manual
      // Compatibilidade com formato antigo
      entregas_sugeridas: [],
      instrucoes_sugeridas: [],
      backlog_sugerido: backlogLiteral,
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro:", error);
    
    if (error.message?.includes("429")) {
      return new Response(
        JSON.stringify({ error: "Limite de requisições excedido, tente novamente em alguns minutos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (error.message?.includes("402")) {
      return new Response(
        JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua conta." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error?.message || "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
