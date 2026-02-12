import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { equipe_id } = await req.json();
    if (!equipe_id) {
      return new Response(JSON.stringify({ error: "equipe_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all relevant data in parallel
    const [equipeRes, backlogRes, entregasRes] = await Promise.all([
      supabase.from("equipes_skills").select("*").eq("id", equipe_id).single(),
      supabase.from("backlog_skills").select("*").eq("equipe_id", equipe_id).neq("status", "descartado"),
      supabase.from("entregas_skills").select("*").eq("equipe_id", equipe_id),
    ]);

    if (equipeRes.error) throw new Error(`Erro ao buscar equipe: ${equipeRes.error.message}`);

    const equipe = equipeRes.data;
    const backlog = backlogRes.data || [];
    const entregas = entregasRes.data || [];

    const investimento = equipe.investimento || 0;
    const custoHora = equipe.custo_hora_padrao || 60;
    const dataInicio = new Date(equipe.data_inicio || equipe.created_at);

    // Helper: add weeks to a date
    const addWeeks = (date: Date, weeks: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + weeks * 7);
      return result;
    };

    // Calculate total projected economy for ROI target
    const economiaTotal = entregas.reduce((a: number, e: any) => a + (e.economia_horas_semana || 0) * 4, 0);
    const roiAlvo = investimento > 0 ? (economiaTotal * custoHora / investimento) * 100 : 100;

    // Build 12 weeks of deterministic metrics
    const rows = [];
    for (let semana = 1; semana <= 12; semana++) {
      const fimSemana = addWeeks(dataInicio, semana);

      // Entregas planejadas: those with prazo <= end of this week (cumulative)
      const planejadas = entregas.filter((e: any) => {
        if (!e.prazo) return false;
        return new Date(e.prazo) <= fimSemana;
      }).length;

      // Entregas concluídas: those with concluido_em <= end of this week (cumulative)
      const concluidas = entregas.filter((e: any) => {
        if (!e.concluido_em) return false;
        return new Date(e.concluido_em) <= fimSemana;
      }).length;

      // Horas economizadas: sum of economia_horas_semana for concluded deliveries (cumulative)
      const horasEconomizadas = entregas
        .filter((e: any) => e.concluido_em && new Date(e.concluido_em) <= fimSemana)
        .reduce((acc: number, e: any) => acc + (e.economia_horas_semana || 0), 0);

      // Projetos concluídos from backlog (simple count, same across weeks for now)
      const projetosConcluidos = backlog.filter((p: any) => p.status === "concluido").length;

      // ROI projetado: progressive distribution toward target
      const roiProjetado = Math.round((roiAlvo * (semana / 12)) * 100) / 100;

      // ROI executado: based on real concluded deliveries
      const economiaReal = horasEconomizadas * custoHora;
      const roiExecutado = investimento > 0 ? Math.round((economiaReal / investimento) * 100 * 100) / 100 : 0;

      // Índice de maturidade: progressive estimate (15% to 90%)
      const indiceMaturidade = Math.round(15 + (75 * (semana / 12) * (0.5 + 0.5 * (concluidas / Math.max(planejadas, 1)))));

      // Engajamento trilhas: based on delivery progress
      const totalEntregas = entregas.length;
      const entregasEmAndamento = entregas.filter((e: any) => e.status === "em_andamento").length;
      const engajamento = totalEntregas > 0
        ? Math.round(((concluidas + entregasEmAndamento * 0.5) / totalEntregas) * 100 * (semana / 12))
        : Math.round(20 + 60 * (semana / 12));

      rows.push({
        equipe_id,
        semana,
        horas_economizadas: Math.round(horasEconomizadas * 100) / 100,
        projetos_concluidos: projetosConcluidos,
        entregas_concluidas: concluidas,
        entregas_planejadas: planejadas,
        indice_maturidade: Math.min(indiceMaturidade, 100),
        roi_projetado: roiProjetado,
        roi_executado: Math.min(roiExecutado, roiProjetado), // never exceed projected
        engajamento_trilhas: Math.min(engajamento, 100),
      });
    }

    // Delete existing metrics and insert new ones
    const { error: deleteError } = await supabase
      .from("metricas_skills")
      .delete()
      .eq("equipe_id", equipe_id);

    if (deleteError) throw new Error(`Erro ao limpar métricas: ${deleteError.message}`);

    const { error: insertError } = await supabase.from("metricas_skills").insert(rows);
    if (insertError) throw new Error(`Erro ao inserir métricas: ${insertError.message}`);

    console.log(`Métricas geradas: ${rows.length} semanas, ${entregas.length} entregas, ${backlog.length} projetos`);

    return new Response(
      JSON.stringify({ success: true, total: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
