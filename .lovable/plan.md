

# Corrigir Cadastro de Usuarios Skills que Ja Existem como Visitantes

## Problema Identificado

O usuario `erich.oliveira@engelmig.com.br` ja existe no sistema como **visitante** (is_visitante=true, plano_mentoria=null, role=visitante). Quando o admin tenta cadastra-lo no plano Skills, a edge function `create-user-admin` tenta criar um novo usuario via `auth.admin.createUser` e falha com "email already registered".

O usuario fica preso como visitante, sem plano Skills, sem equipe vinculada.

## Causa Raiz

A edge function `create-user-admin` so sabe **criar** usuarios novos. Nao tem logica para **promover** um visitante existente para um plano pago (Skills, Academy, Business).

## Solucao

Modificar a edge function `create-user-admin` para detectar quando o email ja existe e, nesse caso, **atualizar** o usuario existente em vez de falhar:

### Edge Function `create-user-admin/index.ts`

1. Quando `auth.admin.createUser` retorna erro `email_exists`:
   - Buscar o usuario existente por email via `auth.admin.listUsers`
   - Obter o `userId` do usuario existente
   - Atualizar a senha se fornecida (via `auth.admin.updateUserById`)
   - Pular a etapa de "aguardar profile" (ja existe)
   - Seguir normalmente para:
     - Atualizar profile (plano_mentoria, is_visitante=false, etc.)
     - Remover role `visitante` existente
     - Inserir novas roles (aluno_trilha)
     - Vincular a equipe Skills

2. Logica resumida:

```
Tentar criar usuario
  -> Sucesso: fluxo normal (ja existe)
  -> Erro email_exists:
     -> Buscar usuario existente pelo email
     -> Atualizar senha (auth.admin.updateUserById)
     -> Atualizar profile: plano_mentoria, is_visitante=false
     -> Deletar roles antigas (visitante)
     -> Inserir novas roles
     -> Vincular equipe Skills (se aplicavel)
     -> Retornar sucesso
```

### Frontend `useUsers.tsx`

Manter o tratamento de erro melhorado (ja implementado), mas agora o erro de email duplicado nao vai mais ocorrer para visitantes - eles serao promovidos automaticamente.

## Detalhes Tecnicos

### Mudancas na Edge Function

```typescript
// Apos tentar createUser e receber erro email_exists:
if (userError?.code === 'email_exists') {
  // Buscar usuario existente
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = listData.users.find(u => u.email === email);
  if (!existingUser) throw new Error('Email existe mas usuario nao encontrado');
  
  userId = existingUser.id;
  
  // Atualizar senha
  await supabaseAdmin.auth.admin.updateUserById(userId, { password });
  
  // Atualizar profile - promover de visitante para plano
  await supabaseAdmin.from('profiles').update({
    plano_mentoria: planoMentoria,
    is_visitante: false,
    senha_temporaria: true,
    primeiro_acesso: true,
    nome_completo: nomeCompleto, // atualizar nome se necessario
  }).eq('id', userId);
  
  // Remover role visitante
  await supabaseAdmin.from('user_roles').delete()
    .eq('user_id', userId).eq('role', 'visitante');
  
  // Inserir novas roles
  // ... (mesma logica existente)
  
  // Vincular equipe Skills
  // ... (mesma logica existente)
}
```

### Impacto
- **Visitantes existentes**: serao promovidos para o plano solicitado (Skills, Academy, etc.)
- **Usuarios novos**: fluxo permanece identico ao atual
- **Usuarios ja com plano**: o erro sera mantido para evitar sobrescrever dados de mentorados ativos
- **Correcao imediata**: o usuario `erich.oliveira@engelmig.com.br` podera ser cadastrado no Skills na proxima tentativa

