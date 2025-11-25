import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { email, password, nomeCompleto, roles, planoMentoria } = await req.json()

    console.log('Creating user:', { email, nomeCompleto, roles, planoMentoria })

    // Validar planoMentoria
    const planosValidos = ['academy', 'lab', 'skills', 'club', 'legacy', 'boost'];
    if (planoMentoria && !planosValidos.includes(planoMentoria)) {
      throw new Error(`Plano de mentoria inválido. Valores aceitos: ${planosValidos.join(', ')}`)
    }

    // 1. Criar usuário via Admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome_completo: nomeCompleto }
    })

    if (userError) throw userError
    if (!userData.user) throw new Error('Usuário não foi criado')

    const userId = userData.user.id
    console.log('User created:', userId)

    // 2. Aguardar e verificar que o profile foi criado (retry até 5x)
    let profileExists = false
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 * (i + 1))) // backoff exponencial
      
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()
      
      if (profile) {
        profileExists = true
        break
      }
    }

    if (!profileExists) {
      throw new Error('Profile não foi criado pelo trigger')
    }

    console.log('Profile confirmed')

    // 3. Atualizar profile com dados adicionais
    const updateData: any = {
      senha_temporaria: true,
      primeiro_acesso: true,
      email: email,
    }
    
    if (planoMentoria) {
      updateData.plano_mentoria = planoMentoria
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
    
    if (profileError) throw profileError
    console.log('Profile updated')

    // 4. Inserir roles (pelo menos aluno_trilha se nenhuma for passada)
    const rolesToInsert = roles && roles.length > 0 ? roles : ['aluno_trilha']
    
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .insert(rolesToInsert.map((role: string) => ({ user_id: userId, role })))

    if (rolesError) throw rolesError
    console.log('Roles inserted:', rolesToInsert)

    // 5. Verificar que as roles foram inseridas (retry até 3x)
    let rolesConfirmed = false
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
      
      const { data: insertedRoles } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
      
      if (insertedRoles && insertedRoles.length === rolesToInsert.length) {
        rolesConfirmed = true
        break
      }
    }

    if (!rolesConfirmed) {
      throw new Error('Roles não foram confirmadas no banco')
    }

    console.log('Roles confirmed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Usuário criado com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-user-admin:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
