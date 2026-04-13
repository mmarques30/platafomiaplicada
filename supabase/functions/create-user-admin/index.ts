import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
      equipeId,
      novaEquipe,
      papelEquipe
    } = await req.json()

    console.log(`Admin ${user.id} creating user:`, { email, nomeCompleto, roles: userRoles, planoMentoria, origemConsultoria, empresaConsultoria, skillsLiberado, equipeId, novaEquipe, papelEquipe })

    // Validar planoMentoria
    const planosValidos = ['academy', 'skills', 'business_parceria', 'business_sistemas'];
    if (planoMentoria && !planosValidos.includes(planoMentoria)) {
      throw new Error(`Plano de mentoria inválido. Valores aceitos: ${planosValidos.join(', ')}`)
    }

    // Se role inclui parceiros e não tem plano, setar como business automaticamente
    const effectivePlanoMentoria = (!planoMentoria && userRoles?.includes('parceiros')) 
      ? 'business_parceria' 
      : planoMentoria;

    // Validate Skills requires team
    if (planoMentoria === 'skills' && !equipeId && !novaEquipe) {
      throw new Error('Para o plano Skills, é obrigatório informar uma equipe existente ou criar uma nova.')
    }

    let userId: string;
    let isExistingUser = false;

    // 1. Tentar criar usuário via Admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome_completo: nomeCompleto }
    })

    if (userError) {
      // Verificar se é erro de email já existente
      if ((userError as any).code === 'email_exists' || userError.message?.includes('already been registered')) {
        console.log('Email já existe, tentando promover usuário existente:', email)
        
        // Buscar usuário existente
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError
        
        const existingUser = listData.users.find(u => u.email === email)
        if (!existingUser) throw new Error('Email existe mas usuário não encontrado')
        
        userId = existingUser.id
        isExistingUser = true

        // Verificar se já tem plano ativo (não é visitante) - proteger contra sobrescrita
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('plano_mentoria, is_visitante')
          .eq('id', userId)
          .single()

        if (existingProfile && existingProfile.plano_mentoria && !existingProfile.is_visitante) {
          throw new Error('Este usuário já possui um plano ativo. Edite o usuário existente em vez de criar um novo.')
        }

        // Atualizar senha
        if (password) {
          await supabaseAdmin.auth.admin.updateUserById(userId, { password })
          console.log('Senha atualizada para usuário existente')
        }

        // Atualizar metadata
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { nome_completo: nomeCompleto }
        })

        console.log('Usuário existente encontrado, promovendo:', userId)
      } else {
        throw userError
      }
    } else {
      if (!userData.user) throw new Error('Usuário não foi criado')
      userId = userData.user.id
      console.log('Novo usuário criado:', userId)
    }

    // 2. Aguardar profile (apenas para novos usuários)
    if (!isExistingUser) {
      let profileExists = false
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)))
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
    }

    // 3. Atualizar profile com dados adicionais
    const updateData: Record<string, unknown> = {
      senha_temporaria: true,
      primeiro_acesso: true,
      email: email,
    }
    
    if (effectivePlanoMentoria) {
      updateData.plano_mentoria = effectivePlanoMentoria
    }

    // Se estamos promovendo visitante, marcar como não-visitante
    if (isExistingUser) {
      updateData.is_visitante = false
      updateData.nome_completo = nomeCompleto
    }
    
    if (origemConsultoria !== undefined) {
      updateData.origem_consultoria = origemConsultoria
    }
    
    if (empresaConsultoria) {
      updateData.empresa_consultoria = empresaConsultoria
    }
    
    if (effectivePlanoMentoria === 'business_parceria' || effectivePlanoMentoria === 'business_sistemas') {
      updateData.skills_liberado = skillsLiberado ?? false
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
    
    if (profileError) throw profileError
    console.log('Profile updated')

    // 4. Para usuários existentes, remover role visitante antes de inserir novas
    if (isExistingUser) {
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'visitante')
      console.log('Role visitante removida')
    }

    // 5. Inserir roles
    const rolesToInsert = userRoles && userRoles.length > 0 ? userRoles : ['aluno_trilha']
    
    // Para usuários existentes, deletar roles antigas (exceto admin) antes de inserir
    if (isExistingUser) {
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .neq('role', 'admin')
      console.log('Roles antigas removidas')
    }

    const { error: insertRolesError } = await supabaseAdmin
      .from('user_roles')
      .insert(rolesToInsert.map((role: string) => ({ user_id: userId, role })))

    if (insertRolesError) throw insertRolesError
    console.log('Roles inserted:', rolesToInsert)

    // 6. Verificar roles
    let rolesConfirmed = false
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
      const { data: insertedRoles } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
      if (insertedRoles && insertedRoles.length >= rolesToInsert.length) {
        rolesConfirmed = true
        break
      }
    }
    if (!rolesConfirmed) {
      throw new Error('Roles não foram confirmadas no banco')
    }
    console.log('Roles confirmed')

    // 7. Handle Skills team association
    if (planoMentoria === 'skills') {
      let targetEquipeId = equipeId;

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

      if (targetEquipeId) {
        // Para usuários existentes, verificar se já está na equipe
        if (isExistingUser) {
          const { data: existingMembro } = await supabaseAdmin
            .from('membros_equipe_skills')
            .select('id')
            .eq('equipe_id', targetEquipeId)
            .eq('user_id', userId)
            .single()

          if (existingMembro) {
            // Atualizar membro existente
            await supabaseAdmin
              .from('membros_equipe_skills')
              .update({ papel: papelEquipe || 'membro', status: 'ativo' })
              .eq('id', existingMembro.id)
            console.log('Membro existente atualizado na equipe')
          } else {
            const { error: membroError } = await supabaseAdmin
              .from('membros_equipe_skills')
              .insert({
                equipe_id: targetEquipeId,
                user_id: userId,
                papel: papelEquipe || 'membro',
                status: 'ativo'
              });
            if (membroError) throw new Error('Erro ao vincular usuário à equipe: ' + membroError.message)
            console.log('User linked to team:', targetEquipeId)
          }
        } else {
          const { error: membroError } = await supabaseAdmin
            .from('membros_equipe_skills')
            .insert({
              equipe_id: targetEquipeId,
              user_id: userId,
              papel: papelEquipe || 'membro',
              status: 'ativo'
            });
          if (membroError) throw new Error('Erro ao vincular usuário à equipe: ' + membroError.message)
          console.log('User linked to team:', targetEquipeId)
        }

        if (papelEquipe === 'lider' && equipeId) {
          await supabaseAdmin
            .from('equipes_skills')
            .update({ lider_id: userId })
            .eq('id', targetEquipeId);
          console.log('Team leader updated')
        }
      }
    }

    const action = isExistingUser ? 'promovido de visitante' : 'criado'
    console.log(`User ${action} complete - by admin:`, user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: isExistingUser ? 'Visitante promovido com sucesso' : 'Usuário criado com sucesso'
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
