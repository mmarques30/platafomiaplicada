import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { getCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    // 1. Buscar visitantes ativos com data de expiração
    const { data: visitantes, error: visitantesError } = await supabase
      .from("profiles")
      .select("id, email, created_at, acesso_expira_em, cupom_especial")
      .eq("is_visitante", true)
      .eq("conta_ativa", true)
      .eq("acesso_expirado", false)
      .not("acesso_expira_em", "is", null);

    if (visitantesError) {
      throw new Error(`Erro ao buscar visitantes: ${visitantesError.message}`);
    }

    const results: Record<string, number> = {
      expirados: 0,
      notificacoes_7_dias: 0,
      notificacoes_3_dias: 0,
      notificacoes_1_dia: 0,
      cupons_atualizados: 0,
      convertidos_automatico: 0,
    };

    for (const visitante of visitantes || []) {
      const expiracaoDate = new Date(visitante.acesso_expira_em);
      
      // VERIFICAÇÃO DE DUPLICIDADE: Checar se já é mentorado por outro registro
      const { data: jaMentorado } = await supabase
        .from("profiles")
        .select("id, plano_mentoria")
        .ilike("email", visitante.email)
        .eq("is_visitante", false)
        .eq("conta_ativa", true)
        .neq("id", visitante.id)
        .maybeSingle();
      
      if (jaMentorado) {
        // Converter visitante automaticamente (já é mentorado por outra conta)
        await supabase
          .from("profiles")
          .update({ 
            is_visitante: false,
            data_conversao: new Date().toISOString(),
            acesso_expirado: false
          })
          .eq("id", visitante.id);
        
        // Atualizar role
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", visitante.id)
          .eq("role", "visitante");
        
        await supabase
          .from("user_roles")
          .upsert({ 
            user_id: visitante.id, 
            role: "mentorado" 
          });
        
        results.convertidos_automatico = (results.convertidos_automatico || 0) + 1;
        continue; // Não processar expiração
      }
      
      // Verificar se já expirou
      if (expiracaoDate <= now) {
        // Marcar como expirado e desativar conta
        await supabase
          .from("profiles")
          .update({ 
            acesso_expirado: true,
            conta_ativa: false 
          })
          .eq("id", visitante.id);
        
        results.expirados++;
        continue;
      }

      // Verificar engajamento e atualizar cupom se necessário
      const { data: isEngaged } = await supabase
        .rpc("check_visitor_engagement", { visitor_id: visitante.id });
      
      if (isEngaged && visitante.cupom_especial !== "Academy15") {
        await supabase
          .from("profiles")
          .update({ cupom_especial: "Academy15" })
          .eq("id", visitante.id);
        results.cupons_atualizados++;
      }

      // Criar notificações baseadas no tempo restante
      const noticeTypes: { type: string; threshold: Date }[] = [
        { type: "7_dias", threshold: sevenDaysFromNow },
        { type: "3_dias", threshold: threeDaysFromNow },
        { type: "1_dia", threshold: oneDayFromNow },
      ];

      for (const notice of noticeTypes) {
        if (expiracaoDate <= notice.threshold) {
          // Verificar se já existe essa notificação
          const { data: existingNotice } = await supabase
            .from("visitor_expiration_notices")
            .select("id")
            .eq("user_id", visitante.id)
            .eq("notice_type", notice.type)
            .single();

          if (!existingNotice) {
            // Usar service role para inserir (bypass RLS)
            await supabase
              .from("visitor_expiration_notices")
              .insert({
                user_id: visitante.id,
                notice_type: notice.type,
              });
            
            // Também criar uma notificação no sistema padrão
            await supabase
              .from("notificacoes")
              .insert({
                user_id: visitante.id,
                tipo: "info",
                titulo: notice.type === "1_dia" 
                  ? "Último dia de acesso gratuito" 
                  : notice.type === "3_dias"
                  ? "Restam 3 dias de acesso gratuito"
                  : "Seu acesso gratuito expira em 7 dias",
                mensagem: `Garanta ${isEngaged ? "15%" : "12%"} de desconto no Academy com o cupom ${isEngaged ? "Academy15" : "Academy12"}. Aproveite essa oportunidade exclusiva!`,
                link: "/cupons",
              });

            if (notice.type === "7_dias") results.notificacoes_7_dias++;
            if (notice.type === "3_dias") results.notificacoes_3_dias++;
            if (notice.type === "1_dia") results.notificacoes_1_dia++;
          }
          break; // Só criar a notificação mais urgente
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Processamento concluído",
        results,
        processedAt: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro no processamento:", errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
