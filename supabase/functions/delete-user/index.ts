import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

console.log("Delete User function started")

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Não autorizado')
    }

    // Validar se quem está fazendo a requisição é admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !requestingUser) {
      throw new Error('Usuário não autenticado')
    }

    const { data: requestingUserRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)

    if (rolesError || !requestingUserRoles?.some(r => r.role === 'admin')) {
      throw new Error('Apenas administradores podem deletar usuários')
    }

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('userId é obrigatório')
    }

    // Validar se não está tentando deletar a si mesmo
    if (userId === requestingUser.id) {
      throw new Error('Você não pode deletar sua própria conta')
    }

    // Validar se não está deletando o último admin
    const { data: allAdmins } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (allAdmins && allAdmins.length === 1 && allAdmins[0].user_id === userId) {
      throw new Error('Não é possível deletar o último administrador do sistema')
    }

    console.log(`Deletando usuário: ${userId}`)

    // Deletar usuário do Auth (automaticamente deleta profile e roles via CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Erro ao deletar usuário:', deleteError)
      throw deleteError
    }

    console.log('Usuário deletado com sucesso')

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário deletado com sucesso' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro na função delete-user:', error)
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
