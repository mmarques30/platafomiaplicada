import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function balancearResponsaveis(itens: any[], membrosInfo: any[]) {
  const membrosIds = membrosInfo.map((m: any) => m.user_id);
  if (membrosIds.length === 0) return itens;
  
  const maxPorMembro = Math.ceil(itens.length / membrosIds.length);
  const contagem: Record<string, number> = {};
  membrosIds.forEach((id: string) => contagem[id] = 0);

  // Count current assignments
  itens.forEach((item: any) => {
    if (item.responsavel_id && contagem[item.responsavel_id] !== undefined) {
      contagem[item.responsavel_id]++;
    }
  });

  // Redistribute excess
  for (const item of itens) {
    if (item.responsavel_id && (contagem[item.responsavel_id] || 0) > maxPorMembro) {
      const membroMenosOcupado = membrosIds
        .filter((id: string) => (contagem[id] || 0) < maxPorMembro)
        .sort((a: string, b: string) => (contagem[a] || 0) - (contagem[b] || 0))[0];
      if (membroMenosOcupado) {
        contagem[item.responsavel_id]--;
        item.responsavel_id = membroMenosOcupado;
        contagem[membroMenosOcupado] = (contagem[membroMenosOcupado] || 0) + 1;
      }
    }
  }

  // Ensure every member has at least 1 item
  for (const id of membrosIds) {
    if ((contagem[id] || 0) === 0) {
      const membroMaisOcupado = [...membrosIds]
        .sort((a: string, b: string) => (contagem[b] || 0) - (contagem[a] || 0))[0];
      if ((contagem[membroMaisOcupado] || 0) > 1) {
        const itemParaReatribuir = itens.find((i: any) => i.responsavel_id === membroMaisOcupado);
        if (itemParaReatribuir) {
          contagem[membroMaisOcupado]--;
          itemParaReatribuir.responsavel_id = id;
          contagem[id] = 1;
        }
      }
    }
  }

  // Assign unassigned items to least busy member
  for (const item of itens) {
    if (!item.responsavel_id || !membrosIds.includes(item.responsavel_id)) {
      const membroMenosOcupado = [...membrosIds]
        .sort((a: string, b: string) => (contagem[a] || 0) - (contagem[b] || 0))[0];
      item.responsavel_id = membroMenosOcupado;
      contagem[membroMenosOcupado] = (contagem[membroMenosOcupado] || 0) + 1;
    }
  }

  return itens;
}

function mapPrioridade(prioridade: string): string {
  switch (prioridade) {
    case "alta": return "P1";
    case "media": return "P2";
    case "baixa": return "P3";
    default: return "P2";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { equipe_id } = await req.json();
    if (!equipe_id) return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: diagnosticos } = await supabase.from("diagnosticos_skills").select("*").eq("equipe_id", equipe_id).eq("completado", true);
    if (!diagnosticos?.length) return new Response(JSON.stringify({ error: "Nenhum diagnóstico preenchido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Buscar membros para associação
    const { data: membros } = await supabase
      .from("membros_equipe_skills")
      .select("user_id, papel, profiles(nome_completo, cargo)")
      .eq("equipe_id", equipe_id)
      .eq("status", "ativo");

    const membrosInfo = (membros || []).map((m: any) => {
      const diag = diagnosticos.find((d: any) => d.user_id === m.user_id);
      return {
        user_id: m.user_id,
        nome: (m.profiles as any)?.nome_completo || "Membro",
        cargo: (m.profiles as any)?.cargo || m.papel || "Colaborador",
        area: diag?.area_atuacao || "",
        processos: diag?.processos_detalhados || diag?.tarefas_manuais || [],
        gargalos: diag?.gargalos_identificados || [],
      };
    });

    const resumo = diagnosticos.map(d => ({
      processos: d.processos_detalhados || d.tarefas_manuais,
      gargalos: d.gargalos_identificados,
      economia: d.economia_horas_semana,
      area: d.area_atuacao,
    }));

    const membrosTexto = membrosInfo.map((m: any) =>
      `- ${m.nome} (${m.cargo}, Área: ${m.area})\n  Processos: ${JSON.stringify(m.processos)}\n  Gargalos: ${JSON.stringify(m.gargalos)}`
    ).join("\n");

    const listaMembrosNomes = membrosInfo.map((m: any) => m.nome).join(", ");

    const systemPrompt = `Analise os diagnósticos de uma equipe e sugira projetos colaborativos de automação com IA. Retorne usando a função fornecida.

MEMBROS DA EQUIPE:
${membrosTexto}

REGRAS OBRIGATÓRIAS:
1. Gere pelo menos 1 projeto por membro da equipe. TODOS os membros devem ter pelo menos 1 projeto: ${listaMembrosNomes}.
2. Para cada projeto, atribua um responsavel_nome (nome EXATO de um dos membros acima) com base na relevância do projeto para a área e processos do membro.
3. PRIORIDADE MÁXIMA: Associe cada projeto ao DONO DO PROCESSO — o membro que EXECUTA aquela tarefa no dia a dia.
4. NÃO concentre projetos em um único membro. Distribua proporcionalmente.
5. Se um membro tem processos de natureza ESTRATÉGICA ou GESTÃO (ex: "Planejamento Estratégico", "Gestão de Time", "Gestão de Fornecedores") e NÃO tem gargalos operacionais claros:
   - Sugira projetos de apoio à gestão com IA (ex: dashboards inteligentes, automação de reports, análise preditiva, assistente de decisão, etc.)
   - Marque o campo "necessita_avaliacao" como true para esses projetos
6. Se um membro tem processos operacionais com gargalos claros e repetitivos:
   - Gere projetos de automação direta
   - Marque "necessita_avaliacao" como false
7. Ao final, confira: cada membro da lista (${listaMembrosNomes}) tem pelo menos 1 projeto? Se não, adicione.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(resumo) }
        ],
        tools: [{
          type: "function",
          function: {
            name: "sugerir_projetos",
            description: "Sugere projetos baseados nos diagnósticos. DEVE incluir pelo menos 1 projeto por membro.",
            parameters: {
              type: "object",
              properties: {
                projetos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      titulo: { type: "string" },
                      descricao: { type: "string" },
                      area_impactada: { type: "string" },
                      horas_estimadas_economia: { type: "number" },
                      prioridade: { type: "string", enum: ["alta", "media", "baixa"] },
                      responsavel_nome: { type: "string", description: "Nome EXATO do membro responsável" },
                      necessita_avaliacao: { type: "boolean", description: "true se o projeto é sugerido para perfil estratégico/gestão sem gargalos operacionais claros" },
                    },
                    required: ["titulo", "descricao", "prioridade", "responsavel_nome", "necessita_avaliacao"]
                  }
                }
              },
              required: ["projetos"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "sugerir_projetos" } }
      }),
    });

    if (!response.ok) throw new Error("Erro na IA");
    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("IA não retornou projetos");

    const { projetos } = JSON.parse(toolCall.function.arguments);

    // Mapear nomes para user_ids
    const nomeToId: Record<string, string> = {};
    for (const m of membrosInfo) {
      nomeToId[m.nome.toLowerCase().trim()] = m.user_id;
    }

    const findUserId = (nome: string): string | null => {
      if (!nome) return null;
      const key = Object.keys(nomeToId).find(
        (k) => nome.toLowerCase().trim().includes(k) || k.includes(nome.toLowerCase().trim())
      );
      return key ? nomeToId[key] : null;
    };

    let inserts = projetos.map((p: any, i: number) => ({
      equipe_id,
      titulo: p.titulo,
      descricao: p.descricao,
      area_impactada: p.area_impactada || null,
      horas_estimadas_economia: p.horas_estimadas_economia || null,
      prioridade: p.prioridade,
      status: "levantado",
      origem: "ia",
      ordem: i,
      responsavel_id: findUserId(p.responsavel_nome),
      tags: p.necessita_avaliacao ? ["pendente_avaliacao"] : [],
    }));

    // Balance distribution across all members
    inserts = balancearResponsaveis(inserts, membrosInfo);

    const { data: insertedProjetos, error: insertError } = await supabase
      .from("backlog_skills")
      .insert(inserts)
      .select("id, titulo, descricao, prioridade, horas_estimadas_economia, responsavel_id, tags");
    if (insertError) throw new Error("Erro ao salvar projetos: " + insertError.message);

    // Criar entregas automaticamente para cada projeto gerado
    if (insertedProjetos?.length) {
      const entregasInserts = insertedProjetos.map((p: any) => ({
        equipe_id,
        backlog_item_id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        status: "pendente",
        prioridade: mapPrioridade(p.prioridade || "media"),
        economia_horas_semana: p.horas_estimadas_economia || null,
        responsavel_id: p.responsavel_id || null,
        tags: p.tags || [],
      }));

      const { error: entregasError } = await supabase
        .from("entregas_skills")
        .insert(entregasInserts);
      
      if (entregasError) {
        console.error("Erro ao criar entregas automáticas:", entregasError.message);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      projetos_criados: inserts.length,
      entregas_criadas: insertedProjetos?.length || 0
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
