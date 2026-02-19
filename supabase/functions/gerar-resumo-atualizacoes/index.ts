import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABELA_NOMES: Record<string, string> = {
  videos: "Vídeos",
  modulos: "Módulos",
  trilhas: "Trilhas",
  biblioteca_prompts: "Prompts",
  ia_copie_use: "IA Copie e Use",
  ferramentas_ia: "Ferramentas de IA",
  metodos_aplicar: "Métodos para Aplicar",
  materiais_gratuitos: "Materiais Gratuitos",
  conteudos_dashboard: "Conteúdos do Dashboard",
  aulas_semanais: "Aulas Semanais",
};

function agruparRegistros(registros: any[]) {
  const agrupado: Record<string, { adicionados: any[]; atualizados: any[]; removidos: any[]; adicionados_por_tema: Record<string, string[]> }> = {};

  for (const r of registros) {
    const titulo = dados.titulo || dados.nome || dados.tema || dados.name || "(sem título)";
    let nomeAmigavel = TABELA_NOMES[r.tabela] || r.tabela;
    if (r.tabela === 'conteudos_dashboard') {
      const tipo = dados.tipo;
      const TIPO_NOMES: Record<string, string> = {
        newsletter: 'Newsletters',
        noticia: 'Notícias',
        dica: 'Dicas',
        material: 'Materiais da Central',
        criador: 'Criadores de Conteúdo',
      };
      nomeAmigavel = TIPO_NOMES[tipo] || 'Central de Conteúdos';
    }
    if (!agrupado[nomeAmigavel]) {
      agrupado[nomeAmigavel] = { adicionados: [], atualizados: [], removidos: [], adicionados_por_tema: {} };
    }

    const dados = r.dados_novos || r.dados_anteriores || {};
    const titulo = dados.titulo || dados.nome || dados.tema || dados.name || "(sem título)";
    const categoria = dados.categoria || dados.categoria_principal || null;

    if (r.operacao === "INSERT") {
      if (categoria) {
        if (!agrupado[nomeAmigavel].adicionados_por_tema[categoria]) {
          agrupado[nomeAmigavel].adicionados_por_tema[categoria] = [];
        }
        agrupado[nomeAmigavel].adicionados_por_tema[categoria].push(titulo);
      } else {
        agrupado[nomeAmigavel].adicionados.push(titulo);
      }
    } else if (r.operacao === "UPDATE") {
      const entry: any = { titulo };
      if (r.campos_alterados?.length) {
        entry.campos = r.campos_alterados.filter((c: string) => !["updated_at", "created_at"].includes(c));
      }
      if (entry.campos?.length > 0) {
        agrupado[nomeAmigavel].atualizados.push(entry);
      }
    } else if (r.operacao === "DELETE") {
      agrupado[nomeAmigavel].removidos.push(titulo);
    }
  }

  // Clean up empty arrays
  const resultado: Record<string, any> = {};
  for (const [nome, dados] of Object.entries(agrupado)) {
    const entry: any = {};
    if (dados.adicionados.length > 0) entry.adicionados = dados.adicionados;
    if (Object.keys(dados.adicionados_por_tema).length > 0) entry.adicionados_por_tema = dados.adicionados_por_tema;
    if (dados.atualizados.length > 0) entry.atualizados = dados.atualizados;
    if (dados.removidos.length > 0) entry.removidos = dados.removidos;
    if (Object.keys(entry).length > 0) resultado[nome] = entry;
  }

  return resultado;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { periodo } = await req.json();
    const dias = periodo === "30d" ? 30 : 7;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    const { data: registros, error: queryError } = await supabase
      .from("auditoria_conteudo")
      .select("tabela, operacao, dados_novos, dados_anteriores, campos_alterados, created_at")
      .gte("created_at", dataLimite.toISOString())
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(JSON.stringify({ error: "Erro ao buscar dados" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!registros || registros.length === 0) {
      return new Response(
        JSON.stringify({ resumo: `Nenhuma alteração encontrada nos últimos ${dias} dias.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const porCategoria = agruparRegistros(registros);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um assistente que gera resumos de atualizações de uma plataforma educacional de IA.

Você receberá um JSON com dados PRÉ-AGRUPADOS por seção (Vídeos, Prompts, IA Copie e Use, Ferramentas de IA, etc.).

REGRAS DE FORMATAÇÃO:
1. Título: "📢 Resumo de Atualizações - Últimos X dias"
2. Para CADA seção presente nos dados, crie um bloco com emoji apropriado:
   - 🎬 Vídeos
   - 📝 Prompts
   - 🤖 IA Copie e Use
   - 🔧 Ferramentas de IA
   - 📚 Módulos
   - 🎯 Trilhas
   - 💡 Métodos para Aplicar
   - 📄 Materiais Gratuitos
   - 📰 Newsletters
   - 📣 Notícias
   - 💡 Dicas
   - 📦 Materiais da Central
   - 👤 Criadores de Conteúdo
   - Se houver "adicionados_por_tema", organize por tema/categoria (ex: "**Vendas:** item1, item2")
   - Se houver "adicionados" sem tema, liste os itens
   - Se houver mais de 10 itens em uma categoria, use formato numérico: "33 novos prompts adicionados"
   - Se houver menos de 10 itens, liste cada um pelo nome
   - Se houver "atualizados", mencione brevemente quais campos foram alterados
   - Se houver "removidos", mencione brevemente

4. Finalize com uma frase motivacional curta sobre as novidades.

5. Use formatação compatível com WhatsApp/Telegram (negrito com *, emojis).

NÃO invente dados. Use APENAS as informações fornecidas no JSON.`;

    const userPrompt = JSON.stringify({
      periodo: `${dias} dias`,
      total_alteracoes: registros.length,
      por_categoria: porCategoria,
    });

    console.log("Sending AI request, payload size:", userPrompt.length, "chars, total records:", registros.length);

    const makeAIRequest = async (model: string) => {
      return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
    };

    let aiResponse = await makeAIRequest("google/gemini-2.5-flash");

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);

      console.log("Retrying with fallback model...");
      aiResponse = await makeAIRequest("openai/gpt-5-mini");

      if (!aiResponse.ok) {
        const fallbackErr = await aiResponse.text();
        console.error("Fallback AI error:", aiResponse.status, fallbackErr);
        return new Response(JSON.stringify({ error: "Erro ao gerar resumo. Tente novamente." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const aiData = await aiResponse.json();
    const resumo = aiData.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";

    return new Response(JSON.stringify({ resumo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
