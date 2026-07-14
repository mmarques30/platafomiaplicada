import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const BRAND = {
  green: '#7C8B2A',
  greenSoft: '#AFC040',
  ink: '#1a1c19',
  cream: '#F6F5EF',
  creamSoft: '#FBFAF5',
  muted: '#6b6f66',
  hairline: '#e6e4da',
}

function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Monta um e-mail de boas-vindas HTML responsivo (CSS inline, seguro p/ clientes de e-mail).
function buildWelcomeEmailHtml(params: {
  nome: string
  email: string
  senha: string
  planoLabel: string
  plataformaUrl: string
  logoUrl?: string | null
}): string {
  const primeiroNome = escapeHtml((params.nome || '').trim().split(' ')[0] || 'boas-vindas')
  const email = escapeHtml(params.email)
  const senha = escapeHtml(params.senha)
  const planoLabel = escapeHtml(params.planoLabel)
  const url = escapeHtml(params.plataformaUrl)
  const logo = params.logoUrl
    ? `<img src="${escapeHtml(params.logoUrl)}" alt="IAplicada" height="28" style="height:28px;display:block;border:0;" />`
    : `<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">IAplicada</span>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<title>Bem-vindo(a) à IAplicada</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Seu acesso à plataforma IAplicada está pronto — entre com seu e-mail e senha temporária.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream};padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid ${BRAND.hairline};border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background-color:${BRAND.green};padding:22px 32px;">
            ${logo}
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <h1 style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;color:${BRAND.ink};font-weight:400;">Olá, ${primeiroNome}!</h1>
            <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">
              Seu acesso à plataforma <strong style="color:${BRAND.ink};">IAplicada</strong> está pronto.
              Plano: <strong style="color:${BRAND.green};">${planoLabel}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.creamSoft};border:1px solid ${BRAND.hairline};border-radius:12px;">
              <tr><td style="padding:18px 20px;">
                <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};">Seus dados de acesso</p>
                <p style="margin:0 0 10px 0;font-size:15px;color:${BRAND.ink};"><strong>E-mail:</strong> ${email}</p>
                <p style="margin:0;font-size:15px;color:${BRAND.ink};"><strong>Senha temporária:</strong> <span style="font-family:'Courier New',monospace;background:#fff;border:1px solid ${BRAND.hairline};border-radius:6px;padding:2px 8px;">${senha}</span></p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 4px 32px;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:999px;background-color:${BRAND.green};">
                <a href="${url}" target="_blank" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">Acessar a plataforma</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">Primeiros passos:</p>
            <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.7;color:${BRAND.ink};">
              <li>Acesse com o e-mail e a senha temporária acima.</li>
              <li>Troque a senha temporária por uma senha pessoal.</li>
              <li>Escolha seu ambiente e comece por "Início".</li>
            </ol>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px 32px;font-family:Arial,Helvetica,sans-serif;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};border-top:1px solid ${BRAND.hairline};padding-top:16px;">
              Precisa de ajuda? É só responder este e-mail.<br />
              <span style="color:#a2a69b;">IAplicada — Inteligência aplicada ao seu dia a dia.</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
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
      empresaConsultoria, 
      skillsLiberado,
      equipeId,
      novaEquipe,
      papelEquipe
    } = await req.json()

    // Normaliza o email (trim + minúsculas) para evitar divergência entre o
    // cadastro e o login — uma causa comum de "credenciais inválidas".
    const email = String(emailRaw ?? '').trim().toLowerCase()

    if (!email) {
      throw new Error('Email é obrigatório')
    }

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

    // Enviar e-mail de boas-vindas.
    // Fluxo novo: n8n (N8N_WEBHOOK_URL_WELCOME) recebe os dados + o HTML já
    // formatado e faz o envio. O código gera o e-mail bonito; o n8n orquestra.
    // Mantemos o Zapier como fallback temporário enquanto o n8n não estiver
    // configurado, para não interromper os envios durante a migração.
    const isBusiness = effectivePlanoMentoria === 'business_parceria' || effectivePlanoMentoria === 'business_sistemas';
    const isAcademy = effectivePlanoMentoria === 'academy';

    const planoLabel = isBusiness
      ? (effectivePlanoMentoria === 'business_sistemas' ? 'System' : 'Builder')
      : isAcademy
        ? 'Academy'
        : 'Gratuito';

    const plataformaUrl = Deno.env.get('PLATAFORMA_URL') || 'https://plataforma.iaplicada.com';
    const logoUrl = Deno.env.get('WELCOME_EMAIL_LOGO_URL') || null;

    // Só faz sentido mandar boas-vindas quando há um plano ativo (Academy/Business).
    if (effectivePlanoMentoria && (isBusiness || isAcademy)) {
      const html = buildWelcomeEmailHtml({
        nome: nomeCompleto,
        email,
        senha: password,
        planoLabel,
        plataformaUrl,
        logoUrl,
      });
      const subject = `Bem-vindo(a) à IAplicada — acesso ${planoLabel}`;

      const payload = {
        event: 'welcome_email',
        acao: isExistingUser ? 'existing_user_updated' : 'new_user_created',
        email,
        nome: nomeCompleto,
        senha: password,
        plano: effectivePlanoMentoria,
        plano_label: planoLabel,
        plataforma_url: plataformaUrl,
        subject,
        html,
      };

      const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL_WELCOME');
      const zapierUrl = isBusiness
        ? Deno.env.get('ZAPIER_WEBHOOK_URL_BUSINESS')
        : Deno.env.get('ZAPIER_WEBHOOK_URL');

      if (n8nUrl) {
        try {
          await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          console.log('Boas-vindas enviadas para n8n:', effectivePlanoMentoria);
        } catch (n8nError) {
          console.error('Erro ao enviar para n8n (nao-bloqueante):', n8nError);
        }
      } else if (zapierUrl) {
        try {
          await fetch(zapierUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          console.log('Boas-vindas enviadas para Zapier (fallback):', effectivePlanoMentoria);
        } catch (zapierError) {
          console.error('Erro ao enviar para Zapier (nao-bloqueante):', zapierError);
        }
      } else {
        console.warn('Nenhum webhook de boas-vindas configurado (N8N_WEBHOOK_URL_WELCOME / ZAPIER_*).');
      }
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
