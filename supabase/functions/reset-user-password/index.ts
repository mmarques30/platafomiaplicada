import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Reset User Password function started")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Verificar usuário autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é admin
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    if (rolesError || !roles || roles.length === 0) {
      console.error('Acesso negado - usuário não é admin:', user.id)
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem resetar senhas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      throw new Error('userId e newPassword são obrigatórios')
    }

    console.log(`Admin ${user.id} resetting password for user: ${userId}`)

    // Resetar senha usando Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      console.error('Error resetting password:', error)
      throw error
    }

    console.log('Password reset successfully by admin:', user.id)

    return new Response(
      JSON.stringify({ success: true, message: 'Senha resetada com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in reset-user-password function:', error)
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
