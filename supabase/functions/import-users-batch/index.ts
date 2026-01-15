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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { users, planoMentoria, roles }: ImportRequest = await req.json()

    console.log(`Starting batch import of ${users.length} users`)

    const planosValidos = ['academy', 'skills', 'business'];
    if (planoMentoria && !planosValidos.includes(planoMentoria)) {
      throw new Error(`Plano de mentoria inválido. Valores aceitos: ${planosValidos.join(', ')}`)
    }

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[]
    }

    // Processar usuários sequencialmente para evitar conflitos
    for (const user of users) {
      try {
        console.log(`Creating user: ${user.email}`)

        // 1. Criar usuário via Admin API
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { nome_completo: user.nomeCompleto }
        })

        if (userError) {
          console.error(`Error creating user ${user.email}:`, userError)
          results.errors.push({ email: user.email, error: userError.message })
          continue
        }

        if (!userData.user) {
          results.errors.push({ email: user.email, error: 'Usuário não foi criado' })
          continue
        }

        const userId = userData.user.id
        console.log(`User created: ${user.email} (${userId})`)

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
          results.errors.push({ email: user.email, error: 'Profile não foi criado pelo trigger' })
          continue
        }

        // 3. Atualizar profile com dados adicionais
        const updateData: any = {
          senha_temporaria: true,
          primeiro_acesso: true,
          email: user.email,
        }
        
        if (planoMentoria) {
          updateData.plano_mentoria = planoMentoria
        }

        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
        
        if (profileError) {
          console.error(`Error updating profile for ${user.email}:`, profileError)
          results.errors.push({ email: user.email, error: profileError.message })
          continue
        }

        // 4. Inserir roles
        const rolesToInsert = roles && roles.length > 0 ? roles : ['aluno_trilha']
        
        const { error: rolesError } = await supabaseAdmin
          .from('user_roles')
          .insert(rolesToInsert.map((role: string) => ({ user_id: userId, role })))

        if (rolesError) {
          console.error(`Error inserting roles for ${user.email}:`, rolesError)
          results.errors.push({ email: user.email, error: rolesError.message })
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
          results.errors.push({ email: user.email, error: 'Roles não foram confirmadas' })
          continue
        }

        console.log(`Successfully created user: ${user.email}`)
        results.success.push(user.email)

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        results.errors.push({ email: user.email, error: errorMessage })
      }
    }

    console.log(`Batch import completed. Success: ${results.success.length}, Errors: ${results.errors.length}`)

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
