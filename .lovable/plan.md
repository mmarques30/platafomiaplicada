

# Botão "Simular Onboarding" no painel Admin

## Ideia

Adicionar uma opção no `AdminViewSelector` (dropdown "Ver como...") ou um botão dedicado na área admin que abre o `OnboardingVideo` em modo preview — sem alterar o banco de dados.

## Alterações

### 1. Refatorar `OnboardingVideo` para aceitar modo preview

**Arquivo**: `src/components/onboarding/OnboardingVideo.tsx`

- Adicionar prop opcional `previewMode?: boolean`
- Quando `previewMode=true`: exibir o overlay normalmente, mas os botões "Entrar" e "Pular" apenas fecham o modal (sem chamar `supabase.update`)
- Quando `previewMode=false` (padrão): comportamento atual inalterado

### 2. Adicionar botão de preview no AdminViewSelector

**Arquivo**: `src/components/admin/AdminViewSelector.tsx`

- Adicionar item no dropdown: "👁 Simular Onboarding" com ícone `Play` ou `Video`
- Ao clicar, seta um estado local `showOnboardingPreview = true`
- Renderizar `<OnboardingVideo previewMode />` condicionalmente quando ativado

### 3. Nenhuma alteração de banco, rotas ou outros componentes

## Resultado

O admin clica em "Ver como..." → "Simular Onboarding" → vê exatamente o overlay que o usuário novo veria, e ao clicar "Entrar" ou "Pular" o modal fecha sem afetar dados.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/OnboardingVideo.tsx` | Editado — adiciona `previewMode` prop |
| `src/components/admin/AdminViewSelector.tsx` | Editado — adiciona opção "Simular Onboarding" |

