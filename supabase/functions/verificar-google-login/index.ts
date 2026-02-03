import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Verifica se o email é do Google (@gmail.com ou @googlemail.com)
function isGoogleEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith("@gmail.com") || lowerEmail.endsWith("@googlemail.com");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ permitido: false, motivo: "email_invalido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Criar cliente Supabase com service role para bypass de RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar perfil pelo email
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, is_visitante, google_login_autorizado")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return new Response(
        JSON.stringify({ permitido: false, motivo: "erro_interno" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Caso 1: Email não encontrado na base - novo usuário deve usar formulário
    if (!profile) {
      return new Response(
        JSON.stringify({ 
          permitido: false, 
          motivo: "novo_usuario",
          mensagem: "Este email não está cadastrado. Use a aba 'Criar Conta' para se registrar com seus dados."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Caso 2: Email do Google (@gmail.com ou @googlemail.com) - pode sempre (mentorado ou visitante)
    if (isGoogleEmail(normalizedEmail)) {
      return new Response(
        JSON.stringify({ permitido: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Caso 3: Visitante com email não-Google - não pode usar Google login
    if (profile.is_visitante) {
      return new Response(
        JSON.stringify({ 
          permitido: false, 
          motivo: "visitante_email_nao_google",
          mensagem: "O login com Google está disponível apenas para emails @gmail.com. Entre com email e senha."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Caso 4: Mentorado com email não-Google - precisa autorização do admin
    if (profile.google_login_autorizado) {
      return new Response(
        JSON.stringify({ permitido: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Caso 5: Mentorado sem autorização
    return new Response(
      JSON.stringify({ 
        permitido: false, 
        motivo: "nao_autorizado",
        mensagem: "Seu email não é do Google. Solicite autorização ao administrador para usar este método de login."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na verificação:", error);
    return new Response(
      JSON.stringify({ permitido: false, motivo: "erro_interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
