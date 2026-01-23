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

// PASSO 1: Identificar fases do documento
async function identificarFases(apiKey: string, texto: string): Promise<FaseIdentificada[]> {
  console.log("=== PASSO 1: Identificando fases do documento ===");
  
  const prompt = `Analise este documento e identifique TODAS as fases/etapas/seções principais.

DOCUMENTO:
${texto.substring(0, 30000)} ${texto.length > 30000 ? '...[documento continua]' : ''}

Responda APENAS com JSON válido:
{
  "fases_encontradas": [
    {
      "numero": 1,
      "titulo": "Nome da Fase/Etapa",
      "inicio_texto": "copie as primeiras 30-50 palavras exatas desta fase",
      "fim_texto": "copie as últimas 30-50 palavras exatas desta fase"
    }
  ],
  "total_fases": 3
}

REGRAS CRÍTICAS:
- Identifique TODAS as fases, não importa quantas sejam (2, 5, 10, 15...)
- Fases podem ser marcadas como: "Fase X", "Etapa X", "Módulo X", "Bloco X", headers markdown (# ##), numerações, etc.
- Inclua seções de "Backlog", "Pós-MVP", "Melhorias Futuras", "Próximos Passos" como fases separadas
- Os campos inicio_texto e fim_texto devem ser texto EXATO do documento para localização
- Se não encontrar divisões claras, retorne uma única fase com o documento todo
- NÃO INVENTE conteúdo, use apenas texto que existe no documento`;

  try {
    const content = await callAI(apiKey, prompt, 2048);
    const parsed = extractJsonFromResponse(content);
    
    const fases = parsed.fases_encontradas || [];
    console.log(`Fases identificadas: ${fases.length}`);
    fases.forEach((f: FaseIdentificada, i: number) => {
      console.log(`  ${i + 1}. ${f.titulo}`);
    });
    
    // Se não encontrou fases, retornar documento como fase única
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
    // Fallback: tratar documento inteiro como uma fase
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
    
    // Encontrar início desta fase usando parte do texto inicial
    const searchStart = fase.inicio_texto.substring(0, Math.min(50, fase.inicio_texto.length));
    let startIndex = texto.indexOf(searchStart);
    
    // Fallback: buscar por título
    if (startIndex === -1) {
      startIndex = texto.toLowerCase().indexOf(fase.titulo.toLowerCase());
    }
    
    // Se ainda não encontrou, usar posição proporcional
    if (startIndex === -1) {
      startIndex = Math.floor((i / fases.length) * texto.length);
    }
    
    // Encontrar fim (início da próxima fase ou fim do documento)
    let endIndex = texto.length;
    if (nextFase) {
      const searchEnd = nextFase.inicio_texto.substring(0, Math.min(50, nextFase.inicio_texto.length));
      const nextStart = texto.indexOf(searchEnd, startIndex + 100);
      
      if (nextStart > startIndex) {
        endIndex = nextStart;
      } else {
        // Fallback: buscar por título da próxima
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
  
  // Se não conseguiu dividir, retornar documento inteiro
  if (sections.length === 0) {
    console.log("Não foi possível dividir, usando documento completo");
    return [texto];
  }
  
  return sections;
}

// PASSO 2: Processar cada fase individualmente
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
  
  const prompt = `Você é um assistente especializado em analisar documentos de mentoria business.

CONTEXTO: Esta é a FASE ${faseNumero} de ${totalFases} de um documento de mentoria.

IMPORTANTE - EXTRAIA ABSOLUTAMENTE TUDO:
- NÃO resuma ou omita informações
- Cada item listado deve virar uma entrega, instrução ou task
- Se houver listas numeradas (1., 2., 3...), cada item é uma instrução SEPARADA
- Se houver checklists (☐ ou □ ou [ ]), cada item é uma task SEPARADA
- Capture TODOS os detalhes, dicas, observações e notas

NUMERAÇÃO PARA ESTA FASE:
- numero da etapa: ${faseNumero}
- entregas começam em: ${entregaOffset + 1}

MÓDULOS CONTRATADOS: ${modulosLista}
${contextoCliente ? `CONTEXTO DO CLIENTE: ${contextoCliente}` : ""}

SEÇÃO A ANALISAR:
${section}

Responda APENAS com JSON válido:
{
  "etapas": [
    {
      "numero": ${faseNumero},
      "titulo": "Título da Fase",
      "objetivo": "Objetivo principal desta fase"
    }
  ],
  "entregas": [
    {
      "etapa_numero": ${faseNumero},
      "numero_entrega": ${entregaOffset + 1},
      "titulo": "Título da Entrega",
      "descricao": "Descrição detalhada",
      "tipo": "ativa",
      "prioridade": "alta",
      "modulo_relacionado": "Módulo"
    }
  ],
  "instrucoes": [
    {
      "entrega_numero": ${entregaOffset + 1},
      "titulo": "Passo específico",
      "descricao": "Detalhes do passo",
      "responsavel": "voce",
      "ferramenta": "outro",
      "dicas": "Dicas adicionais",
      "ordem": 1
    }
  ],
  "tasks": [
    {
      "entrega_numero": ${entregaOffset + 1},
      "titulo": "Item de validação",
      "tipo": "validacao",
      "prioridade": "alta",
      "instrucoes_validacao": "Como validar"
    }
  ],
  "backlog": [
    {
      "titulo": "Item futuro",
      "descricao": "Descrição",
      "justificativa": "Porque está no backlog"
    }
  ]
}

REGRAS CRÍTICAS:
- "tipo" de entrega: "ativa" ou "backlog"
- "prioridade": "baixa", "media", "alta" ou "urgente"
- "responsavel": "voce" (mentorado), "mentor" ou "conjunto"
- "ferramenta": "claude", "lovable", "drive", "notion", "supabase", "make", "n8n", "zapier", "mapa", "reuniao", "outro"
- "tipo" de task: "validacao", "aprovacao", "revisao", "homologacao", "assinatura", "feedback"
- NÃO PULE nenhum item do documento
- Se a seção tiver passos numerados, CADA passo é uma instrução separada
- Se a seção tiver checklists, CADA checkbox é uma task separada`;

  try {
    const content = await callAI(apiKey, prompt, 6144);
    const parsed = extractJsonFromResponse(content);
    
    console.log(`  Resultado fase ${faseNumero}:`);
    console.log(`    - Etapas: ${parsed.etapas?.length || 0}`);
    console.log(`    - Entregas: ${parsed.entregas?.length || 0}`);
    console.log(`    - Instruções: ${parsed.instrucoes?.length || 0}`);
    console.log(`    - Tasks: ${parsed.tasks?.length || 0}`);
    console.log(`    - Backlog: ${parsed.backlog?.length || 0}`);
    
    return {
      etapas: parsed.etapas || [],
      entregas: parsed.entregas || [],
      instrucoes: parsed.instrucoes || [],
      tasks: parsed.tasks || [],
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
  
  // Renumerar entregas
  const entregas = (partial.entregas || []).map((e: any, i: number) => {
    const novoNumero = entregaOffset + i + 1;
    entregaMap[e.numero_entrega] = novoNumero;
    return {
      ...e,
      numero_entrega: novoNumero,
      etapa_numero: etapaNumero
    };
  });
  
  // Atualizar referências em instruções
  const instrucoes = (partial.instrucoes || []).map((inst: any) => ({
    ...inst,
    entrega_numero: entregaMap[inst.entrega_numero] || inst.entrega_numero
  }));
  
  // Atualizar referências em tasks
  const tasks = (partial.tasks || []).map((t: any) => ({
    ...t,
    entrega_numero: entregaMap[t.entrega_numero] || t.entrega_numero
  }));
  
  // Garantir numeração correta da etapa
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
      
      // Renumerar para garantir continuidade
      const renumbered = renumberResults(faseResult, faseNumero, entregaOffset);
      
      // Agregar resultados
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
      // Manter compatibilidade com formato antigo
      entregas_sugeridas: [],
      instrucoes_sugeridas: [],
      backlog_sugerido: allResults.backlog,
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro:", error);
    
    // Tratar erros específicos de rate limit
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
