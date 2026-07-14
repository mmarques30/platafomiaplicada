// E-mail de boas-vindas compartilhado entre os fluxos de criação de usuário:
//  - create-user-admin (cadastro manual pelo admin)
//  - webhook-lia-compra (automação de pagamento / Academy)
//
// Gera um HTML enxuto e alinhado à marca (fundo off-white, logo no topo,
// credenciais em um painel escuro) e envia via n8n (N8N_WEBHOOK_URL_WELCOME).

const BRAND = {
  green: "#7C8B2A",
  greenBright: "#AFC040",
  ink: "#1a1c19",
  body: "#3d4038",
  pageBg: "#EFEDE4", // off-white / creme da marca
  panel: "#16180F", // painel escuro para as credenciais
  panelText: "#F3F2E9",
  panelMuted: "#9fa392",
  muted: "#6b6f66",
  hairline: "#dcd9cc",
};

export function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Copy específico por produto — Academy, Builder e System são produtos
// diferentes e merecem uma mensagem própria. Enxuto de propósito.
interface VariantCopy {
  intro: string;
  cta: string;
  dica: string;
}

const VARIANT_COPY: Record<string, VariantCopy> = {
  academy: {
    intro: "Seu acesso ao <strong>IAplicada Academy</strong> está pronto. Bora aplicar IA na sua rotina.",
    cta: "Acessar o Academy",
    dica: 'Comece pela primeira trilha em "Aprender".',
  },
  business_parceria: {
    intro: "Seu acesso ao <strong>IAplicada Builder</strong> está pronto. Sua mentoria começa agora.",
    cta: "Acessar o Builder",
    dica: 'Faça seu Diagnóstico e veja seu roadmap em "Mentoria".',
  },
  business_sistemas: {
    intro: "Seu acesso ao <strong>IAplicada System</strong> está pronto. A IAplicada constrói e você acompanha.",
    cta: "Acessar o System",
    dica: 'Acompanhe o andamento do projeto em "Meu Projeto".',
  },
};

const DEFAULT_COPY: VariantCopy = {
  intro: "Seu acesso à <strong>plataforma IAplicada</strong> está pronto.",
  cta: "Acessar a plataforma",
  dica: 'Escolha seu ambiente e comece por "Início".',
};

export function buildWelcomeEmailHtml(params: {
  nome: string;
  email: string;
  senha: string;
  plano: string;
  planoLabel: string;
  plataformaUrl: string;
  logoUrl?: string | null;
}): string {
  const primeiroNome = escapeHtml((params.nome || "").trim().split(" ")[0] || "boas-vindas");
  const email = escapeHtml(params.email);
  const senha = escapeHtml(params.senha);
  const baseUrl = params.plataformaUrl.replace(/\/$/, "");
  const url = escapeHtml(baseUrl);
  const copy = VARIANT_COPY[params.plano] ?? DEFAULT_COPY;

  // Logo do kit (versão escura/colorida, boa sobre o fundo off-white).
  const logoSrc = params.logoUrl || `${baseUrl}/logo-marca-completa.png`;

  // Academy: reforçar a leitura das políticas (disponíveis em Configurações).
  const policyHtml =
    params.plano === "academy"
      ? `<tr><td style="padding:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                Antes de começar, vale ler a
                <a href="${escapeHtml(baseUrl)}/politica-servicos" target="_blank" style="color:${BRAND.green};font-weight:600;text-decoration:underline;">Política de Serviços</a>
                (também em Configurações).
              </p>
            </td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<title>Bem-vindo(a) à IAplicada</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageBg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Seu acesso à plataforma IAplicada está pronto. Entre com seu e-mail e senha temporária.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.pageBg};padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Logo -->
        <tr>
          <td style="padding:0 0 28px 0;">
            <img src="${escapeHtml(logoSrc)}" alt="IAplicada" height="30" style="height:30px;display:block;border:0;" />
          </td>
        </tr>
        <!-- Saudação + intro -->
        <tr>
          <td style="font-family:Georgia,'Times New Roman',serif;">
            <h1 style="margin:0 0 10px 0;font-size:28px;line-height:1.15;color:${BRAND.ink};font-weight:400;">Olá, ${primeiroNome}!</h1>
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:0 0 24px 0;">
            <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.body};">${copy.intro}</p>
          </td>
        </tr>
        <!-- Painel escuro com as credenciais -->
        <tr>
          <td style="padding:0 0 24px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.panel};border-radius:14px;">
              <tr><td style="padding:22px 24px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 14px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.panelMuted};">Seus dados de acesso</p>
                <p style="margin:0 0 12px 0;font-size:12px;color:${BRAND.panelMuted};">E-mail</p>
                <p style="margin:-8px 0 16px 0;font-size:16px;color:${BRAND.panelText};font-weight:600;">${email}</p>
                <p style="margin:0 0 2px 0;font-size:12px;color:${BRAND.panelMuted};">Senha temporária</p>
                <p style="margin:0;font-size:18px;color:${BRAND.greenBright};font-weight:700;font-family:'Courier New',monospace;letter-spacing:1px;">${senha}</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:0 0 14px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background-color:${BRAND.green};">
              <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${copy.cta}</a>
            </td></tr></table>
          </td>
        </tr>
        <!-- Dica + primeiro acesso -->
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:0 0 6px 0;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.body};">
              No primeiro acesso, troque a senha temporária por uma senha pessoal. ${copy.dica}
            </p>
          </td>
        </tr>
        ${policyHtml}
        <!-- Rodapé -->
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;padding:24px 0 0 0;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};border-top:1px solid ${BRAND.hairline};padding-top:18px;">
              Precisa de ajuda? É só responder este e-mail.
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
// (N8N_WEBHOOK_URL_WELCOME). Sem webhook configurado, apenas registra (sem
// fallback para Zapier — por decisão de produto).
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
    plano: opts.plano,
    planoLabel: opts.planoLabel,
    plataformaUrl,
    logoUrl,
  });
  const subject = `Bem-vindo(a) à IAplicada! Seu acesso ${opts.planoLabel}`;

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
