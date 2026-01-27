import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface UserToImport {
  email: string;
  nomeCompleto: string;
  password: string;
}

interface ImportRequest {
  users: UserToImport[];
  planoMentoria?: string;
  roles?: string[];
}

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
        JSON.stringify({ error: 'Apenas administradores podem importar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { users, planoMentoria, roles: userRoles }: ImportRequest = await req.json()

    console.log(`Admin ${user.id} starting batch import of ${users.length} users`)

    const planosValidos = ['academy', 'skills', 'business'];
    if (planoMentoria && !planosValidos.includes(planoMentoria)) {
      throw new Error(`Plano de mentoria inválido. Valores aceitos: ${planosValidos.join(', ')}`)
    }

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[]
    }

    // Processar usuários sequencialmente para evitar conflitos
    for (const importUser of users) {
      try {
        console.log(`Creating user: ${importUser.email}`)

        // 1. Criar usuário via Admin API
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: importUser.email,
          password: importUser.password,
          email_confirm: true,
          user_metadata: { nome_completo: importUser.nomeCompleto }
        })

        if (userError) {
          console.error(`Error creating user ${importUser.email}:`, userError)
          results.errors.push({ email: importUser.email, error: userError.message })
          continue
        }

        if (!userData.user) {
          results.errors.push({ email: importUser.email, error: 'Usuário não foi criado' })
          continue
        }

        const userId = userData.user.id
        console.log(`User created: ${importUser.email} (${userId})`)

        // 2. Aguardar e verificar que o profile foi criado
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
          results.errors.push({ email: importUser.email, error: 'Profile não foi criado pelo trigger' })
          continue
        }

        // 3. Atualizar profile com dados adicionais
        const updateData: Record<string, unknown> = {
          senha_temporaria: true,
          primeiro_acesso: true,
          email: importUser.email,
        }
        
        if (planoMentoria) {
          updateData.plano_mentoria = planoMentoria
        }

        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
        
        if (profileError) {
          console.error(`Error updating profile for ${importUser.email}:`, profileError)
          results.errors.push({ email: importUser.email, error: profileError.message })
          continue
        }

        // 4. Inserir roles
        const rolesToInsert = userRoles && userRoles.length > 0 ? userRoles : ['aluno_trilha']
        
        const { error: insertRolesError } = await supabaseAdmin
          .from('user_roles')
          .insert(rolesToInsert.map((role: string) => ({ user_id: userId, role })))

        if (insertRolesError) {
          console.error(`Error inserting roles for ${importUser.email}:`, insertRolesError)
          results.errors.push({ email: importUser.email, error: insertRolesError.message })
          continue
        }

        // 5. Verificar que as roles foram inseridas
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
          results.errors.push({ email: importUser.email, error: 'Roles não foram confirmadas' })
          continue
        }

        console.log(`Successfully created user: ${importUser.email}`)
        results.success.push(importUser.email)

      } catch (error) {
        console.error(`Error processing user ${importUser.email}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        results.errors.push({ email: importUser.email, error: errorMessage })
      }
    }

    console.log(`Batch import completed by admin ${user.id}. Success: ${results.success.length}, Errors: ${results.errors.length}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        total: users.length,
        imported: results.success.length,
        failed: results.errors.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in import-users-batch:', error)
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
