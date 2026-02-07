

# Diagnostico do Erro e Prevencao Definitiva

## O que aconteceu (causa raiz)

O ambiente Skills sofria de um problema critico chamado **race condition** (condicao de corrida) nas paginas de acesso restrito. O problema afetava TODAS as paginas que verificam se o usuario e admin ou lider antes de renderizar.

### Como o erro funcionava

```text
1. Usuario (admin) clica em "Projeto Skills > Diagnostico"
2. A pagina carrega e executa dois hooks:
   - useUserRole()     -> isAdmin = false (CARREGANDO...)
   - useSkillsMembro() -> isLider = false (CARREGANDO...)
3. O codigo antigo fazia:
   if (!isAdmin && !isLider) {
     return <Navigate to="/skills/projeto" />  // REDIRECIONA IMEDIATAMENTE!
   }
4. Como ambos sao FALSE durante o carregamento, a pagina redirecionava
   ANTES de saber se o usuario realmente tinha acesso
5. Resultado: pagina aparece vazia ou "nao encontrada"
```

Este mesmo padrao errado estava em:
- `ProjetoSkillsDiagnosticoPage.tsx` (corrigido)
- `ProjetoSkillsPerformancePage.tsx` (corrigido)

### Problema secundario: "Meu Progresso" visivel no Skills

O menu "Meu Progresso" era ocultado no ambiente Skills pelo seu `menu_key` principal (`meu_progresso`), mas seus 4 submenus filhos (`meu_progresso_visao_geral`, `meu_progresso_roadmap`, `meu_progresso_conteudo`, `meu_progresso_entregas`) NAO estavam na lista de exclusao, podendo vazar na interface.

---

## O que ja foi corrigido

1. **Race condition eliminada**: As paginas `ProjetoSkillsDiagnosticoPage` e `ProjetoSkillsPerformancePage` agora:
   - Esperam o loading terminar antes de verificar acesso
   - Mostram um spinner durante o carregamento
   - So redirecionam via `useEffect` apos confirmacao de falta de acesso

2. **Menus filhos ocultados**: Todos os 4 filhos de `meu_progresso` foram adicionados a lista de exclusao do ambiente Skills

3. **Rotas legadas redirecionadas**: `/skills/progresso` e variantes agora redirecionam para `/skills/projeto`

4. **Protecao global**: Handler de `unhandledrejection` no `main.tsx` previne "tela branca" por erros asincronos

---

## Prevencao definitiva (o que falta fazer)

### 1. Criar um wrapper reutilizavel para paginas Skills restritas

Criar um componente `SkillsAdminGuard` que encapsula a logica de verificacao de acesso, evitando que qualquer nova pagina Skills repita o padrao errado.

**Arquivo:** `src/components/skills/SkillsAdminGuard.tsx`

```text
// Wrapper que:
// 1. Espera loading de useUserRole e useSkillsMembro
// 2. Mostra spinner durante carregamento
// 3. Redireciona para /skills/projeto se nao tem acesso
// 4. Renderiza children apenas quando acesso confirmado

<SkillsAdminGuard>
  <ProjetoSkillsDiagnostico />
</SkillsAdminGuard>
```

### 2. Refatorar as paginas existentes para usar o guard

**Arquivos:**
- `ProjetoSkillsDiagnosticoPage.tsx` - Substituir logica manual pelo `SkillsAdminGuard`
- `ProjetoSkillsPerformancePage.tsx` - Substituir logica manual pelo `SkillsAdminGuard`

Isso garante que qualquer futura pagina Skills que precise de acesso admin/lider use o mesmo componente centralizado, eliminando a possibilidade de alguem escrever o padrao errado novamente.

### 3. Limpar codigo morto

- Remover o arquivo `src/pages/skills/SkillsMeuProgresso.tsx` que nao e mais usado (o import ja foi removido do App.tsx, mas o arquivo ainda existe)

---

## Resumo de arquivos

### Criar
- `src/components/skills/SkillsAdminGuard.tsx` - Wrapper reutilizavel de acesso

### Modificar
- `src/pages/skills/ProjetoSkillsDiagnosticoPage.tsx` - Usar SkillsAdminGuard
- `src/pages/skills/ProjetoSkillsPerformancePage.tsx` - Usar SkillsAdminGuard

### Remover
- `src/pages/skills/SkillsMeuProgresso.tsx` - Codigo morto (nao mais importado)

