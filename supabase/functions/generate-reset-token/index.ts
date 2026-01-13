import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Generate Reset Token function started")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email } = await req.json()

    if (!email) {
      throw new Error('Email é obrigatório')
    }

    const emailLower = email.toLowerCase().trim()
    console.log(`Generating reset token for email: ${emailLower}`)

    // Verificar se o email existe em profiles e conta está ativa
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, conta_ativa, nome_completo')
      .eq('email', emailLower)
      .single()

    if (profileError || !profile) {
      console.log('Email not found in profiles:', emailLower)
      
      // Registrar tentativa falha
      await supabaseAdmin.from('password_reset_requests').insert({
        email: emailLower,
        status: 'email_nao_encontrado',
        erro_mensagem: 'Email não encontrado no sistema'
      })
      
      throw new Error('Email não encontrado no sistema')
    }

    // Verificar se conta está ativa
    if (profile.conta_ativa === false) {
      console.log('Account is inactive:', emailLower)
      
      await supabaseAdmin.from('password_reset_requests').insert({
        email: emailLower,
        user_id: profile.id,
        status: 'conta_inativa',
        erro_mensagem: 'Conta desativada'
      })
      
      throw new Error('Esta conta está desativada. Entre em contato com o suporte.')
    }

    // Invalidar tokens anteriores não utilizados
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('email', emailLower)
      .is('used_at', null)

    // Gerar token seguro
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Salvar token
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        email: emailLower,
        user_id: profile.id,
        token: token,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('Error saving token:', tokenError)
      throw new Error('Erro ao gerar token de recuperação')
    }

    // Registrar solicitação de reset
    await supabaseAdmin.from('password_reset_requests').insert({
      email: emailLower,
      user_id: profile.id,
      status: 'token_gerado'
    })

    console.log('Token generated successfully for:', emailLower)

    return new Response(
      JSON.stringify({ 
        success: true, 
        token: token,
        email: emailLower,
        nome: profile.nome_completo
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in generate-reset-token function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
