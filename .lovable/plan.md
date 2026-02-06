

# Correcao Definitiva: Race Condition no Ambiente Skills

## Problema Identificado

O problema esta nas paginas `ProjetoSkillsDiagnosticoPage.tsx` e `ProjetoSkillsPerformancePage.tsx`. Ambas fazem uma verificacao de acesso **sincrona** sem esperar o carregamento dos dados:

```text
const { isAdmin } = useUserRole();        // isAdmin = false durante loading
const { isLider } = useSkillsMembro();    // isLider = false durante loading

if (!isAdmin && !isLider) {
  return <Navigate to="/skills/projeto" replace />;  // REDIRECIONA IMEDIATAMENTE!
}
```

Enquanto os hooks `useUserRole` e `useSkillsMembro` estao carregando dados do banco, ambos retornam `false`. Isso causa um **redirecionamento instantaneo** de volta para `/skills/projeto` antes mesmo de saber se o usuario tem acesso.

Esse e o mesmo padrao que ja esta **corretamente implementado** no `SkillsLiderDashboard.tsx`, que espera o loading terminar antes de verificar acesso.

## Solucao (2 partes)

### Parte 1: Corrigir as paginas com verificacao de loading

**Arquivos:** `ProjetoSkillsDiagnosticoPage.tsx` e `ProjetoSkillsPerformancePage.tsx`

Substituir o `<Navigate>` sincrono por:
1. Extrair `isLoading` dos hooks `useSkillsMembro` e `useUserRole`
2. Mostrar um skeleton/loader enquanto os dados carregam
3. Usar `useEffect` para redirecionar apenas apos o carregamento completo (mesmo padrao do `SkillsLiderDashboard`)

Padrao correto (igual ao SkillsLiderDashboard):
```text
const { isAdmin, isLoading: roleLoading } = useUserRole();
const { isLider, isLoading: membroLoading } = useSkillsMembro();
const isLoading = roleLoading || membroLoading;

// Redirecionar SOMENTE quando loading terminar
useEffect(() => {
  if (!isLoading && !isAdmin && !isLider) {
    navigate("/skills/projeto");
  }
}, [isLoading, isAdmin, isLider, navigate]);

// Mostrar loader enquanto carrega
if (isLoading) {
  return <LoadingSpinner />;
}
```

### Parte 2: Protecao global contra crashes (prevencao)

**Arquivo:** `src/main.tsx`

Adicionar um handler global para `unhandledrejection` que impede que erros asincronos nao tratados causem tela branca. Isso e uma rede de seguranca para qualquer erro futuro no ambiente Skills.

```text
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});
```

## Resumo de Arquivos

### Modificar
- `src/pages/skills/ProjetoSkillsDiagnosticoPage.tsx` - Adicionar loading state + useEffect para redirect
- `src/pages/skills/ProjetoSkillsPerformancePage.tsx` - Adicionar loading state + useEffect para redirect
- `src/main.tsx` - Adicionar handler global de unhandled rejections

### Impacto
Essa correcao resolve o problema generico que impede novas funcionalidades de aparecerem no ambiente Skills. Qualquer nova pagina que siga o padrao correto (esperar loading antes de verificar acesso) funcionara normalmente.

