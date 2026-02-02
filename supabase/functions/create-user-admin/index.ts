import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
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
      { auth: { autoRefreshToken: false, persistSession: false } }
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
        JSON.stringify({ error: 'Apenas administradores podem criar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      email, 
      password, 
      nomeCompleto, 
      roles: userRoles, 
      planoMentoria, 
      origemConsultoria, 
      empresaConsultoria, 
      skillsLiberado,
      // New Skills team fields
      equipeId,
      novaEquipe,
      papelEquipe
    } = await req.json()

    console.log(`Admin ${user.id} creating user:`, { email, nomeCompleto, roles: userRoles, planoMentoria, origemConsultoria, empresaConsultoria, skillsLiberado, equipeId, novaEquipe, papelEquipe })

    // Validar planoMentoria
    const planosValidos = ['academy', 'skills', 'business'];
    if (planoMentoria && !planosValidos.includes(planoMentoria)) {
      throw new Error(`Plano de mentoria inválido. Valores aceitos: ${planosValidos.join(', ')}`)
    }

    // Validate Skills requires team
    if (planoMentoria === 'skills' && !equipeId && !novaEquipe) {
      throw new Error('Para o plano Skills, é obrigatório informar uma equipe existente ou criar uma nova.')
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
    const updateData: Record<string, unknown> = {
      senha_temporaria: true,
      primeiro_acesso: true,
      email: email,
    }
    
    if (planoMentoria) {
      updateData.plano_mentoria = planoMentoria
    }
    
    if (origemConsultoria !== undefined) {
      updateData.origem_consultoria = origemConsultoria
    }
    
    if (empresaConsultoria) {
      updateData.empresa_consultoria = empresaConsultoria
    }
    
    // Skills liberado só faz sentido para plano business
    if (planoMentoria === 'business') {
      updateData.skills_liberado = skillsLiberado ?? false
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
    
    if (profileError) throw profileError
    console.log('Profile updated')

    // 4. Inserir roles (pelo menos aluno_trilha se nenhuma for passada)
    const rolesToInsert = userRoles && userRoles.length > 0 ? userRoles : ['aluno_trilha']
    
    const { error: insertRolesError } = await supabaseAdmin
      .from('user_roles')
      .insert(rolesToInsert.map((role: string) => ({ user_id: userId, role })))

    if (insertRolesError) throw insertRolesError
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

    // 6. Handle Skills team association
    if (planoMentoria === 'skills') {
      let targetEquipeId = equipeId;

      // Create new team if needed
      if (novaEquipe && !equipeId) {
        const { data: newEquipe, error: equipeError } = await supabaseAdmin
          .from('equipes_skills')
          .insert({
            nome: novaEquipe.nome,
            empresa_nome: novaEquipe.empresa,
            lider_id: papelEquipe === 'lider' ? userId : null,
            status: 'ativo',
          })
          .select()
          .single();

        if (equipeError) {
          console.error('Error creating team:', equipeError)
          throw new Error('Erro ao criar equipe: ' + equipeError.message)
        }
        
        targetEquipeId = newEquipe.id;
        console.log('New team created:', targetEquipeId)
      }

      // Link user to team
      if (targetEquipeId) {
        const { error: membroError } = await supabaseAdmin
          .from('membros_equipe_skills')
          .insert({
            equipe_id: targetEquipeId,
            user_id: userId,
            papel: papelEquipe || 'membro',
            status: 'ativo'
          });

        if (membroError) {
          console.error('Error linking user to team:', membroError)
          throw new Error('Erro ao vincular usuário à equipe: ' + membroError.message)
        }

        console.log('User linked to team:', targetEquipeId, 'as', papelEquipe || 'membro')

        // If leader, update team's lider_id (in case of existing team)
        if (papelEquipe === 'lider' && equipeId) {
          await supabaseAdmin
            .from('equipes_skills')
            .update({ lider_id: userId })
            .eq('id', targetEquipeId);
          console.log('Team leader updated')
        }
      }
    }

    console.log('User creation complete - Created by admin:', user.id)

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
