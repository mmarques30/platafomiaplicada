import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar API key
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = Deno.env.get("VISITANTES_API_KEY");

  if (!apiKey || apiKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const results: Record<string, unknown> = {};

    const needVisitantes = !type || type === "visitantes";
    const needTopConteudos = !type || type === "top-conteudos";
    const needEngajamento = !type || type === "engajamento";
    const needResumo = !type || type === "resumo";

    // Buscar visitantes
    const { data: visitantes, error: vErr } = await supabase
      .from("profiles")
      .select("id, nome_completo, email, telefone, created_at, conta_ativa, cupom_especial, acesso_expira_em")
      .eq("is_visitante", true);

    if (vErr) throw vErr;

    if (needVisitantes) {
      results.visitantes = (visitantes || []).map((v: any) => ({
        nome: v.nome_completo,
        email: v.email,
        telefone: v.telefone,
        created_at: v.created_at,
        conta_ativa: v.conta_ativa,
        cupom: v.cupom_especial,
        acesso_expira_em: v.acesso_expira_em,
      }));
    }

    // Buscar logs de acesso (apenas de visitantes)
    if (needTopConteudos || needEngajamento || needResumo) {
      const visitanteEmails = new Set(
        (visitantes || []).map((v: any) => v.email).filter(Boolean)
      );

      const { data: allLogs, error: lErr } = await supabase
        .from("content_access_logs")
        .select("*")
        .order("accessed_at", { ascending: false });

      if (lErr) throw lErr;

      const logs = (allLogs || []).filter((l: any) =>
        visitanteEmails.has(l.user_email)
      );

      if (needResumo) {
        const uniqueEmails = new Set(
          logs.filter((l: any) => l.user_email !== "anônimo").map((l: any) => l.user_email)
        );
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const totalAccesses = logs.length;
        const uniqueUsers = uniqueEmails.size;
        const accessesLast7Days = logs.filter(
          (l: any) => new Date(l.accessed_at) >= sevenDaysAgo
        ).length;
        const averagePerUser =
          uniqueUsers > 0
            ? Math.round((totalAccesses / uniqueUsers) * 10) / 10
            : 0;

        results.resumo = { totalAccesses, uniqueUsers, accessesLast7Days, averagePerUser };
      }

      if (needTopConteudos) {
        const counts: Record<string, { count: number; title: string; type: string }> = {};
        logs.forEach((l: any) => {
          if (!counts[l.content_id]) {
            counts[l.content_id] = { count: 0, title: l.content_title || "Sem título", type: l.content_type };
          }
          counts[l.content_id].count++;
        });
        results.topConteudos = Object.entries(counts)
          .map(([id, d]) => ({ id, ...d }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      if (needEngajamento) {
        const stats: Record<string, any> = {};
        logs.forEach((l: any) => {
          if (l.user_email === "anônimo") return;
          if (!stats[l.user_email]) {
            stats[l.user_email] = {
              email: l.user_email,
              totalAccesses: 0,
              lastAccess: l.accessed_at,
              videoCount: 0,
              materialCount: 0,
              contentsList: [] as string[],
            };
          }
          stats[l.user_email].totalAccesses++;
          if (new Date(l.accessed_at) > new Date(stats[l.user_email].lastAccess)) {
            stats[l.user_email].lastAccess = l.accessed_at;
          }
          if (l.content_type === "video") stats[l.user_email].videoCount++;
          else stats[l.user_email].materialCount++;
          const title = l.content_title || "Sem título";
          if (!stats[l.user_email].contentsList.includes(title)) {
            stats[l.user_email].contentsList.push(title);
          }
        });
        results.engajamento = Object.values(stats).sort(
          (a: any, b: any) => b.totalAccesses - a.totalAccesses
        );
      }
    }

    // Se type específico, retorna só aquele campo
    const body = type ? results[type === "top-conteudos" ? "topConteudos" : type] : results;

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
