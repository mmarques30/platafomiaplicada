
# Plano: Associar Usuários Skills a Times e Empresas no Cadastro

## Contexto

Atualmente, ao criar usuários com plano Skills, eles não são automaticamente vinculados a uma equipe (`equipes_skills`) ou empresa. Como a trilha do Skills é compartilhada entre membros de um time, precisamos:

1. Permitir ao admin selecionar/criar uma equipe ao cadastrar usuários Skills
2. Associar automaticamente o novo usuário como membro dessa equipe
3. Ajustar a importação em lote para também vincular à equipe

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/NovoUsuarioModal.tsx` | Adicionar seletor de equipe quando plano = Skills |
| `src/pages/admin/ImportarUsuarios.tsx` | Adicionar seletor de equipe para importação Skills |
| `supabase/functions/create-user-admin/index.ts` | Receber `equipeId` e vincular na tabela `membros_equipe_skills` |
| `supabase/functions/import-users-batch/index.ts` | Receber `equipeId` e vincular cada usuário à equipe |
| `src/hooks/admin/useUsers.tsx` | Passar `equipeId` para as funções de criação |
| `src/hooks/useEquipesSkills.ts` | Novo hook para buscar/criar equipes Skills (admin) |

---

## Fluxo de Cadastro Individual (NovoUsuarioModal)

Quando o admin seleciona plano **Skills**:

```text
┌─────────────────────────────────────────────────────────────────┐
│  Produto / Plano                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Academy  │ │  Skills  │ │ Business │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                    ▲ selecionado                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Equipe Skills                                              ││
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │ Selecionar equipe existente    ▼                      │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  │     ou                                                       ││
│  │  [ + Criar nova equipe ]                                    ││
│  │                                                              ││
│  │  Se criar nova:                                             ││
│  │  ┌──────────────────────────┐ ┌──────────────────────────┐  ││
│  │  │ Nome da Equipe           │ │ Empresa                  │  ││
│  │  └──────────────────────────┘ └──────────────────────────┘  ││
│  │                                                              ││
│  │  [ ] Definir como Líder da equipe                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Alterações no NovoUsuarioModal

```typescript
// Novos estados
const [equipeId, setEquipeId] = useState<string>("");
const [criarNovaEquipe, setCriarNovaEquipe] = useState(false);
const [novaEquipeNome, setNovaEquipeNome] = useState("");
const [novaEquipeEmpresa, setNovaEquipeEmpresa] = useState("");
const [isLider, setIsLider] = useState(false);

// Buscar equipes existentes
const { data: equipesSkills } = useEquipesSkillsAdmin();

// No submit, passar dados da equipe
await createUser.mutateAsync({
  email,
  password,
  nomeCompleto,
  roles: selectedRoles,
  planoMentoria: selectedPlano || null,
  // Novos campos
  equipeId: criarNovaEquipe ? null : equipeId,
  novaEquipe: criarNovaEquipe ? {
    nome: novaEquipeNome,
    empresa: novaEquipeEmpresa,
  } : null,
  papelEquipe: isLider ? 'lider' : 'membro',
});
```

---

## Novo Hook: useEquipesSkillsAdmin

```typescript
// src/hooks/admin/useEquipesSkillsAdmin.ts
export function useEquipesSkillsAdmin() {
  return useQuery({
    queryKey: ["admin-equipes-skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipes_skills")
        .select(`
          id,
          nome,
          empresa_nome,
          status,
          lider_id,
          membros_equipe_skills(count)
        `)
        .eq("status", "ativo")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEquipeSkills() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ nome, empresa }: { nome: string; empresa: string }) => {
      const { data, error } = await supabase
        .from("equipes_skills")
        .insert({ nome, empresa_nome: empresa })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipes-skills"] });
    },
  });
}
```

---

## Alterações na Edge Function create-user-admin

```typescript
// Receber novos parâmetros
const { 
  email, password, nomeCompleto, roles: userRoles, 
  planoMentoria, skillsLiberado,
  // Novos
  equipeId,
  novaEquipe,
  papelEquipe 
} = await req.json()

// Se for Skills, vincular à equipe
if (planoMentoria === 'skills') {
  let targetEquipeId = equipeId;
  
  // Se precisa criar nova equipe
  if (novaEquipe && !equipeId) {
    const { data: newEquipe, error: equipeError } = await supabaseAdmin
      .from('equipes_skills')
      .insert({
        nome: novaEquipe.nome,
        empresa_nome: novaEquipe.empresa,
        lider_id: papelEquipe === 'lider' ? userId : null,
      })
      .select()
      .single();
    
    if (equipeError) throw equipeError;
    targetEquipeId = newEquipe.id;
  }
  
  // Vincular usuário à equipe
  if (targetEquipeId) {
    const { error: membroError } = await supabaseAdmin
      .from('membros_equipe_skills')
      .insert({
        equipe_id: targetEquipeId,
        user_id: userId,
        papel: papelEquipe || 'membro',
        status: 'ativo'
      });
    
    if (membroError) throw membroError;
    
    // Se for líder, atualizar lider_id na equipe
    if (papelEquipe === 'lider') {
      await supabaseAdmin
        .from('equipes_skills')
        .update({ lider_id: userId })
        .eq('id', targetEquipeId);
    }
  }
}
```

---

## Alterações na Importação em Lote

### ImportarUsuarios.tsx

Quando plano Skills for selecionado, exibir:

```text
┌─────────────────────────────────────────────────────────────────┐
│  Configurações Skills                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Equipe para todos os usuários    ▼                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│     ou                                                          │
│  [ + Criar nova equipe ]                                        │
│                                                                  │
│  Se criar nova:                                                 │
│  ┌──────────────────────────┐ ┌──────────────────────────────┐  │
│  │ Nome da Equipe           │ │ Empresa                      │  │
│  └──────────────────────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### import-users-batch Edge Function

```typescript
const { 
  users, planoMentoria, roles,
  // Novos
  equipeId,
  novaEquipe
} = await req.json()

// Se for Skills, criar equipe ou usar existente
let targetEquipeId = equipeId;

if (planoMentoria === 'skills' && novaEquipe && !equipeId) {
  const { data: newEquipe, error } = await supabaseAdmin
    .from('equipes_skills')
    .insert({
      nome: novaEquipe.nome,
      empresa_nome: novaEquipe.empresa,
    })
    .select()
    .single();
  
  if (error) throw error;
  targetEquipeId = newEquipe.id;
}

// Para cada usuário importado, vincular à equipe
if (planoMentoria === 'skills' && targetEquipeId) {
  await supabaseAdmin
    .from('membros_equipe_skills')
    .insert({
      equipe_id: targetEquipeId,
      user_id: userId,
      papel: 'membro',
      status: 'ativo'
    });
}
```

---

## Resumo das Alterações

| Componente | Alteração |
|------------|-----------|
| **NovoUsuarioModal** | Adicionar seção "Equipe Skills" quando plano = skills |
| **ImportarUsuarios** | Adicionar seletor de equipe para importação Skills |
| **useUsers.tsx** | Passar `equipeId`, `novaEquipe`, `papelEquipe` |
| **useEquipesSkillsAdmin** | Novo hook para listar/criar equipes |
| **create-user-admin** | Criar equipe se necessário + vincular membro |
| **import-users-batch** | Criar equipe se necessário + vincular membros |

---

## Validações

1. Se plano = Skills, equipe é **obrigatória** (existente ou nova)
2. Se criar nova equipe, nome e empresa são obrigatórios
3. Primeiro usuário de uma nova equipe pode ser marcado como líder
4. Na importação em lote, todos usuários vão para a mesma equipe (não é possível definir líder individual)

---

## Seção Técnica

### Interface do Select de Equipe

```typescript
interface EquipeSkillsOption {
  id: string;
  nome: string;
  empresa_nome: string;
  membros_count: number;
}

// Componente
<Select value={equipeId} onValueChange={setEquipeId}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma equipe" />
  </SelectTrigger>
  <SelectContent>
    {equipesSkills?.map((eq) => (
      <SelectItem key={eq.id} value={eq.id}>
        {eq.nome} ({eq.empresa_nome}) - {eq.membros_count} membros
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Dados Enviados ao Backend

```typescript
// Criação individual
{
  email: string;
  password: string;
  nomeCompleto: string;
  roles: string[];
  planoMentoria: 'skills';
  equipeId?: string; // UUID da equipe existente
  novaEquipe?: {
    nome: string;
    empresa: string;
  };
  papelEquipe?: 'lider' | 'membro';
}

// Importação em lote
{
  users: Array<{ email, nomeCompleto, password }>;
  planoMentoria: 'skills';
  roles: string[];
  equipeId?: string;
  novaEquipe?: {
    nome: string;
    empresa: string;
  };
}
```
