import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { equipe_id, force } = await req.json();
    if (!equipe_id) {
      return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Buscar membros ativos
    const { data: membros, error: membrosError } = await supabase
      .from("membros_equipe_skills")
      .select("user_id")
      .eq("equipe_id", equipe_id)
      .eq("status", "ativo");

    if (membrosError) throw membrosError;
    if (!membros?.length) {
      return new Response(JSON.stringify({ error: "Nenhum membro ativo na equipe" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const membrosIds = membros.map((m: any) => m.user_id);

    // 2. Buscar projetos e entregas
    let projetosQuery = supabase
      .from("backlog_skills")
      .select("id")
      .eq("equipe_id", equipe_id);
    if (!force) projetosQuery = projetosQuery.is("responsavel_id", null);
    const { data: projetos } = await projetosQuery;

    let entregasQuery = supabase
      .from("entregas_skills")
      .select("id")
      .eq("equipe_id", equipe_id);
    if (!force) entregasQuery = entregasQuery.is("responsavel_id", null);
    const { data: entregas } = await entregasQuery;

    // Also check entregas_equipe_skills
    let entregasEquipeQuery = supabase
      .from("entregas_equipe_skills")
      .select("id")
      .eq("equipe_id", equipe_id);
    if (!force) entregasEquipeQuery = entregasEquipeQuery.is("responsavel_id", null);
    const { data: entregasEquipe } = await entregasEquipeQuery;

    const allItems = [
      ...(projetos || []).map((p: any) => ({ id: p.id, table: "backlog_skills" })),
      ...(entregas || []).map((e: any) => ({ id: e.id, table: "entregas_skills" })),
      ...(entregasEquipe || []).map((e: any) => ({ id: e.id, table: "entregas_equipe_skills" })),
    ];

    if (allItems.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Nenhum item para associar", associados: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Distribuir round-robin deterministicamente
    let atualizados = 0;
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const responsavelId = membrosIds[i % membrosIds.length];

      const { error } = await supabase
        .from(item.table)
        .update({ responsavel_id: responsavelId })
        .eq("id", item.id);

      if (error) {
        console.error(`Erro ao atualizar ${item.id} em ${item.table}:`, error.message);
      } else {
        atualizados++;
      }
    }

    return new Response(JSON.stringify({ success: true, associados: atualizados, total: allItems.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
