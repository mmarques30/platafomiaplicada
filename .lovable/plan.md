

# Corrigir Acesso de Membros Skills a Avaliacao e Projetos

## Problema

Membros comuns da equipe Skills (como Erich) nao conseguem ver nem acessar as paginas de "Avaliacao" e "Projetos". Dois bloqueios impedem o acesso:

1. **Menu lateral (AppSidebar.tsx, linha 130)**: Os itens `projeto_skills_diagnostico` e `projeto_skills_projetos` sao filtrados para quem nao e lider ou admin -- o membro nem ve os links no menu.

2. **Guard das paginas**: Ambas as paginas (`ProjetoSkillsDiagnosticoPage` e `ProjetoSkillsProjetosPage`) usam `SkillsAdminGuard`, que so permite acesso a admin/lider e redireciona qualquer outro usuario para `/skills/projeto`.

## Solucao

### 1. AppSidebar.tsx (linha 130)

Remover `projeto_skills_diagnostico` e `projeto_skills_projetos` da lista de filtro. Manter apenas `projeto_skills_performance` como restrito a lider/admin:

```text
// ANTES:
.filter(menu => !['projeto_skills_performance', 'projeto_skills_diagnostico', 'projeto_skills_projetos'].includes(menu.menu_key) || ...)

// DEPOIS:
.filter(menu => !['projeto_skills_performance'].includes(menu.menu_key) || ...)
```

### 2. ProjetoSkillsDiagnosticoPage.tsx

Remover `SkillsAdminGuard`. Qualquer membro ativo da equipe Skills deve poder preencher seu diagnostico. Usar `useSkillsMembro` para verificar se o usuario e membro ativo, com redirect se nao for.

### 3. ProjetoSkillsProjetosPage.tsx

Remover `SkillsAdminGuard`. Todos os membros da equipe Skills precisam ver os projetos colaborativos. Mesmo tratamento: verificar se e membro ativo da equipe.

## Resultado

- Membros comuns verao "Avaliacao" e "Projetos" no menu lateral
- Conseguirao acessar ambas as paginas normalmente
- Apenas "Performance" (Painel Lider) continua restrito a lider/admin

