
# Plano: Ajustar Edição de Skills no EditUserModal

## Problema Identificado

Atualmente no `EditUserModal.tsx`:

1. A aba "Skills" está desabilitada com `disabled={!isSkillsPlan}` (linha 188), ou seja, só funciona quando o plano é "skills"
2. Usuários Business com `skillsLiberado=true` **não conseguem acessar a aba Skills** para edição
3. A lógica de submit só atualiza Skills quando `selectedPlano === "skills"` (linha 141), ignorando Business com Skills liberado

## Solução Proposta

Remover a aba separada "Skills" e **integrar a configuração do Skills diretamente na aba "Acesso"**, que aparece condicionalmente quando:
- O plano selecionado é "skills", OU
- O plano é "business" E `skillsLiberado=true`

## Alterações no EditUserModal.tsx

### 1. Remover aba Skills do TabsList

Mudar de 4 colunas para 3:

```text
Antes:  [Informações] [Acesso] [Skills] [Segurança]
Depois: [Informações] [Acesso] [Segurança]
```

### 2. Adicionar seção Skills dentro da aba "Acesso"

Após o switch de "Liberar acesso ao Skills" (para Business) ou após os cards de plano (para Skills):

```
┌─────────────────────────────────────────────────────────────────┐
│  Aba: Acesso                                                    │
├─────────────────────────────────────────────────────────────────┤
│  Permissões (Roles)                                             │
│  [x] Administrador  [x] Mentorado  [ ] Aluno da Trilha          │
│                                                                  │
│  Produto / Plano                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Sem plano│ │ Academy  │ │ Skills ✓ │ │ Business │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Configuração Skills                            (colapsável) ││
│  │ ┌─────────────────────────────────────────────────────────┐ ││
│  │ │ Equipe: [Select equipe existente ▼]                     │ ││
│  │ │ ou [+ Criar nova equipe]                                │ ││
│  │ │                                                          │ ││
│  │ │ Cargo: [______________________]                         │ ││
│  │ │ [ ] Definir como Líder da equipe                        │ ││
│  │ │                                                          │ ││
│  │ │ [Remover Vínculo Skills] (se já vinculado)              │ ││
│  │ └─────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Data de Expiração: [__________]                                │
│  Conta Ativa: [Switch]                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Lógica de Exibição

```typescript
// Mostrar configuração Skills quando:
const showSkillsConfig = selectedPlano === "skills" || 
                         (selectedPlano === "business" && skillsLiberado);
```

### 4. Atualizar Lógica de Submit

```typescript
// Atualizar vínculo Skills quando há acesso liberado
if (showSkillsConfig && (skillsEquipeData.equipeId || skillsEquipeData.novaEquipe)) {
  await updateSkillsMembro.mutateAsync({
    userId: user.id,
    equipeId: skillsEquipeData.equipeId,
    novaEquipe: skillsEquipeData.novaEquipe,
    papelEquipe: skillsEquipeData.papelEquipe,
    cargo,
  });
}
```

---

## Estrutura Final da Aba Acesso

A seção de configuração Skills aparecerá como um bloco destacado:

1. **Para plano Skills**: Aparece logo abaixo dos cards de plano
2. **Para plano Business**: Aparece abaixo do switch "Liberar acesso ao Skills" quando ativado

Ambos os cenários mostram:
- Seletor de equipe (existente ou nova)
- Campo de cargo
- Checkbox de líder
- Botão de remover vínculo (se já existir)

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/EditUserModal.tsx` | Remover aba Skills, integrar na aba Acesso |

---

## Seção Técnica

### Código da Seção Skills na Aba Acesso

```typescript
{/* Configuração Skills - aparece quando plano é Skills ou Business com Skills liberado */}
{showSkillsConfig && (
  <div className="space-y-4 mt-4">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">Configuração Skills</Label>
      {hasSkillsVinculo && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleRemoveSkillsVinculo}
          disabled={removeSkillsMembro.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remover Vínculo
        </Button>
      )}
    </div>
    
    {loadingSkillsMembro ? (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Carregando...
      </div>
    ) : (
      <>
        <SkillsEquipeSelector
          value={skillsEquipeData}
          onChange={setSkillsEquipeData}
          showLiderOption={true}
        />

        <div>
          <Label htmlFor="cargo-skills">Cargo na Empresa</Label>
          <Input
            id="cargo-skills"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ex: Analista de Marketing"
            className="mt-1"
          />
        </div>
      </>
    )}
  </div>
)}
```

### Variável de Controle

```typescript
// Determina se deve mostrar configuração Skills
const showSkillsConfig = selectedPlano === "skills" || 
                         (selectedPlano === "business" && skillsLiberado);
```

### Submit Atualizado

```typescript
const onSubmit = async (data: any) => {
  if (!user) return;

  const showSkillsConfig = selectedPlano === "skills" || 
                           (selectedPlano === "business" && skillsLiberado);

  // Atualizar dados gerais
  await updateUser.mutateAsync({...});

  // Atualizar Skills se configuração está visível e há dados de equipe
  if (showSkillsConfig && (skillsEquipeData.equipeId || skillsEquipeData.novaEquipe)) {
    await updateSkillsMembro.mutateAsync({
      userId: user.id,
      equipeId: skillsEquipeData.equipeId,
      novaEquipe: skillsEquipeData.novaEquipe,
      papelEquipe: skillsEquipeData.papelEquipe,
      cargo,
    });
  }
};
```
