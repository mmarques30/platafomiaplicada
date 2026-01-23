import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const prompt = `Você é um assistente especializado em analisar documentos de mentoria business, como propostas comerciais, transcrições de calls e guias de entregas.

Analise o documento e extraia a estrutura COMPLETA do projeto, organizando em:
1. FASES/ETAPAS: Grandes blocos do projeto (ex: "Fase 1: Documentação", "Fase 2: Financeiro")
2. ENTREGAS: Cada entrega dentro das fases (ex: "Entrega 1: Upload de Documentação")
3. INSTRUÇÕES: Passos detalhados de como executar cada entrega
4. TASKS: Checklists de validação para o mentorado completar
5. BACKLOG: Entregas futuras ou de baixa prioridade

MÓDULOS CONTRATADOS: ${modulosLista}
${contexto_cliente ? `CONTEXTO DO CLIENTE: ${contexto_cliente}` : ""}

DOCUMENTO A ANALISAR:
${texto}

Responda APENAS com um JSON válido neste formato exato:
{
  "etapas": [
    {
      "numero": 1,
      "titulo": "Documentação e Processos",
      "objetivo": "Organizar base documental da empresa"
    }
  ],
  "entregas": [
    {
      "etapa_numero": 1,
      "numero_entrega": 1,
      "titulo": "Upload de Documentação Completa",
      "descricao": "Subir toda documentação na pasta FLI do Drive",
      "tipo": "ativa",
      "prioridade": "alta",
      "modulo_relacionado": "Processos"
    }
  ],
  "instrucoes": [
    {
      "entrega_numero": 1,
      "titulo": "Acessar pasta FLI no Drive",
      "descricao": "Pasta já compartilhada com acesso de edição",
      "responsavel": "voce",
      "ferramenta": "drive",
      "dicas": "A pasta está na raiz do Drive compartilhado",
      "ordem": 1
    }
  ],
  "tasks": [
    {
      "entrega_numero": 1,
      "titulo": "Verificar se todos documentos foram carregados",
      "tipo": "validacao",
      "prioridade": "alta",
      "instrucoes_validacao": "Conferir se todas as subpastas estão preenchidas"
    }
  ],
  "backlog": [
    {
      "titulo": "Tradução para francês",
      "descricao": "Traduzir interface após conclusão em português",
      "justificativa": "Depende da conclusão do MVP"
    }
  ]
}

REGRAS IMPORTANTES PARA INSTRUÇÕES:
- Cada entrega pode ter MÚLTIPLAS instruções (passos/steps)
- Se o documento tiver "Instruções:", "Passo X:", "1.", "2." etc., extraia CADA passo como uma instrução SEPARADA
- Para instruções longas (ex: "13 passos para criar no Lovable"), extraia TODOS os passos individualmente
- Mantenha a ordem original (ordem: 1, 2, 3...)
- entrega_numero deve corresponder exatamente à entrega que a instrução pertence

REGRAS IMPORTANTES PARA BACKLOG:
- Extraia TODAS as seções de "Pós-MVP", "Melhorias Futuras", "Backlog", "Próximas Fases" como itens de backlog
- Cada funcionalidade futura deve ser um item separado
- Inclua uma justificativa clara do porquê está no backlog

REGRAS GERAIS:
- "etapas" são as fases do projeto (numere sequencialmente começando em 1)
- "entregas" são as entregas dentro de cada fase (etapa_numero indica a qual fase pertence)
- "instrucoes" são os passos para executar cada entrega (entrega_numero indica a qual entrega pertence)
- "tasks" são os itens de validação/checklist para cada entrega
- "tipo" de entrega deve ser "ativa" ou "backlog"
- "prioridade" deve ser "baixa", "media", "alta" ou "urgente"
- "responsavel" deve ser "voce" (mentorado), "mentor" ou "conjunto"
- "ferramenta" deve ser EXATAMENTE um destes valores: "claude", "lovable", "drive", "notion", "supabase", "make", "n8n", "zapier", "mapa", "reuniao", "outro"
- "tipo" de task deve ser "validacao", "aprovacao", "revisao", "homologacao", "assinatura" ou "feedback"
- Extraia TODOS os passos e checklists do documento
- Se o documento tiver checklists (☐), converta em tasks
- Se houver instruções numeradas, converta em instrucoes
- Mantenha a ordem original do documento`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido, tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro na API:", errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Função robusta para extrair e limpar JSON
    function extractJsonFromResponse(response: string): any {
      // Step 1: Remove markdown code blocks
      let cleaned = response
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Step 2: Find JSON boundaries
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found in response");
      }

      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

      // Step 3: Sanitize problematic characters before parsing
      cleaned = cleaned
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars except \n, \r, \t
        .replace(/\r\n/g, "\\n") // Normalize line endings
        .replace(/\r/g, "\\n")
        .replace(/\n/g, "\\n") // Escape actual newlines in JSON
        .replace(/\t/g, "\\t"); // Escape tabs

      // Step 4: Attempt parse with error handling
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.log("First parse failed, attempting recovery...");
        
        // Step 5: More aggressive cleanup
        cleaned = cleaned
          .replace(/,\s*}/g, "}") // Remove trailing commas before }
          .replace(/,\s*]/g, "]") // Remove trailing commas before ]
          .replace(/\\n/g, " ") // Replace escaped newlines with spaces for safer parsing
          .replace(/\\t/g, " ") // Replace escaped tabs
          .replace(/\\"/g, "'") // Convert escaped quotes to single quotes (lossy but safer)
          .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
          .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
          .replace(/\u2026/g, "...") // Ellipsis
          .replace(/[\u2013\u2014]/g, "-"); // Em/en dashes

        try {
          return JSON.parse(cleaned);
        } catch (e2) {
          console.log("Second parse failed, attempting structural recovery...");
          
          // Step 6: Try to rebuild a valid JSON structure from partial data
          // Find all complete array elements for each section
          const result: any = {
            etapas: [],
            entregas: [],
            instrucoes: [],
            tasks: [],
            backlog: []
          };

          // Extract each section separately
          const sections = ['etapas', 'entregas', 'instrucoes', 'tasks', 'backlog'];
          
          for (const section of sections) {
            const sectionRegex = new RegExp(`"${section}"\\s*:\\s*\\[`, 'i');
            const match = cleaned.match(sectionRegex);
            
            if (match && match.index !== undefined) {
              const startIdx = match.index + match[0].length;
              let depth = 1;
              let endIdx = startIdx;
              let inString = false;
              let escapeNext = false;

              for (let i = startIdx; i < cleaned.length && depth > 0; i++) {
                const char = cleaned[i];
                
                if (escapeNext) {
                  escapeNext = false;
                  continue;
                }
                
                if (char === '\\') {
                  escapeNext = true;
                  continue;
                }
                
                if (char === '"') {
                  inString = !inString;
                  continue;
                }
                
                if (!inString) {
                  if (char === '[') depth++;
                  else if (char === ']') {
                    depth--;
                    if (depth === 0) endIdx = i;
                  }
                }
              }

              if (endIdx > startIdx) {
                const arrayContent = cleaned.substring(startIdx, endIdx);
                // Try to parse individual objects from the array
                const objectRegex = /\{[^{}]*\}/g;
                let objMatch;
                
                while ((objMatch = objectRegex.exec(arrayContent)) !== null) {
                  try {
                    // Clean the individual object
                    let objStr = objMatch[0]
                      .replace(/'/g, "\\'") // Escape single quotes
                      .replace(/\\'/g, "'"); // But not double-escaped
                    
                    const obj = JSON.parse(objStr);
                    result[section].push(obj);
                  } catch (objErr) {
                    // Skip malformed objects
                    console.log(`Skipping malformed ${section} object`);
                  }
                }
              }
            }
          }

          // Check if we recovered any data
          const hasData = Object.values(result).some((arr: any) => arr.length > 0);
          
          if (hasData) {
            console.log("Recovered partial data:", {
              etapas: result.etapas.length,
              entregas: result.entregas.length,
              instrucoes: result.instrucoes.length,
              tasks: result.tasks.length,
              backlog: result.backlog.length
            });
            return result;
          }

          throw new Error(`JSON parsing failed after all recovery attempts: ${e2}`);
        }
      }
    }

    const parsedResult = extractJsonFromResponse(content);

    // Garantir estrutura mínima
    const finalResult = {
      etapas: parsedResult.etapas || [],
      entregas: parsedResult.entregas || [],
      instrucoes: parsedResult.instrucoes || [],
      tasks: parsedResult.tasks || [],
      backlog: parsedResult.backlog || [],
      // Manter compatibilidade com formato antigo
      entregas_sugeridas: parsedResult.entregas_sugeridas || [],
      instrucoes_sugeridas: parsedResult.instrucoes_sugeridas || [],
      backlog_sugerido: parsedResult.backlog_sugerido || parsedResult.backlog || [],
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
