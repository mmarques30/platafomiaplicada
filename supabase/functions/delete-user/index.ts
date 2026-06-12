import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

console.log("Delete User function started")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // PRE-CLEANUP: deletar registros das tabelas conhecidas que referenciam
    // o user_id antes de tentar o auth.deleteUser. Algumas tabelas não têm
    // ON DELETE CASCADE configurado, e o auth.admin.deleteUser falha quando
    // qualquer FK constraint bloqueia (a mensagem do Supabase é genérica e
    // não diz qual tabela, o que tornava o erro impossível de diagnosticar).
    const cleanupTables: string[] = [
      "objetivos_mentoria",
      "projetos_mentoria",
      "formulario_diagnostico",
      "tarefas_mentoria",
      "mentoria_sessoes",
      "contratos_business",
      "candidaturas_mentoria",
      "membros_equipe_skills",
      "diagnostico_skills",
      "tasks_business",
      "notas_projeto_business",
      "links_business",
      "documentos_business",
      "user_onboarding_responses",
      "signup_attempts",
      "community_reactions",
      "community_posts",
      "community_comments",
      "progresso_videos",
      "favoritos",
    ];

    for (const table of cleanupTables) {
      const { error: cleanupErr } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (cleanupErr) {
        // Não-bloqueante: log só. Tabela pode não existir nesse projeto
        // específico ou não ter user_id (silenciamos pra não bloquear).
        console.warn(`[cleanup ${table}]`, cleanupErr.message);
      }
    }

    // Deletar usuário do Auth (profile/roles via CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      // Retorna detalhes específicos do erro pra admin saber o que bloqueou
      console.error('Erro ao deletar usuário:', deleteError)
      const detail =
        (deleteError as any).message ??
        (deleteError as any).code ??
        JSON.stringify(deleteError);
      throw new Error(`Auth delete falhou: ${detail}`);
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
