import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interfaces para tipagem
interface FaseIdentificada {
  numero: number;
  titulo: string;
  inicio_texto: string;
  fim_texto: string;
}

interface ResultadoParcial {
  etapas: any[];
  entregas: any[];
  instrucoes: any[];
  tasks: any[];
  backlog: any[];
}

// Mapeamento de ferramentas para valores válidos do banco
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
    "21st.dev": "outro",
    "21st": "outro",
  };
  
  return mapeamento[ferramentaLower] || 
         (FERRAMENTAS_VALIDAS.includes(ferramentaLower) ? ferramentaLower : "outro");
}

// Normalizar responsável baseado no texto
function normalizarResponsavel(texto: string | undefined): "voce" | "mentor" | "conjunto" {
  if (!texto) return "voce";
  
  const textoLower = texto.toLowerCase().trim();
  
  // Conjunto
  if (textoLower.includes("conjunto") || 
      textoLower.includes("juntos") || 
      textoLower.includes("mariana + paula") ||
      textoLower.includes("paula + mariana") ||
      textoLower.includes("em conjunto")) {
    return "conjunto";
  }
  
  // Mentor
  if (textoLower.includes("mariana") || 
      textoLower.includes("mari") || 
      textoLower.includes("mentora") ||
      textoLower === "mentor") {
    return "mentor";
  }
  
  // Mentorada (padrão)
  return "voce";
}

// Função para extrair JSON da resposta da IA
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

// Função para chamar a IA
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

// PASSO 1: Identificar fases do documento - COM EXTRAÇÃO LITERAL
async function identificarFases(apiKey: string, texto: string): Promise<FaseIdentificada[]> {
  console.log("=== PASSO 1: Identificando fases do documento ===");
  
  const prompt = `Analise este documento e identifique TODAS as seções marcadas como FASE, ETAPA, ou blocos principais de entregas.

DOCUMENTO:
${texto.substring(0, 30000)} ${texto.length > 30000 ? '...[documento continua]' : ''}

REGRAS CRÍTICAS - EXTRAIA LITERALMENTE:
1. Copie os TÍTULOS EXATOS como estão escritos no documento
2. NÃO INVENTE títulos genéricos
3. Se está escrito "FASE 1: DOCUMENTAÇÃO E PROCESSOS", retorne EXATAMENTE assim
4. Se está escrito "FASE 2: FINANCEIRO E EXPANSÃO", retorne EXATAMENTE assim
5. Inclua seções de "Pós-MVP", "Backlog", "Melhorias Futuras" como fases separadas

❌ EXEMPLOS NEGATIVOS (NÃO FAÇA):
- "Fase 1: Planejamento e Preparação" (título inventado)
- "Fase 2: Implementação e Lançamento" (título genérico)
- "Etapa de Organização" (resumo, não literal)

✅ EXEMPLOS POSITIVOS (FAÇA):
- "FASE 1: DOCUMENTAÇÃO E PROCESSOS" (copiado do documento)
- "FASE 2: FINANCEIRO E EXPANSÃO" (copiado do documento)
- "Pós-MVP" (seção real do documento)

Responda APENAS com JSON válido:
{
  "fases_encontradas": [
    {
      "numero": 1,
      "titulo": "TÍTULO EXATO DO DOCUMENTO - COPIE LITERALMENTE",
      "inicio_texto": "copie as primeiras 50 palavras exatas desta seção",
      "fim_texto": "copie as últimas 30 palavras exatas desta seção"
    }
  ],
  "total_fases": 3
}`;

  try {
    const content = await callAI(apiKey, prompt, 2048);
    const parsed = extractJsonFromResponse(content);
    
    const fases = parsed.fases_encontradas || [];
    console.log(`Fases identificadas: ${fases.length}`);
    fases.forEach((f: FaseIdentificada, i: number) => {
      console.log(`  ${i + 1}. ${f.titulo}`);
    });
    
    if (fases.length === 0) {
      console.log("Nenhuma fase identificada, processando documento como fase única");
      return [{
        numero: 1,
        titulo: "Documento Completo",
        inicio_texto: texto.substring(0, 100),
        fim_texto: texto.substring(texto.length - 100)
      }];
    }
    
    return fases;
  } catch (error) {
    console.error("Erro ao identificar fases:", error);
    return [{
      numero: 1,
      titulo: "Documento Completo",
      inicio_texto: texto.substring(0, 100),
      fim_texto: texto.substring(texto.length - 100)
    }];
  }
}

// Função para dividir documento baseado nas fases identificadas
function splitDocumentByPhases(texto: string, fases: FaseIdentificada[]): string[] {
  console.log("=== Dividindo documento em seções ===");
  
  if (fases.length === 1) {
    return [texto];
  }
  
  const sections: string[] = [];
  
  for (let i = 0; i < fases.length; i++) {
    const fase = fases[i];
    const nextFase = fases[i + 1];
    
    const searchStart = fase.inicio_texto.substring(0, Math.min(50, fase.inicio_texto.length));
    let startIndex = texto.indexOf(searchStart);
    
    if (startIndex === -1) {
      startIndex = texto.toLowerCase().indexOf(fase.titulo.toLowerCase());
    }
    
    if (startIndex === -1) {
      startIndex = Math.floor((i / fases.length) * texto.length);
    }
    
    let endIndex = texto.length;
    if (nextFase) {
      const searchEnd = nextFase.inicio_texto.substring(0, Math.min(50, nextFase.inicio_texto.length));
      const nextStart = texto.indexOf(searchEnd, startIndex + 100);
      
      if (nextStart > startIndex) {
        endIndex = nextStart;
      } else {
        const nextByTitle = texto.toLowerCase().indexOf(nextFase.titulo.toLowerCase(), startIndex + 100);
        if (nextByTitle > startIndex) {
          endIndex = nextByTitle;
        }
      }
    }
    
    const section = texto.substring(startIndex, endIndex).trim();
    if (section.length > 50) {
      sections.push(section);
      console.log(`  Seção ${i + 1}: ${section.length} caracteres`);
    }
  }
  
  if (sections.length === 0) {
    console.log("Não foi possível dividir, usando documento completo");
    return [texto];
  }
  
  return sections;
}

// Detectar se seção é de entregas em conjunto
function isSecaoConjunta(section: string): boolean {
  const textoLower = section.toLowerCase();
  return textoLower.includes("em conjunto") ||
         textoLower.includes("mariana + paula") ||
         textoLower.includes("paula + mariana") ||
         textoLower.includes("entregas conjuntas");
}

// Detectar se é seção de backlog
function isSecaoBacklog(section: string, titulo: string): boolean {
  const textoLower = (section + " " + titulo).toLowerCase();
  return textoLower.includes("pós-mvp") ||
         textoLower.includes("pos-mvp") ||
         textoLower.includes("backlog") ||
         textoLower.includes("melhorias futuras") ||
         textoLower.includes("próximos passos") ||
         textoLower.includes("proximos passos");
}

// PASSO 2: Processar cada fase individualmente - COM EXTRAÇÃO LITERAL
async function processarFase(
  apiKey: string, 
  section: string, 
  faseNumero: number, 
  totalFases: number,
  entregaOffset: number,
  modulosLista: string,
  contextoCliente?: string
): Promise<ResultadoParcial> {
  console.log(`=== Processando fase ${faseNumero}/${totalFases} ===`);
  
  const isConjunta = isSecaoConjunta(section);
  const isBacklog = isSecaoBacklog(section, "");
  
  console.log(`  - Seção conjunta: ${isConjunta}`);
  console.log(`  - Seção backlog: ${isBacklog}`);
  
  const prompt = `Você é um extrator de dados. Extraia EXATAMENTE o conteúdo desta seção do documento de mentoria.

CONTEXTO: Esta é a FASE ${faseNumero} de ${totalFases}.
${isConjunta ? "⚠️ ATENÇÃO: Esta é uma seção de ENTREGAS EM CONJUNTO - todas devem ter responsavel='conjunto'" : ""}
${isBacklog ? "⚠️ ATENÇÃO: Esta é uma seção de BACKLOG/PÓS-MVP - todos os itens devem ir para backlog" : ""}

MÓDULOS CONTRATADOS: ${modulosLista}
${contextoCliente ? `CONTEXTO: ${contextoCliente}` : ""}

SEÇÃO DO DOCUMENTO A PROCESSAR:
${section}

═══════════════════════════════════════════════════════════════
REGRAS DE EXTRAÇÃO LITERAL - SIGA RIGOROSAMENTE:
═══════════════════════════════════════════════════════════════

1. ENTREGAS = Títulos marcados como "ENTREGA X:", "Entrega:", ou blocos de atividades principais
   - Copie o TÍTULO EXATO como está escrito
   - Ex: "ENTREGA 3: Módulo de Gestão Financeira" → titulo: "Módulo de Gestão Financeira"
   - ❌ NÃO TRANSFORME em "Plano de Gestão" ou títulos genéricos
   - ❌ NÃO INVENTE entregas que não existem no texto

2. INSTRUÇÕES = Passos numerados (PASSO 1, 1., 2., 3., etc.) ou bullets detalhados
   - CADA passo numerado é UMA instrução SEPARADA
   - Mantenha o texto original de cada passo
   - Ex: "PASSO 1 - Preparar o prompt para o Claude" → titulo: "Preparar o prompt para o Claude"
   - Ex: "2. Enviar para o Claude" → titulo: "Enviar para o Claude"
   - Identifique a ferramenta mencionada (Claude, Lovable, MAPA, Drive, etc.)

3. TASKS = Itens de checklist (☐, □, [ ], ✓) ou perguntas de validação
   - CADA checkbox/pergunta é UMA task de validação SEPARADA
   - Ex: "☐ Consigo acessar a tela de receitas?" → titulo: "Consigo acessar a tela de receitas?"
   - Ex: "[ ] Verificar se o módulo está funcionando" → task

4. RESPONSÁVEL - Identifique no texto:
   - Se menciona "Paula", "mentorada", "você faz" → "voce"
   - Se menciona "Mariana", "mentora", "Mari" → "mentor"
   - Se menciona "Em Conjunto", "juntos", "Mariana + Paula" → "conjunto"
   ${isConjunta ? "- NESTA SEÇÃO: Forçar 'conjunto' para todas" : ""}

5. FERRAMENTA - Extraia a ferramenta mencionada:
   - "Claude", "Lovable", "MAPA", "Drive", "Notion", "Supabase", "Make", "N8N", "Zapier"
   - Se não mencionar ferramenta específica → "outro"
   - Se for reunião, call, meet → "reuniao"

6. BACKLOG - Itens para depois do MVP:
   ${isBacklog ? "- NESTA SEÇÃO: Todos os itens são backlog" : "- Seções 'Pós-MVP', 'Melhorias Futuras', 'Próximos Passos'"}
   - Items marcados como "A fazer", "Futuro", "Conforme demanda"

═══════════════════════════════════════════════════════════════

Responda APENAS com JSON válido:
{
  "etapas": [
    {
      "numero": ${faseNumero},
      "titulo": "TÍTULO EXATO DA FASE - COPIE DO DOCUMENTO",
      "objetivo": "Objetivo mencionado no documento"
    }
  ],
  "entregas": [
    {
      "etapa_numero": ${faseNumero},
      "numero_entrega": ${entregaOffset + 1},
      "titulo": "TÍTULO EXATO DA ENTREGA - COPIE DO DOCUMENTO",
      "descricao": "Descrição/objetivo da entrega como está no documento",
      "tipo": "${isBacklog ? "backlog" : "ativa"}",
      "prioridade": "alta",
      "modulo_relacionado": "Módulo mencionado"
    }
  ],
  "instrucoes": [
    {
      "entrega_numero": ${entregaOffset + 1},
      "titulo": "TEXTO EXATO DO PASSO - COPIE DO DOCUMENTO",
      "descricao": "Detalhes adicionais se houver",
      "responsavel": "${isConjunta ? "conjunto" : "voce"}",
      "ferramenta": "claude",
      "dicas": "Dicas ou observações mencionadas",
      "ordem": 1
    }
  ],
  "tasks": [
    {
      "entrega_numero": ${entregaOffset + 1},
      "titulo": "TEXTO EXATO DO CHECKLIST - COPIE DO DOCUMENTO",
      "tipo": "validacao",
      "prioridade": "alta",
      "instrucoes_validacao": "Como validar este item"
    }
  ],
  "backlog": [
    {
      "titulo": "Item futuro mencionado",
      "descricao": "Descrição do item",
      "justificativa": "Porque está no backlog (Pós-MVP, Melhoria Futura, etc.)"
    }
  ]
}

LEMBRE-SE:
- Extraia TUDO que está no documento - não omita itens
- Use texto LITERAL do documento - não resuma
- Se não encontrar determinado tipo de item, retorne array vazio []
- NÃO INVENTE conteúdo que não existe no texto`;

  try {
    const content = await callAI(apiKey, prompt, 8192);
    const parsed = extractJsonFromResponse(content);
    
    // Pós-processamento para normalizar valores
    const entregas = (parsed.entregas || []).map((e: any) => ({
      ...e,
      tipo: isBacklog ? "backlog" : (e.tipo || "ativa"),
      prioridade: e.prioridade || "alta"
    }));
    
    const instrucoes = (parsed.instrucoes || []).map((inst: any) => ({
      ...inst,
      responsavel: isConjunta ? "conjunto" : normalizarResponsavel(inst.responsavel),
      ferramenta: normalizarFerramenta(inst.ferramenta)
    }));
    
    const tasks = (parsed.tasks || []).map((t: any) => ({
      ...t,
      tipo: t.tipo || "validacao",
      prioridade: t.prioridade || "alta"
    }));
    
    console.log(`  Resultado fase ${faseNumero}:`);
    console.log(`    - Etapas: ${parsed.etapas?.length || 0}`);
    console.log(`    - Entregas: ${entregas.length}`);
    console.log(`    - Instruções: ${instrucoes.length}`);
    console.log(`    - Tasks: ${tasks.length}`);
    console.log(`    - Backlog: ${parsed.backlog?.length || 0}`);
    
    return {
      etapas: parsed.etapas || [],
      entregas,
      instrucoes,
      tasks,
      backlog: parsed.backlog || []
    };
  } catch (error) {
    console.error(`Erro ao processar fase ${faseNumero}:`, error);
    return {
      etapas: [{
        numero: faseNumero,
        titulo: `Fase ${faseNumero}`,
        objetivo: "Erro ao processar - revisar manualmente"
      }],
      entregas: [],
      instrucoes: [],
      tasks: [],
      backlog: []
    };
  }
}

// Função para renumerar e garantir continuidade
function renumberResults(
  partial: ResultadoParcial, 
  etapaNumero: number, 
  entregaOffset: number
): ResultadoParcial {
  const entregaMap: Record<number, number> = {};
  
  const entregas = (partial.entregas || []).map((e: any, i: number) => {
    const novoNumero = entregaOffset + i + 1;
    entregaMap[e.numero_entrega] = novoNumero;
    return {
      ...e,
      numero_entrega: novoNumero,
      etapa_numero: etapaNumero
    };
  });
  
  const instrucoes = (partial.instrucoes || []).map((inst: any) => ({
    ...inst,
    entrega_numero: entregaMap[inst.entrega_numero] || inst.entrega_numero
  }));
  
  const tasks = (partial.tasks || []).map((t: any) => ({
    ...t,
    entrega_numero: entregaMap[t.entrega_numero] || t.entrega_numero
  }));
  
  const etapas = (partial.etapas || []).map((e: any) => ({
    ...e,
    numero: etapaNumero
  }));
  
  return {
    etapas,
    entregas,
    instrucoes,
    tasks,
    backlog: partial.backlog || []
  };
}

// Handler principal
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

    console.log("=== INÍCIO DO PROCESSAMENTO ===");
    console.log(`Tamanho do documento: ${texto.length} caracteres`);
    console.log(`Módulos contratados: ${modulosLista}`);

    // PASSO 1: Identificar fases do documento
    const fases = await identificarFases(apiKey, texto);
    
    // Dividir documento baseado nas fases
    const sections = splitDocumentByPhases(texto, fases);
    
    console.log(`\n=== PROCESSANDO ${sections.length} SEÇÕES ===`);

    // PASSO 2: Processar cada fase
    const allResults: ResultadoParcial = {
      etapas: [],
      entregas: [],
      instrucoes: [],
      tasks: [],
      backlog: []
    };

    for (let i = 0; i < sections.length; i++) {
      const faseNumero = i + 1;
      const entregaOffset = allResults.entregas.length;
      
      const faseResult = await processarFase(
        apiKey,
        sections[i],
        faseNumero,
        sections.length,
        entregaOffset,
        modulosLista,
        contexto_cliente
      );
      
      const renumbered = renumberResults(faseResult, faseNumero, entregaOffset);
      
      allResults.etapas.push(...renumbered.etapas);
      allResults.entregas.push(...renumbered.entregas);
      allResults.instrucoes.push(...renumbered.instrucoes);
      allResults.tasks.push(...renumbered.tasks);
      allResults.backlog.push(...renumbered.backlog);
    }

    // Resultado final
    console.log("\n=== RESULTADO FINAL ===");
    console.log(`Total de etapas: ${allResults.etapas.length}`);
    console.log(`Total de entregas: ${allResults.entregas.length}`);
    console.log(`Total de instruções: ${allResults.instrucoes.length}`);
    console.log(`Total de tasks: ${allResults.tasks.length}`);
    console.log(`Total de backlog: ${allResults.backlog.length}`);

    const finalResult = {
      ...allResults,
      entregas_sugeridas: [],
      instrucoes_sugeridas: [],
      backlog_sugerido: allResults.backlog,
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
