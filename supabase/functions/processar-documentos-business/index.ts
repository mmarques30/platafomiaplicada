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
  // IMPORTANTE: Só extrair prompts REAIS - blocos de texto que o usuário deve copiar e colar
  // NÃO extrair: descrições, passos, instruções genéricas
  
  // Verificar se o conteúdo parece ter um prompt real
  const conteudoLower = conteudo.toLowerCase();
  const temIndicadorPrompt = 
    conteudoLower.includes('use este modelo:') ||
    conteudoLower.includes('copie e cole:') ||
    conteudoLower.includes('cole no claude:') ||
    conteudoLower.includes('envie para o claude:') ||
    conteudoLower.includes('prompt:') ||
    conteudoLower.includes('cole este prompt') ||
    conteudoLower.includes('escreva isso no');
  
  if (!temIndicadorPrompt) {
    return undefined;
  }
  
  // Padrão 1: Texto entre aspas curvas "..." após indicador de prompt
  const regexAspasCurvas = /(?:use\s+este\s+modelo|cole\s+(?:no\s+claude|e\s+cole)|envie\s+para\s+o\s+claude|prompt)[:\s]*[""]([^""]+)[""]|[""]([^""]{100,}?)[""]/i;
  const matchAspasCurvas = conteudo.match(regexAspasCurvas);
  if (matchAspasCurvas) {
    const promptText = (matchAspasCurvas[1] || matchAspasCurvas[2] || '').trim();
    // Verificar se parece um prompt real (tem estrutura de comando para IA)
    if (promptText.length > 100 && isPromptReal(promptText)) {
      return promptText;
    }
  }
  
  // Padrão 2: Texto entre aspas retas "..." após indicador
  const regexAspasRetas = /(?:use\s+este\s+modelo|cole\s+(?:no\s+claude|e\s+cole)|envie\s+para\s+o\s+claude|prompt)[:\s]*"([^"]+)"/i;
  const matchAspasRetas = conteudo.match(regexAspasRetas);
  if (matchAspasRetas && matchAspasRetas[1].length > 100) {
    const promptText = matchAspasRetas[1].trim();
    if (isPromptReal(promptText)) {
      return promptText;
    }
  }
  
  // Padrão 3: Bloco de texto após "Use este modelo:" ou "Prompt:" que termina em aspas
  const regexBlocoModelo = /(?:use\s+este\s+modelo|prompt)[:\s]*\n?([\s\S]*?)(?=\nDICA|\nOBS|\n\n\n|\nATENÇÃO|$)/i;
  const matchBloco = conteudo.match(regexBlocoModelo);
  if (matchBloco && matchBloco[1].length > 100) {
    const blocoText = matchBloco[1].trim();
    // Limpar prefixos de introdução
    const limpo = limparIntroducaoPrompt(blocoText);
    if (limpo.length > 80 && isPromptReal(limpo)) {
      return limpo;
    }
  }
  
  return undefined;
}

// Verifica se o texto parece um prompt real para IA
function isPromptReal(texto: string): boolean {
  const textoLower = texto.toLowerCase();
  
  // Um prompt real geralmente tem comandos/instruções para IA
  const indicadoresPrompt = [
    'preciso', 'crie', 'gere', 'faça', 'desenvolva', 'implemente',
    'contexto:', 'funcionalidade', 'módulo', 'aplicativo', 'sistema',
    'design:', 'campos:', 'botão', 'formulário', 'menu', 'dashboard'
  ];
  
  // Indicadores de que NÃO é um prompt (é descrição/passos)
  const indicadoresNaoPrompt = [
    'abrir o claude', 'colar o prompt', 'aguardar', 'ler a resposta',
    'verificar se', 'se faltar', 'enviar', 'passo 1', 'passo 2'
  ];
  
  let scorePrompt = 0;
  let scoreNaoPrompt = 0;
  
  for (const ind of indicadoresPrompt) {
    if (textoLower.includes(ind)) scorePrompt++;
  }
  
  for (const ind of indicadoresNaoPrompt) {
    if (textoLower.includes(ind)) scoreNaoPrompt++;
  }
  
  // Precisa ter mais indicadores de prompt do que de não-prompt
  return scorePrompt >= 2 && scorePrompt > scoreNaoPrompt;
}

// Remove texto de introdução antes do prompt real
function limparIntroducaoPrompt(texto: string): string {
  const linhas = texto.split('\n');
  const linhasLimpas: string[] = [];
  let inicioPrompt = false;
  
  for (const linha of linhas) {
    const linhaLower = linha.toLowerCase().trim();
    
    // Pular linhas de introdução
    if (!inicioPrompt) {
      if (linhaLower.startsWith('para o claude') ||
          linhaLower.startsWith('abrir') ||
          linhaLower.startsWith('cole') ||
          linhaLower.startsWith('enviar') ||
          linhaLower.length < 10) {
        continue;
      }
      // Encontrou início do prompt real
      inicioPrompt = true;
    }
    
    linhasLimpas.push(linha);
  }
  
  return linhasLimpas.join('\n').trim();
}

function extrairDicas(conteudo: string): string | undefined {
  // Padrão principal: "DICA:", "DICAS:", "Obs:", "ATENÇÃO:", "IMPORTANTE:", "NOTA:", "Lembre-se:"
  const regexDicas = /(?:DICAS?|OBS|ATENÇÃO|IMPORTANTE|OBSERVAÇÃO|NOTA|LEMBRE-SE|CUIDADO|SUGESTÃO)[:\s]*([^\n]+(?:\n(?!\s*PASSO|\s*\d+\s*[-–:]|\s*ENTREGA)[^\n]+)*)/i;
  const match = conteudo.match(regexDicas);
  if (match && match[1].length > 5) {
    return match[1].trim();
  }
  
  // Padrão alternativo: texto entre parênteses após prompt ou instrução principal
  const regexParenteses = /\((?:obs|nota|atenção|dica|importante)[:\s]*([^)]+)\)/i;
  const matchParenteses = conteudo.match(regexParenteses);
  if (matchParenteses && matchParenteses[1].length > 5) {
    return matchParenteses[1].trim();
  }
  
  // Padrão 3: Frases que começam com "Certifique-se", "Verifique", "Não esqueça", etc.
  const regexFrasesAlerta = /(?:certifique-se|verifique|não esqueça|lembre-se|garanta que|é importante)[^.!?]*[.!?]/gi;
  const matchesAlerta = conteudo.match(regexFrasesAlerta);
  if (matchesAlerta && matchesAlerta.length > 0) {
    // Juntar todas as frases de alerta encontradas
    const alertas = matchesAlerta.slice(0, 3).join(' ').trim();
    if (alertas.length > 10) {
      return alertas;
    }
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
// FORMATAÇÃO E ORGANIZAÇÃO DE TEXTOS COM MARKDOWN
// ═══════════════════════════════════════════════════════════════════

/**
 * Converte texto plano para Markdown formatado
 * - Detecta e formata checklists e labels em negrito
 * - Converte sequências de perguntas em listas
 * - Cria parágrafos apropriados
 * - Formata bullets e listas numeradas
 */
function converterParaMarkdown(texto: string): string {
  if (!texto || texto.trim().length === 0) return '';
  
  let markdown = texto
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // Limpar caracteres problemáticos
  markdown = markdown
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // 1. Detectar e formatar CHECKLIST patterns
  // "CHECKLIST DE TESTES - RECEITAS:" -> quebra de linha + negrito
  markdown = markdown.replace(
    /(CHECKLIST\s+DE\s+[A-ZÁÉÍÓÚÀÂÃÊÔ\s]+-\s*[A-ZÁÉÍÓÚÀÂÃÊÔ]+):/gi,
    '\n\n**$1:**'
  );
  
  // 2. Formatar outros labels importantes em negrito
  markdown = markdown.replace(
    /\b(IMPORTANTE|ATENÇÃO|OBS|OBSERVAÇÃO|NOTA|DICA|VERIFICAR|TESTAR):/gi,
    '\n\n**$1:**'
  );
  
  // 3. Converter sequências de perguntas em lista de bullets
  // Detectar padrões como "Pergunta1? Pergunta2? Pergunta3?"
  const linhas = markdown.split('\n');
  const linhasFormatadas: string[] = [];
  
  for (const linha of linhas) {
    const trimmed = linha.trim();
    
    // Se a linha contém múltiplas perguntas seguidas
    if ((trimmed.match(/\?/g) || []).length >= 2 && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      // Dividir por "? " e criar bullets
      const perguntas = trimmed.split(/\?\s+/).filter(p => p.trim().length > 0);
      if (perguntas.length >= 2) {
        const bullets = perguntas.map(p => {
          const pergunta = p.trim();
          return `- ${pergunta}${pergunta.endsWith('?') ? '' : '?'}`;
        });
        linhasFormatadas.push(bullets.join('\n'));
        continue;
      }
    }
    
    // Se já é um item de lista, preservar
    if (trimmed.match(/^[\d]+[.)]\s/) || trimmed.match(/^[-•◦▪▸►]\s/)) {
      // Normalizar para markdown bullet
      const textoItem = trimmed.replace(/^[\d]+[.)]\s*/, '').replace(/^[-•◦▪▸►]\s*/, '');
      linhasFormatadas.push(`- ${textoItem}`);
      continue;
    }
    
    linhasFormatadas.push(linha);
  }
  
  markdown = linhasFormatadas.join('\n');
  
  // 4. Limpar quebras de linha excessivas
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .trim();
  
  // 5. Garantir espaçamento após labels em negrito
  markdown = markdown.replace(/(\*\*[^*]+:\*\*)([^\n])/g, '$1 $2');
  
  return markdown;
}

/**
 * Formata o texto em parágrafos bem organizados
 * - Remove espaços excessivos
 * - Organiza em parágrafos lógicos
 * - Limpa caracteres especiais problemáticos
 * - Mantém a estrutura semântica
 */
function formatarTextoEmParagrafos(texto: string): string {
  if (!texto || texto.trim().length === 0) return '';
  
  // Usar a função de conversão para markdown
  return converterParaMarkdown(texto);
}

/**
 * Formata descrição de instrução/passo
 * - Remove texto de introdução
 * - Organiza em passos claros
 * - Preserva formatação de lista se houver
 */
function formatarDescricaoInstrucao(descricao: string): string {
  if (!descricao || descricao.trim().length === 0) return '';
  
  let formatado = formatarTextoEmParagrafos(descricao);
  
  // Remover prefixos comuns de introdução
  const prefixosRemover = [
    /^(nesta etapa|neste passo|objetivo[:\s]*|descrição[:\s]*)/i,
    /^(você (deve|vai|precisa)[:\s]*)/i,
    /^(este passo|esta instrução)[:\s]*/i,
  ];
  
  for (const regex of prefixosRemover) {
    formatado = formatado.replace(regex, '');
  }
  
  // Capitalizar primeira letra
  if (formatado.length > 0) {
    formatado = formatado.charAt(0).toUpperCase() + formatado.slice(1);
  }
  
  return formatado.trim();
}

/**
 * Formata prompt sugerido
 * - Remove instruções sobre como usar o prompt
 * - Limpa texto de introdução
 * - Mantém apenas o conteúdo do prompt em si
 */
function formatarPromptSugerido(prompt: string): string {
  if (!prompt || prompt.trim().length === 0) return '';
  
  let formatado = formatarTextoEmParagrafos(prompt);
  
  // Remover linhas de introdução/instrução
  const linhas = formatado.split('\n');
  const linhasLimpas: string[] = [];
  let dentroDoPrompt = false;
  
  for (const linha of linhas) {
    const linhaLower = linha.toLowerCase().trim();
    
    // Linhas que indicam introdução (pular)
    if (!dentroDoPrompt) {
      if (linhaLower.startsWith('para o claude') ||
          linhaLower.startsWith('abra o claude') ||
          linhaLower.startsWith('abrir o claude') ||
          linhaLower.startsWith('cole este') ||
          linhaLower.startsWith('copie e cole') ||
          linhaLower.startsWith('envie para') ||
          linhaLower.startsWith('use este modelo') ||
          linhaLower.startsWith('prompt:') ||
          linhaLower.match(/^passo \d/i) ||
          linhaLower.length < 5) {
        continue;
      }
      dentroDoPrompt = true;
    }
    
    // Parar se encontrar indicadores de fim
    if (linhaLower.startsWith('dica:') ||
        linhaLower.startsWith('obs:') ||
        linhaLower.startsWith('atenção:') ||
        linhaLower.startsWith('importante:') ||
        linhaLower.match(/^passo \d/i)) {
      break;
    }
    
    linhasLimpas.push(linha);
  }
  
  return linhasLimpas.join('\n').trim();
}

/**
 * Formata dicas/observações com suporte a Markdown
 * - Organiza em lista se houver múltiplas dicas
 * - Limpa prefixos repetitivos
 * - Detecta checklists e formata como bullets
 */
function formatarDicas(dicas: string): string {
  if (!dicas || dicas.trim().length === 0) return '';
  
  // Primeiro converter para markdown
  let formatado = converterParaMarkdown(dicas);
  
  // Remover prefixo "DICA:", "OBS:", etc. do início (já em negrito ou não)
  formatado = formatado.replace(/^\**(DICAS?|OBS|ATENÇÃO|IMPORTANTE|OBSERVAÇÃO)\**[:\s]*/i, '');
  
  // Se não tem bullets mas tem múltiplos pontos, tentar criar lista
  if (!formatado.includes('- ') && formatado.includes('. ') && formatado.length > 100) {
    // Verificar se não é um texto normal com frases
    const partes = formatado.split(/\.\s+/).filter(p => p.trim().length > 5);
    
    // Só converter em lista se parecer ser itens separados (frases curtas)
    const mediaLength = partes.reduce((acc, p) => acc + p.length, 0) / partes.length;
    if (partes.length >= 3 && mediaLength < 80) {
      formatado = partes.map(p => {
        const texto = p.trim();
        return `- ${texto}${texto.endsWith('.') ? '' : '.'}`;
      }).join('\n');
    }
  }
  
  return formatado.trim();
}

/**
 * Formata título removendo caracteres desnecessários
 */
function formatarTitulo(titulo: string): string {
  if (!titulo || titulo.trim().length === 0) return '';
  
  let formatado = titulo
    .replace(/^\*+\s*/, '')           // Asteriscos no início
    .replace(/\s*\*+$/, '')           // Asteriscos no fim
    .replace(/^[-–:]\s*/, '')         // Travessões/dois-pontos no início
    .replace(/\s*[-–:]$/, '')         // Travessões/dois-pontos no fim
    .replace(/^#+\s*/, '')            // Hashtags de markdown
    .replace(/\*\*/g, '')             // Bold markdown
    .trim();
  
  // Capitalizar primeira letra de cada palavra importante
  formatado = formatado.replace(/\b\w/g, (char, index) => {
    // Manter minúsculas para palavras pequenas (exceto início)
    const palavra = formatado.substring(index).match(/^\w+/)?.[0] || '';
    const palavrasPequenas = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'com', 'para', 'por', 'a', 'o', 'um', 'uma'];
    if (index > 0 && palavrasPequenas.includes(palavra.toLowerCase())) {
      return char.toLowerCase();
    }
    return char.toUpperCase();
  });
  
  return formatado;
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
  
  // 0. PROJETOS - Detectar seções de projeto como agrupadores de fase
  const regexProjeto = /(?:^|\n)\s*#*\s*(?:\d+\.\s*)?PROJETO\s+(.+?)(?:\s*[-–]\s*(.+?))?(?=\n|$)/gi;
  const projetos: { nome: string; posicao: number; faseNumero: number }[] = [];
  let matchProjeto;
  while ((matchProjeto = regexProjeto.exec(texto)) !== null) {
    const nome = (matchProjeto[1] + (matchProjeto[2] ? ' - ' + matchProjeto[2] : '')).trim()
      .replace(/\*+/g, '').replace(/\(.*?\)/, '').trim();
    if (nome.length > 2) {
      projetos.push({ nome, posicao: matchProjeto.index, faseNumero: 0 });
      console.log(`  PROJETO detectado: ${nome} (pos: ${matchProjeto.index})`);
    }
  }
  
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
  
  // 1b. Criar fases para projetos que não têm FASE explícita
  let nextFaseNumero = ancoras.fases.length > 0 
    ? Math.max(...ancoras.fases.map(f => f.numero)) + 1 
    : 1;
  
  for (const projeto of projetos) {
    // Verificar se já existe uma FASE dentro da área deste projeto
    const projetoTemFase = ancoras.fases.some(f => {
      const fasePos = texto.indexOf(f.conteudo);
      const nextProj = projetos.find(p => p.posicao > projeto.posicao);
      const projetoEnd = nextProj ? nextProj.posicao : texto.length;
      return fasePos >= projeto.posicao && fasePos < projetoEnd;
    });
    
    if (!projetoTemFase) {
      // Criar fase virtual para este projeto
      const nextProj = projetos.find(p => p.posicao > projeto.posicao);
      const projetoEnd = nextProj ? nextProj.posicao : texto.length;
      const conteudo = texto.substring(projeto.posicao, projetoEnd);
      
      projeto.faseNumero = nextFaseNumero;
      ancoras.fases.push({
        numero: nextFaseNumero,
        titulo: `Projeto ${projeto.nome}`,
        conteudo
      });
      console.log(`  FASE ${nextFaseNumero} (auto-projeto): Projeto ${projeto.nome}`);
      nextFaseNumero++;
    } else {
      // Associar o projeto à primeira fase encontrada na sua área
      const faseAssociada = ancoras.fases.find(f => {
        const fasePos = texto.indexOf(f.conteudo);
        const nextProj = projetos.find(p => p.posicao > projeto.posicao);
        const projetoEnd = nextProj ? nextProj.posicao : texto.length;
        return fasePos >= projeto.posicao && fasePos < projetoEnd;
      });
      if (faseAssociada) projeto.faseNumero = faseAssociada.numero;
    }
  }
  
  // 2. ENTREGAS - Padrões expandidos: "ENTREGA 1:", "Módulo 3 -"
  const regexEntrega = /(?:^|\n)\s*(?:ENTREGA|MÓDULO|MODULO)\s*(\d+)\s*[:\-–.]\s*(.+?)(?=\n|$)/gi;
  let matchEntrega;
  let contadorEntregaGlobal = 1;
  
  while ((matchEntrega = regexEntrega.exec(texto)) !== null) {
    const numeroOriginal = parseInt(matchEntrega[1]);
    const titulo = matchEntrega[2].trim()
      .replace(/\*+/g, '')
      .trim();
    
    // Determinar a qual fase pertence baseado na posição no texto
    let faseNumero = 1;
    const posicaoEntrega = matchEntrega.index;
    
    // Primeiro: tentar vincular ao projeto correto
    for (const projeto of [...projetos].reverse()) {
      if (posicaoEntrega >= projeto.posicao) {
        faseNumero = projeto.faseNumero;
        break;
      }
    }
    
    // Segundo: se há fases explícitas, usar a fase mais próxima
    for (const fase of ancoras.fases) {
      const faseStart = texto.indexOf(fase.conteudo);
      const faseEnd = faseStart + fase.conteudo.length;
      if (posicaoEntrega >= faseStart && posicaoEntrega < faseEnd) {
        faseNumero = fase.numero;
        break;
      }
    }
    
    if (titulo.length > 2) {
      // Usar contador global em vez de deduplicar por número original
      ancoras.entregas.push({
        numero: contadorEntregaGlobal,
        titulo,
        faseNumero
      });
      console.log(`  ENTREGA ${contadorEntregaGlobal} (orig: ${numeroOriginal}): ${titulo} (Fase ${faseNumero})`);
      contadorEntregaGlobal++;
    }
  }
  
  // 3. PASSOS - EXTRAÇÃO COMPLETA com prompt, dicas, ferramenta, responsável
  console.log("  Extraindo PASSOS com conteúdo completo...");
  
  for (const entrega of ancoras.entregas) {
    // Encontrar todo o texto da entrega até a próxima entrega ou módulo
    // Usar título da entrega para localizar no texto (mais confiável que número original)
    const tituloEscapado = entrega.titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').substring(0, 30);
    const regexEntregaConteudo = new RegExp(
      `(?:ENTREGA|MÓDULO|MODULO)\\s*\\d+[\\s\\S]*?${tituloEscapado}[\\s\\S]*?(?=(?:ENTREGA|MÓDULO|MODULO)\\s*\\d+\\s*[:\\-–.]|ENTREGAS\\s+EM\\s+CONJUNTO|$)`, 
      'i'
    );
    const entregaMatch = texto.match(regexEntregaConteudo);
    
    if (entregaMatch) {
      const textoEntrega = entregaMatch[0];
      
      // Regex que captura PASSO + TODO conteúdo até próximo PASSO ou fim
      const regexPassoCompleto = /PASSO\s*(\d{1,2})\s*[:\-–]\s*([\s\S]*?)(?=\nPASSO\s*\d{1,2}\s*[:\-–]|\n(?:ENTREGA|MÓDULO|MODULO)\s*\d|☐|$)/gi;
      
      let mp;
      while ((mp = regexPassoCompleto.exec(textoEntrega)) !== null) {
        const numPasso = parseInt(mp[1]);
        const conteudoCompleto = mp[2].trim();
        
        // Extrair título (primeira linha significativa, sem asteriscos)
        const primeiraLinha = conteudoCompleto.split('\n')[0];
        const tituloRaw = primeiraLinha
          .replace(/\*+/g, '')
          .replace(/^[-–:\s]+/, '')
          .trim();
        
        if (tituloRaw.length < 3 || tituloRaw.length > 200) continue;
        
        // Extrair detalhes do conteúdo
        const promptRaw = extrairPrompt(conteudoCompleto);
        const dicasRaw = extrairDicas(conteudoCompleto);
        const descricaoRaw = extrairDescricao(conteudoCompleto, tituloRaw);
        const ferramenta = detectarFerramenta(conteudoCompleto);
        const responsavel = detectarResponsavel(conteudoCompleto);
        
        // APLICAR FORMATAÇÃO para organizar textos em parágrafos
        const titulo = formatarTitulo(tituloRaw);
        const descricao = formatarDescricaoInstrucao(descricaoRaw);
        const prompt = promptRaw ? formatarPromptSugerido(promptRaw) : undefined;
        const dicas = dicasRaw ? formatarDicas(dicasRaw) : undefined;
        
        ancoras.passos.push({
          numero: numPasso,
          titulo,
          entregaNumero: entrega.numero,
          conteudo_completo: formatarTextoEmParagrafos(conteudoCompleto),
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
    
    // Determinar entrega do checklist pela posição
    const posicao = matchCheck.index;
    for (const entrega of ancoras.entregas.slice().reverse()) {
      // Buscar posição da entrega pelo título no texto
      const entregaTituloPos = texto.indexOf(entrega.titulo);
      if (entregaTituloPos !== -1 && posicao > entregaTituloPos) {
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
  // APLICAR FORMATAÇÃO EM TODOS OS TEXTOS
  for (const instrucao of (resultado.instrucoes || [])) {
    const ancoraCorrespondente = ancoras.passos.find(p => 
      p.entregaNumero === instrucao.entrega_numero &&
      (p.numero === instrucao.ordem || p.titulo.toLowerCase().includes((instrucao.titulo || '').toLowerCase().substring(0, 20)))
    );
    
    // Pegar o texto da âncora ou da instrução e aplicar formatação
    const tituloRaw = ancoraCorrespondente?.titulo || instrucao.titulo || '';
    const descricaoRaw = ancoraCorrespondente?.descricao || instrucao.descricao || '';
    const promptRaw = ancoraCorrespondente?.prompt_sugerido || instrucao.prompt_sugerido || '';
    const dicasRaw = ancoraCorrespondente?.dicas || instrucao.dicas || '';
    
    instrucoesValidas.push({
      ...instrucao,
      titulo: formatarTitulo(tituloRaw),
      descricao: formatarDescricaoInstrucao(descricaoRaw),
      prompt_sugerido: promptRaw ? formatarPromptSugerido(promptRaw) : '',
      dicas: dicasRaw ? formatarDicas(dicasRaw) : '',
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
        titulo: formatarTitulo(passo.titulo),
        descricao: formatarDescricaoInstrucao(passo.descricao || ''),
        prompt_sugerido: passo.prompt_sugerido ? formatarPromptSugerido(passo.prompt_sugerido) : '',
        dicas: passo.dicas ? formatarDicas(passo.dicas) : '',
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
  
  // Formatar títulos das etapas
  const etapas = ancoras.fases.map(f => ({
    numero: f.numero,
    titulo: formatarTitulo(f.titulo),
    objetivo: ''
  }));
  
  // Formatar títulos das entregas
  const entregas = ancoras.entregas.map(e => ({
    etapa_numero: e.faseNumero,
    numero_entrega: e.numero,
    titulo: formatarTitulo(e.titulo),
    descricao: '',
    tipo: 'ativa' as const,
    prioridade: 'alta',
    modulo_relacionado: null
  }));
  
  // USAR DADOS COMPLETOS DOS PASSOS - com prompt, dicas, ferramenta, responsável
  // APLICAR FORMATAÇÃO EM TODOS OS CAMPOS
  const instrucoes = ancoras.passos.map((p, idx) => ({
    entrega_numero: p.entregaNumero,
    titulo: formatarTitulo(p.titulo),
    descricao: formatarDescricaoInstrucao(p.descricao || ''),
    prompt_sugerido: p.prompt_sugerido ? formatarPromptSugerido(p.prompt_sugerido) : '',
    dicas: p.dicas ? formatarDicas(p.dicas) : '',
    responsavel: p.responsavel || 'voce',
    ferramenta: p.ferramenta || 'outro',
    ordem: p.numero || idx + 1
  }));
  
  const tasks = ancoras.checklists.map(c => ({
    entrega_numero: c.entregaNumero,
    titulo: formatarTitulo(c.titulo),
    tipo: 'validacao',
    prioridade: 'alta',
    instrucoes_validacao: ''
  }));
  
  const backlog = ancoras.backlog.map(b => ({
    titulo: formatarTitulo(b.titulo),
    descricao: '',
    justificativa: b.secao
  }));
  
  return { etapas, entregas, instrucoes, tasks, backlog };
}

// ═══════════════════════════════════════════════════════════════════
// PROCESSAR MVP E CONJUNTAS SEPARADAMENTE
// ═══════════════════════════════════════════════════════════════════

function processarMVPeConjuntas(ancoras: AncorasLiterais, texto: string): { 
  mvpEntrega: any | null,
  mvpInstrucoes: any[],
  conjuntaEntrega: any | null,
  conjuntasInstrucoes: any[]
} {
  console.log("=== PROCESSANDO MVP E CONJUNTAS ===");
  
  // MVP como UMA ÚNICA ENTREGA com items como instruções (igual às Conjuntas)
  let mvpEntrega: any | null = null;
  const mvpInstrucoes: any[] = [];
  
  if (ancoras.mvp.length > 0) {
    // Criar UMA única entrega MVP na Fase 1
    mvpEntrega = {
      etapa_numero: 1,
      numero_entrega: -1, // Número negativo para aparecer antes das entregas principais
      titulo: 'MVP - Escopo Acordado',
      descricao: 'Entregas prioritárias do primeiro release',
      tipo: 'ativa' as const,
      prioridade: 'critica',
      modulo_relacionado: null,
      responsavel: 'conjunto',
      is_mvp: true,
      ordem: -1 // Ordem negativa para aparecer primeiro
    };
    
    // Cada item do MVP vira uma instrução
    ancoras.mvp.forEach((item, idx) => {
      mvpInstrucoes.push({
        entrega_numero: -1, // Vinculada à entrega MVP (numero_entrega = -1)
        titulo: item.titulo,
        descricao: '',
        prompt_sugerido: '',
        dicas: '',
        responsavel: 'conjunto',
        ferramenta: 'reuniao',
        ordem: idx + 1
      });
    });
    
    console.log(`  MVP: 1 entrega global com ${mvpInstrucoes.length} instruções`);
  }
  
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
  
  return { mvpEntrega, mvpInstrucoes, conjuntaEntrega, conjuntasInstrucoes };
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
    // PASSO 2: Processar MVP e Conjuntas (1 ENTREGA GLOBAL cada)
    // ═══════════════════════════════════════════════════════════════
    const { mvpEntrega, mvpInstrucoes, conjuntaEntrega, conjuntasInstrucoes } = processarMVPeConjuntas(ancoras, texto);
    
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
    
    // Adicionar MVP e Conjunta às entregas (1 entrega global cada)
    const todasEntregas = [
      ...(mvpEntrega ? [mvpEntrega] : []),
      ...resultado.entregas,
      ...(conjuntaEntrega ? [conjuntaEntrega] : [])
    ];
    
    // Adicionar instruções de MVP e Conjuntas
    const todasInstrucoes = [
      ...mvpInstrucoes,
      ...resultado.instrucoes,
      ...conjuntasInstrucoes
    ];
    
    // NÃO gerar backlog automaticamente - será manual via BacklogEditor
    // Apenas manter backlog que veio de âncoras literais do documento
    // Filtrar backlog: remover itens que já são entregas ativas
    const titulosEntregas = todasEntregas.map(e => e.titulo.toLowerCase());
    
    const backlogLiteral = ancoras.backlog
      .filter(b => {
        const tituloLower = b.titulo.toLowerCase();
        // Remover se titulo do backlog contém ou está contido em alguma entrega
        const jaDuplicado = titulosEntregas.some(te => 
          tituloLower.includes(te) || te.includes(tituloLower) ||
          // Similaridade parcial (ex: "Hub de documentação técnica (SDS)" vs "Sistema de SDS")
          tituloLower.split(' ').filter(w => w.length > 3).some(word => te.includes(word))
        );
        if (jaDuplicado) {
          console.log(`  Backlog removido (duplica entrega): ${b.titulo}`);
        }
        return !jaDuplicado;
      })
      .map(b => ({
        titulo: b.titulo,
        descricao: '',
        justificativa: b.secao
      }));
    
    // Resultado final
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("RESULTADO FINAL");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Total de etapas: ${resultado.etapas.length}`);
    console.log(`Total de entregas: ${todasEntregas.length} (MVP: ${mvpEntrega ? 1 : 0}, Principais: ${resultado.entregas.length}, Conjunta: ${conjuntaEntrega ? 1 : 0})`);
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
