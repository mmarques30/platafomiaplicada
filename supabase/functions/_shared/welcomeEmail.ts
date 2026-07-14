// E-mail de boas-vindas compartilhado entre os fluxos de criação de usuário:
//  - create-user-admin (cadastro manual pelo admin)
//  - webhook-lia-compra (automação de pagamento / Academy)
//
// Gera um HTML bonito com a identidade da IAplicada e faz o envio via n8n
// (N8N_WEBHOOK_URL_WELCOME). Enquanto o n8n não estiver configurado, cai de
// volta no Zapier para não interromper os envios durante a migração.

const BRAND = {
  green: "#7C8B2A",
  ink: "#1a1c19",
  cream: "#F6F5EF",
  creamSoft: "#FBFAF5",
  muted: "#6b6f66",
  hairline: "#e6e4da",
};

export function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildWelcomeEmailHtml(params: {
  nome: string;
  email: string;
  senha: string;
  planoLabel: string;
  plataformaUrl: string;
  logoUrl?: string | null;
}): string {
  const primeiroNome = escapeHtml((params.nome || "").trim().split(" ")[0] || "boas-vindas");
  const email = escapeHtml(params.email);
  const senha = escapeHtml(params.senha);
  const planoLabel = escapeHtml(params.planoLabel);
  const url = escapeHtml(params.plataformaUrl);
  const logo = params.logoUrl
    ? `<img src="${escapeHtml(params.logoUrl)}" alt="IAplicada" height="28" style="height:28px;display:block;border:0;" />`
    : `<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">IAplicada</span>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<title>Bem-vindo(a) à IAplicada</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Seu acesso à plataforma IAplicada está pronto — entre com seu e-mail e senha temporária.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream};padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid ${BRAND.hairline};border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background-color:${BRAND.green};padding:22px 32px;">
            ${logo}
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <h1 style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;color:${BRAND.ink};font-weight:400;">Olá, ${primeiroNome}!</h1>
            <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">
              Seu acesso à plataforma <strong style="color:${BRAND.ink};">IAplicada</strong> está pronto.
              Plano: <strong style="color:${BRAND.green};">${planoLabel}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.creamSoft};border:1px solid ${BRAND.hairline};border-radius:12px;">
              <tr><td style="padding:18px 20px;">
                <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};">Seus dados de acesso</p>
                <p style="margin:0 0 10px 0;font-size:15px;color:${BRAND.ink};"><strong>E-mail:</strong> ${email}</p>
                <p style="margin:0;font-size:15px;color:${BRAND.ink};"><strong>Senha temporária:</strong> <span style="font-family:'Courier New',monospace;background:#fff;border:1px solid ${BRAND.hairline};border-radius:6px;padding:2px 8px;">${senha}</span></p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 4px 32px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:999px;background-color:${BRAND.green};">
                <a href="${url}" target="_blank" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">Acessar a plataforma</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">Primeiros passos:</p>
            <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.7;color:${BRAND.ink};">
              <li>Acesse com o e-mail e a senha temporária acima.</li>
              <li>Troque a senha temporária por uma senha pessoal.</li>
              <li>Escolha seu ambiente e comece por "Início".</li>
            </ol>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};border-top:1px solid ${BRAND.hairline};padding-top:16px;">
              Precisa de ajuda? É só responder este e-mail.<br />
              <span style="color:#a2a69b;">IAplicada — Inteligência aplicada ao seu dia a dia.</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export interface WelcomeEmailResult {
  status: "sent" | "skipped_no_webhook" | "failed";
  via: "n8n" | null;
  error?: string;
}

// Constrói o HTML e envia o e-mail de boas-vindas exclusivamente via n8n
// (N8N_WEBHOOK_URL_WELCOME). Se o webhook não estiver configurado, apenas
// registra e não envia (sem fallback para Zapier — por decisão de produto).
export async function sendWelcomeEmail(opts: {
  email: string;
  nome: string;
  senha: string;
  plano: string; // ex.: academy | business_parceria | business_sistemas
  planoLabel: string; // ex.: Academy | Builder | System
  acao: string; // new_user_created | existing_user_updated
}): Promise<WelcomeEmailResult> {
  const plataformaUrl = Deno.env.get("PLATAFORMA_URL") || "https://plataforma.iaplicada.com";
  const logoUrl = Deno.env.get("WELCOME_EMAIL_LOGO_URL") || null;

  const html = buildWelcomeEmailHtml({
    nome: opts.nome,
    email: opts.email,
    senha: opts.senha,
    planoLabel: opts.planoLabel,
    plataformaUrl,
    logoUrl,
  });
  const subject = `Bem-vindo(a) à IAplicada — acesso ${opts.planoLabel}`;

  const payload = {
    event: "welcome_email",
    acao: opts.acao,
    email: opts.email,
    nome: opts.nome,
    senha: opts.senha,
    plano: opts.plano,
    plano_label: opts.planoLabel,
    plataforma_url: plataformaUrl,
    subject,
    html,
  };

  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL_WELCOME");
  if (!n8nUrl) {
    console.warn("Webhook de boas-vindas do n8n não configurado (N8N_WEBHOOK_URL_WELCOME). E-mail não enviado.");
    return { status: "skipped_no_webhook", via: null };
  }

  try {
    const resp = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const error = `n8n respondeu HTTP ${resp.status}: ${await resp.text().catch(() => "")}`.slice(0, 500);
      console.error("Erro ao enviar boas-vindas:", error);
      return { status: "failed", via: "n8n", error };
    }
    console.log(`Boas-vindas enviadas via n8n (${opts.plano})`);
    return { status: "sent", via: "n8n" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("Erro ao enviar boas-vindas (nao-bloqueante):", error);
    return { status: "failed", via: "n8n", error };
  }
}
