import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendWelcomeEmail } from '../_shared/welcomeEmail.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
      email: emailRaw, 
      password, 
      nomeCompleto, 
      roles: userRoles, 
      planoMentoria, 
      origemConsultoria, 
      empresaConsultoria
    } = await req.json()

    // Normaliza o email (trim + minúsculas) para evitar divergência entre o
    // cadastro e o login — uma causa comum de "credenciais inválidas".
    const email = String(emailRaw ?? '').trim().toLowerCase()

    if (!email) {
      throw new Error('Email é obrigatório')
    }

    console.log(`Admin ${user.id} creating user:`, { email, nomeCompleto, roles: userRoles, planoMentoria, origemConsultoria, empresaConsultoria })

    // Os três planos que existem. Antes a lista tinha skills e business_parceria,
    // que morreram, e não tinha insider_convidado: criar um Insider Convidado
    // pelo admin falhava com "plano inválido".
    const planosValidos = ['academy', 'insider_business', 'insider_convidado'];
    if (planoMentoria && !planosValidos.includes(planoMentoria)) {
      throw new Error(`Plano inválido. Valores aceitos: ${planosValidos.join(', ')}`)
    }
    const effectivePlanoMentoria = planoMentoria || null;

    // Permissões são duas, e só de equipe: admin e equipe. O papel de cliente
    // não é escolhido no formulário; ele vem do plano, abaixo.
    const permissoesEquipe = ['admin', 'equipe'];
    const rolesEquipe: string[] = (userRoles ?? []).filter((r: string) => permissoesEquipe.includes(r));

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
        
        // Buscar usuário existente via profiles (evita limite de 1000 do listUsers)
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (profileData) {
          userId = profileData.id
        } else {
          // Fallback: listUsers com comparação case-insensitive
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          if (listError) throw listError
          const existingUser = listData?.users.find(
            u => u.email?.toLowerCase() === email.toLowerCase()
          )
          if (!existingUser) throw new Error('Email existe mas usuário não encontrado no auth nem em profiles')
          userId = existingUser.id
        }
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

        // Atualizar senha E confirmar o email.
        // CRÍTICO: se o usuário existente nunca confirmou o email (ex.: cadastro
        // anterior como visitante/lead que ficou pendente), o login falha com
        // "credenciais inválidas" mesmo com a senha correta. Forçamos email_confirm
        // aqui para garantir que ele consiga entrar com a senha temporária.
        const updateAuth: Record<string, unknown> = {
          email_confirm: true,
          user_metadata: { nome_completo: nomeCompleto },
        }
        if (password) {
          updateAuth.password = password
        }
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateAuth)
        if (updateAuthError) {
          console.error('Erro ao atualizar auth do usuário existente:', updateAuthError)
          throw updateAuthError
        }
        console.log('Senha/email_confirm atualizados para usuário existente')

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

    // 5. Inserir roles.
    //
    // Quem tem plano é cliente, e cliente é aluno_trilha: é o papel que a RLS
    // de trilhas, vídeos e módulos aceita (junto com mentorado, que era o
    // cliente da mentoria e continua valendo para quem já tem) e o mesmo que o
    // webhook de compra atribui. Equipe sem plano fica só com a permissão.
    const rolesToInsert = [...rolesEquipe, ...(effectivePlanoMentoria ? ['aluno_trilha'] : [])]
    if (rolesToInsert.length === 0) {
      throw new Error('Escolha um plano para o cliente ou uma permissão de equipe.')
    }
    
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

    const action = isExistingUser ? 'promovido de visitante' : 'criado'
    console.log(`User ${action} complete - by admin:`, user.id)

    // Enviar e-mail de boas-vindas (via n8n, com fallback Zapier — ver _shared/welcomeEmail.ts).
    // Só faz sentido quando há um plano: equipe sem plano não recebe.
    const rotulos: Record<string, string> = {
      academy: 'Academy',
      insider_business: 'Insider Business',
      insider_convidado: 'Insider Convidado',
    };
    const planoLabel = effectivePlanoMentoria ? (rotulos[effectivePlanoMentoria] ?? effectivePlanoMentoria) : '';
    if (effectivePlanoMentoria) {
      await sendWelcomeEmail({
        email,
        nome: nomeCompleto,
        senha: password,
        plano: effectivePlanoMentoria,
        planoLabel,
        acao: isExistingUser ? 'existing_user_updated' : 'new_user_created',
      });
    }

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
