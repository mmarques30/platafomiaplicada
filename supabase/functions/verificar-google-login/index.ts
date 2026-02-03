import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return new Response(
        JSON.stringify({ permitido: false, motivo: "erro_interno" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regra simplificada: se o email está cadastrado, permite Google Login
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

    // Email cadastrado - permite Google Login independente do domínio
    return new Response(
      JSON.stringify({ permitido: true }),
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
