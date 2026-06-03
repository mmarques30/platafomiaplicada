import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const OFFER_ID_ACADEMY = "58de246e-e1c2-4257-a04e-2b3e1bf34d40";
const DEFAULT_PASSWORD = "aplica2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // 1. Log de auditoria (secret removido - Lia nao envia headers de auth)
    console.log("Webhook recebido de:", req.headers.get("x-forwarded-for") || "IP desconhecido");

    // 2. Parsear o payload do webhook
    const payload = await req.json();
    console.log("Webhook Lia recebido:", JSON.stringify(payload).substring(0, 500));

    // 3. Extrair dados do evento
    // A Lia envia: { event, entity, api_version, data: { ... } }
    const eventType = payload.event || payload.type || payload.event_type || "unknown";
    const entityType = payload.entity || payload.entity_type || "unknown";
    const data = payload.data || payload;

    // 4. Extrair informacoes do cliente
    // A Lia pode enviar o contato em diferentes formatos
    const contact = data.contact || data.customer || data.client || {};
    const customerEmail = (
      contact.email ||
      data.email ||
      data.customer_email ||
      payload.email ||
      ""
    ).toLowerCase().trim();

    const customerName = (
      contact.name ||
      contact.nome ||
      data.name ||
      data.customer_name ||
      data.nome ||
      payload.name ||
      ""
    ).trim();

    const customerPhone = (
      contact.phone ||
      contact.telefone ||
      data.phone ||
      ""
    ).trim();

    // 5. Extrair informacoes da oferta/produto
    const offer = data.offer || data.oferta || {};
    const product = offer.product || data.product || {};
    const offerId = offer.id || data.offer_id || "";
    const offerName = offer.name || offer.nome || product.name || product.nome || "";
    const billId = data.id || data.bill_id || "";

    // 6. Registrar o evento no log (sempre, independente do resultado)
    const logEntry = {
      event_type: eventType,
      entity_type: entityType,
      payload: payload,
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      offer_id: offerId || null,
      offer_name: offerName || null,
      bill_id: billId || null,
      status: "received",
    };

    const { data: logData, error: logError } = await supabaseAdmin
      .from("webhook_lia_logs")
      .insert(logEntry)
      .select("id")
      .single();

    if (logError) {
      console.error("Erro ao registrar log do webhook:", logError);
    }

    const logId = logData?.id;

    // 7. Verificar se e um evento de pagamento confirmado
    const isPaid = eventType === "paid"
      || eventType === "bill.paid"
      || eventType === "payment.confirmed"
      || eventType === "order.paid"
      || (eventType === "bill" && data.status === "paid")
      || data.status === "paid";

    if (!isPaid) {
      console.log(`Evento '${eventType}' nao e de pagamento confirmado. Ignorando criacao de usuario.`);

      if (logId) {
        await supabaseAdmin
          .from("webhook_lia_logs")
          .update({ status: "ignored_not_paid" })
          .eq("id", logId);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Evento registrado mas nao requer criacao de usuario" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Validar email do cliente
    if (!customerEmail || !customerEmail.includes("@")) {
      const errorMsg = "Email do cliente nao encontrado no payload do webhook";
      console.error(errorMsg, { payload: JSON.stringify(payload).substring(0, 300) });

      if (logId) {
        await supabaseAdmin
          .from("webhook_lia_logs")
          .update({ status: "error", error_message: errorMsg })
          .eq("id", logId);
      }

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Criar usuario ou atualizar existente
    let userId: string;
    let isExistingUser = false;
    let userAction = "";

    // Tentar criar novo usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: customerEmail,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        nome_completo: customerName || customerEmail.split("@")[0],
        telefone: customerPhone,
        origem: "lia_checkout",
        offer_id: offerId,
      },
    });

    if (userError) {
      // Usuario ja existe - atualizar
      if (
        (userError as any).code === "email_exists" ||
        userError.message?.includes("already been registered")
      ) {
        console.log("Email ja existe, buscando usuario existente:", customerEmail);

        // Buscar direto na tabela profiles pelo email (evita limite de 1000 do listUsers)
        const { data: profileData, error: profileSearchError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();

        let existingUser: { id: string } | null = null;

        if (profileSearchError || !profileData) {
          // Fallback: tenta listUsers para casos raros
          console.log("Profile nao encontrado por email, tentando listUsers como fallback");
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const foundUser = listData?.users.find(u => u.email?.toLowerCase() === customerEmail);
          if (!foundUser) {
            throw new Error("Email reportado como existente mas usuario nao encontrado no auth nem em profiles");
          }
          existingUser = { id: foundUser.id };
        } else {
          existingUser = { id: profileData.id };
        }

        if (!existingUser) {
          throw new Error("Email reportado como existente mas usuario nao encontrado");
        }

        userId = existingUser.id;
        isExistingUser = true;
        userAction = "existing_user_updated";

        // Verificar se ja tem plano academy ativo
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("plano_mentoria, is_visitante")
          .eq("id", userId)
          .single();

        if (existingProfile?.plano_mentoria === "academy" && !existingProfile?.is_visitante) {
          console.log("Usuario ja tem plano academy ativo:", userId);
          userAction = "already_has_academy";

          if (logId) {
            await supabaseAdmin
              .from("webhook_lia_logs")
              .update({
                status: "skipped_already_active",
                user_created_id: userId,
                error_message: "Usuario ja possui plano academy ativo",
              })
              .eq("id", logId);
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "Usuario ja possui acesso academy",
              userId,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Resetar senha para padrao (facilitar primeiro acesso)
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: DEFAULT_PASSWORD,
        });

        console.log("Usuario existente encontrado e senha resetada:", userId);
      } else {
        throw userError;
      }
    } else {
      if (!userData.user) throw new Error("Usuario nao foi criado");
      userId = userData.user.id;
      userAction = "new_user_created";
      console.log("Novo usuario criado via webhook Lia:", userId);
    }

    // 10. Aguardar profile ser criado pelo trigger (para novos usuarios)
    if (!isExistingUser) {
      let profileExists = false;
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();
        if (profile) {
          profileExists = true;
          break;
        }
      }
      if (!profileExists) {
        throw new Error("Profile nao foi criado pelo trigger");
      }
    }

    // 11. Atualizar profile com dados do plano Academy
    const profileUpdate: Record<string, unknown> = {
      plano_mentoria: "academy",
      email: customerEmail,
      senha_temporaria: true,
      primeiro_acesso: true,
    };

    if (customerName) {
      profileUpdate.nome_completo = customerName;
    }

    if (customerPhone) {
      profileUpdate.telefone = customerPhone;
    }

    // Se era visitante, promover
    if (isExistingUser) {
      profileUpdate.is_visitante = false;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profileError) {
      console.error("Erro ao atualizar profile:", profileError);
      throw profileError;
    }
    console.log("Profile atualizado com plano academy");

    // 12. Gerenciar roles
    if (isExistingUser) {
      // Remover role visitante se tiver
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "visitante");
    }

    // Verificar se ja tem a role aluno_trilha
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "aluno_trilha")
      .single();

    if (!existingRole) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "aluno_trilha" });

      if (roleError) {
        console.error("Erro ao inserir role:", roleError);
        throw roleError;
      }
      console.log("Role aluno_trilha atribuida");
    } else {
      console.log("Role aluno_trilha ja existia");
    }

    // 13. Enviar dados para o Zapier (email de boas-vindas)
    const zapierWebhookUrl = Deno.env.get("ZAPIER_WEBHOOK_URL");
    let emailStatus: "sent" | "skipped_already_active" | "skipped_no_zapier_url" | "failed" = "sent";
    let emailError: string | null = null;

    if (userAction === "already_has_academy") {
      emailStatus = "skipped_already_active";
      console.log("Email NÃO enviado: usuário já tem academy ativo");
    } else if (!zapierWebhookUrl) {
      emailStatus = "skipped_no_zapier_url";
      console.error("Email NÃO enviado: env ZAPIER_WEBHOOK_URL não configurada");
    } else {
      try {
        const resp = await fetch(zapierWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customerEmail,
            nome: customerName || customerEmail.split("@")[0],
            senha: DEFAULT_PASSWORD,
            plano: "Academy",
            telefone: customerPhone,
            offer_name: offerName,
            plataforma_url: "https://plataforma.iaplicada.com",
            acao: userAction,
          }),
        });
        if (!resp.ok) {
          emailStatus = "failed";
          emailError = `Zapier respondeu HTTP ${resp.status}: ${await resp.text().catch(() => "")}`.slice(0, 500);
          console.error("Zapier retornou erro:", emailError);
        } else {
          console.log("Dados enviados para Zapier com sucesso (HTTP", resp.status, ")");
        }
      } catch (zapierError) {
        emailStatus = "failed";
        emailError = zapierError instanceof Error ? zapierError.message : String(zapierError);
        console.error("Erro ao enviar para Zapier (nao-bloqueante):", emailError);
      }
    }

    // 14. Atualizar log com sucesso (inclui status do email pra diagnóstico)
    if (logId) {
      await supabaseAdmin
        .from("webhook_lia_logs")
        .update({
          status: "processed",
          user_created_id: userId,
          error_message: emailError ? `[email:${emailStatus}] ${emailError}` : `[email:${emailStatus}]`,
        })
        .eq("id", logId);
    }

    console.log(`Webhook Lia processado: user=${userAction} email=${emailStatus} email=${customerEmail} id=${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Usuario ${isExistingUser ? "atualizado" : "criado"} com acesso Academy`,
        userId,
        action: userAction,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro no webhook Lia:", errorMessage);

    // Tentar atualizar o log de erro
    try {
      const payload = await req.clone().json().catch(() => null);
      if (payload) {
        await supabaseAdmin
          .from("webhook_lia_logs")
          .update({ status: "error", error_message: errorMessage })
          .eq("payload", payload)
          .eq("status", "received");
      }
    } catch (_) {
      // Ignore log update errors
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
