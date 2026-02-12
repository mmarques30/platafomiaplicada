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

    const totalProjetos = backlog.length;
    const totalEntregas = entregas.length;

    // --- METAS PADRÃO ---
    // Entregas por semana (meta uniforme)
    const entregasMetaSemana = totalEntregas > 0 ? Math.ceil(totalEntregas / 12) : 4;

    // Ordenar projetos por prioridade (alta > media > baixa), depois por economia (maior primeiro)
    const prioridadeOrdem: Record<string, number> = { alta: 0, media: 1, baixa: 2 };
    const projetosOrdenados = [...backlog].sort((a: any, b: any) => {
      const pa = prioridadeOrdem[a.prioridade || "baixa"] ?? 2;
      const pb = prioridadeOrdem[b.prioridade || "baixa"] ?? 2;
      if (pa !== pb) return pa - pb;
      return (b.horas_estimadas_economia || 0) - (a.horas_estimadas_economia || 0);
    });

    // Calcular entregas por projeto
    const entregasPorProjeto: Record<string, any[]> = {};
    for (const e of entregas) {
      const pid = e.backlog_item_id;
      if (pid) {
        if (!entregasPorProjeto[pid]) entregasPorProjeto[pid] = [];
        entregasPorProjeto[pid].push(e);
      }
    }

    // Calcular semana meta de conclusão de cada projeto
    // Com N entregas/semana, o projeto i (0-indexed) conclui quando todas as suas entregas
    // foram "consumidas" pela cadência uniforme
    let entregasAcumuladas = 0;
    const projetoMetaSemana: { projeto: any; semanaConclusao: number }[] = [];
    for (const proj of projetosOrdenados) {
      const numEntregas = (entregasPorProjeto[proj.id] || []).length || 6;
      entregasAcumuladas += numEntregas;
      const semanaConclusao = Math.min(Math.ceil(entregasAcumuladas / entregasMetaSemana), 12);
      projetoMetaSemana.push({ projeto: proj, semanaConclusao });
    }

    // Economia total de todos os projetos (para ROI alvo)
    const economiaTotalSemanal = projetosOrdenados.reduce(
      (acc: number, p: any) => acc + (p.horas_estimadas_economia || 0), 0
    );

    const rows = [];

    for (let semana = 1; semana <= 12; semana++) {
      const inicioSemana = addWeeks(dataInicio, semana - 1);
      const fimSemana = addWeeks(dataInicio, semana);

      // --- META: Entregas planejadas (fixo por semana) ---
      const metaEntregas = entregasMetaSemana;

      // --- META: Projetos concluídos acumulados até esta semana ---
      const metaProjetosAcum = projetoMetaSemana.filter(p => p.semanaConclusao <= semana).length;

      // --- META: Horas economizadas (acumulativa dos projetos "concluídos" pela meta) ---
      const metaHoras = projetoMetaSemana
        .filter(p => p.semanaConclusao <= semana)
        .reduce((acc, p) => acc + (p.projeto.horas_estimadas_economia || 0), 0);

      // --- META: ROI projetado (progressão linear) ---
      let roiProjetado: number;
      if (investimento > 0) {
        const roiAlvo = (economiaTotalSemanal * custoHora * 52) / investimento * 100; // anualizado
        roiProjetado = Math.round((roiAlvo * (semana / 12)) * 100) / 100;
      } else {
        roiProjetado = Math.round((semana / 12) * 100 * 100) / 100;
      }

      // --- EXECUÇÃO REAL ---

      // Entregas concluídas NESTA semana
      const concluidasNaSemana = entregas.filter((e: any) => {
        if (!e.concluido_em) return false;
        const concluido = new Date(e.concluido_em);
        return concluido >= inicioSemana && concluido < fimSemana;
      });
      const realConcluidas = concluidasNaSemana.length;

      // Total de entregas concluídas ATÉ esta semana (acumulado para ROI)
      const totalConcluidasAteAgora = entregas.filter((e: any) =>
        e.concluido_em && new Date(e.concluido_em) < fimSemana
      ).length;

      // Horas economizadas REAIS (recorrente: soma de economia de entregas concluídas até agora)
      const horasReaisRecorrentes = entregas
        .filter((e: any) => e.concluido_em && new Date(e.concluido_em) < fimSemana)
        .reduce((acc: number, e: any) => acc + (e.economia_horas_semana || 0), 0);

      // Projetos REAIS concluídos: projetos cujas TODAS as entregas estão concluídas até esta semana
      let projetosReaisConcluidos = 0;
      for (const proj of projetosOrdenados) {
        const entregasDoProjeto = entregasPorProjeto[proj.id] || [];
        if (entregasDoProjeto.length === 0) continue;
        const todasConcluidas = entregasDoProjeto.every((e: any) =>
          e.concluido_em && new Date(e.concluido_em) < fimSemana
        );
        if (todasConcluidas) projetosReaisConcluidos++;
      }

      // ROI executado: baseado na economia real recorrente
      const economiaRealReais = horasReaisRecorrentes * custoHora;
      let roiExecutado: number;
      if (investimento > 0) {
        roiExecutado = Math.round((economiaRealReais * 52 / investimento) * 100 * 100) / 100;
      } else {
        const economiaTotalReais = economiaTotalSemanal * custoHora;
        roiExecutado = economiaTotalReais > 0
          ? Math.round((economiaRealReais / economiaTotalReais) * 100 * 100) / 100
          : 0;
      }

      // Índice de maturidade: meta linear 20→90%, ajustado pela taxa de conclusão
      const taxaConclusao = totalEntregas > 0 ? totalConcluidasAteAgora / totalEntregas : 0;
      const metaMaturidade = 20 + (70 * (semana / 12));
      const indiceMaturidade = Math.round(metaMaturidade * (0.3 + 0.7 * Math.min(taxaConclusao / (semana / 12 || 0.01), 1)));

      // Engajamento: baseado em entregas em andamento + concluídas vs total
      const entregasEmAndamento = entregas.filter((e: any) => e.status === "em_andamento").length;
      const engajamento = totalEntregas > 0
        ? Math.round(((totalConcluidasAteAgora + entregasEmAndamento * 0.5) / totalEntregas) * 100)
        : Math.round(20 + 60 * (semana / 12));

      rows.push({
        equipe_id,
        semana,
        horas_economizadas: Math.round(metaHoras * 100) / 100,
        projetos_concluidos: metaProjetosAcum,
        entregas_concluidas: realConcluidas,
        entregas_planejadas: metaEntregas,
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

    console.log(`Métricas geradas: ${rows.length} semanas, ${totalEntregas} entregas, ${totalProjetos} projetos`);
    console.log(`Meta: ${entregasMetaSemana} entregas/semana, ${projetoMetaSemana.length} projetos distribuídos`);

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
