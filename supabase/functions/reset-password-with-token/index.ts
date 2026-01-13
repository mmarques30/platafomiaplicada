import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Reset Password With Token function started")

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

    const { token, email, novaSenha } = await req.json()

    if (!token || !email || !novaSenha) {
      throw new Error('Token, email e nova senha são obrigatórios')
    }

    const emailLower = email.toLowerCase().trim()
    console.log(`Resetting password with token for email: ${emailLower}`)

    // Buscar e validar token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', emailLower)
      .is('used_at', null)
      .single()

    if (tokenError || !tokenData) {
      console.log('Token not found or already used:', token)
      throw new Error('Token inválido ou já utilizado')
    }

    // Verificar se token expirou
    const expiresAt = new Date(tokenData.expires_at)
    if (expiresAt < new Date()) {
      console.log('Token expired:', token)
      
      // Marcar token como usado
      await supabaseAdmin
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id)
      
      throw new Error('Token expirado. Solicite uma nova recuperação de senha.')
    }

    // Validar senha
    if (novaSenha.length < 8) {
      throw new Error('A senha deve ter no mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(novaSenha)) {
      throw new Error('A senha deve conter pelo menos uma letra maiúscula')
    }
    if (!/[0-9]/.test(novaSenha)) {
      throw new Error('A senha deve conter pelo menos um número')
    }

    // Atualizar senha via Admin API
    const { data: userData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password: novaSenha }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error('Erro ao atualizar senha')
    }

    // Marcar token como usado
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)

    // Atualizar profiles
    await supabaseAdmin
      .from('profiles')
      .update({ 
        senha_temporaria: false,
        senha_alterada_em: new Date().toISOString()
      })
      .eq('id', tokenData.user_id)

    // Atualizar password_reset_requests
    await supabaseAdmin
      .from('password_reset_requests')
      .update({ 
        status: 'senha_alterada',
        completed_at: new Date().toISOString()
      })
      .eq('email', emailLower)
      .eq('status', 'token_gerado')
      .order('created_at', { ascending: false })
      .limit(1)

    // Registrar na auditoria
    await supabaseAdmin.from('auditoria_conteudo').insert({
      tabela: 'profiles',
      operacao: 'PASSWORD_RECOVERY',
      registro_id: tokenData.user_id,
      user_id: tokenData.user_id,
      dados_anteriores: { email: emailLower },
      dados_novos: { 
        senha_alterada: true, 
        metodo: 'recuperacao_direta',
        data: new Date().toISOString()
      },
      campos_alterados: ['password', 'senha_temporaria', 'senha_alterada_em']
    })

    console.log('Password reset successfully for:', emailLower)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha alterada com sucesso!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in reset-password-with-token function:', error)
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
