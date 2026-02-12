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

    const addWeeks = (date: Date, weeks: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + weeks * 7);
      return result;
    };

    // Total de projetos no backlog (todos, não apenas concluídos)
    const totalProjetos = backlog.length;

    // Economia total estimada semanal (para ROI quando investimento = 0)
    const economiaTotal = entregas.reduce((a: number, e: any) => a + (e.economia_horas_semana || 0), 0);
    const economiaTotalReais = economiaTotal * custoHora;

    // Não precisa mais de distribuição uniforme - projetos são contados por entregas reais

    const rows = [];

    for (let semana = 1; semana <= 12; semana++) {
      const inicioSemana = addWeeks(dataInicio, semana - 1);
      const fimSemana = addWeeks(dataInicio, semana);

      // Entregas planejadas NESTA semana (não acumulado)
      const entregasDaSemana = entregas.filter((e: any) => {
        if (!e.prazo) return false;
        const prazo = new Date(e.prazo);
        return prazo >= inicioSemana && prazo < fimSemana;
      });
      const planejadas = entregasDaSemana.length;

      // Entregas concluídas NESTA semana (não acumulado)
      const concluidasNaSemana = entregas.filter((e: any) => {
        if (!e.concluido_em) return false;
        const concluido = new Date(e.concluido_em);
        return concluido >= inicioSemana && concluido < fimSemana;
      });
      const concluidas = concluidasNaSemana.length;

      // Horas economizadas RECORRENTES: soma de TODAS as entregas com prazo até esta semana
      // Uma vez implementada, a economia se repete toda semana a partir dali
      const horasRecorrentes = entregas
        .filter((e: any) => e.prazo && new Date(e.prazo) < fimSemana)
        .reduce((acc: number, e: any) => acc + (e.economia_horas_semana || 0), 0);

      // Projetos: contar projetos DISTINTOS do backlog com entregas nesta semana
      const projetosIds = new Set(
        entregas.filter((e: any) => {
          if (!e.prazo || !e.backlog_item_id) return false;
          const prazo = new Date(e.prazo);
          return prazo >= inicioSemana && prazo < fimSemana;
        }).map((e: any) => e.backlog_item_id)
      );
      const projetosNaSemana = projetosIds.size;
      // ROI projetado: distribuição progressiva
      let roiProjetado: number;
      if (investimento > 0) {
        const roiAlvo = (economiaTotalReais / investimento) * 100;
        roiProjetado = Math.round((roiAlvo * (semana / 12)) * 100) / 100;
      } else {
        roiProjetado = Math.round((semana / 12) * 100 * 100) / 100;
      }

      // ROI executado: baseado em economia recorrente
      const economiaRealAcumulada = horasRecorrentes * custoHora;
      let roiExecutado: number;
      if (investimento > 0) {
        roiExecutado = Math.round((economiaRealAcumulada / investimento) * 100 * 100) / 100;
      } else {
        roiExecutado = economiaTotalReais > 0
          ? Math.round((economiaRealAcumulada / economiaTotalReais) * 100 * 100) / 100
          : 0;
      }

      // Índice de maturidade progressivo
      const totalEntregas = entregas.length;
      const totalConcluidasAteAgora = entregas.filter((e: any) =>
        e.concluido_em && new Date(e.concluido_em) < fimSemana
      ).length;
      const taxaConclusao = totalEntregas > 0 ? totalConcluidasAteAgora / totalEntregas : 0;
      const indiceMaturidade = Math.round(15 + (75 * (semana / 12) * (0.5 + 0.5 * taxaConclusao)));

      // Engajamento trilhas
      const entregasEmAndamento = entregas.filter((e: any) => e.status === "em_andamento").length;
      const engajamento = totalEntregas > 0
        ? Math.round(((totalConcluidasAteAgora + entregasEmAndamento * 0.5) / totalEntregas) * 100 * (semana / 12))
        : Math.round(20 + 60 * (semana / 12));

      rows.push({
        equipe_id,
        semana,
        horas_economizadas: Math.round(horasRecorrentes * 100) / 100,
        projetos_concluidos: projetosNaSemana,
        entregas_concluidas: concluidas,
        entregas_planejadas: planejadas,
        indice_maturidade: Math.min(indiceMaturidade, 100),
        roi_projetado: roiProjetado,
        roi_executado: Math.min(roiExecutado, roiProjetado),
        engajamento_trilhas: Math.min(engajamento, 100),
      });
    }

    // Delete existing and insert new
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
