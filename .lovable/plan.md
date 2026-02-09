
# Mover "Painel Líder" como submenu de "Visão Geral"

## Resumo

Transformar "Painel Líder" em um submenu de "Visão Geral" (em vez de submenu direto de "Projeto Skills"), visível apenas para administradores e líderes do projeto.

## Alterações

### 1. Banco de dados (menu_config)

Atualizar o `parent_key` de `projeto_skills_performance` para apontar para `projeto_skills_visao_geral`:

```sql
UPDATE menu_config 
SET parent_key = 'projeto_skills_visao_geral', ordem = 1
WHERE menu_key = 'projeto_skills_performance';
```

Isso cria a hierarquia:
```
Projeto Skills
  ├── Visão Geral (/skills/projeto)
  │     └── Painel Líder (/skills/projeto/performance)  [admin/líder]
  ├── Avaliação
  └── Projetos
```

### 2. Sidebar (AppSidebar.tsx)

Atualizar o componente de sidebar para suportar submenus de terceiro nível (submenu dentro de submenu). Atualmente, a sidebar renderiza apenas dois níveis (pai > filho). Será necessário:

- Permitir que "Visão Geral" tenha filhos renderizados abaixo dele
- Manter o filtro de visibilidade existente que já restringe `projeto_skills_performance` a admin/líder (`isSkillsLider || isAdmin`)
- Renderizar "Painel Líder" com recuo adicional (pl-12) abaixo de "Visão Geral"

### 3. Nenhuma alteração em rotas ou componentes de página

As rotas e componentes de Performance/Painel Líder permanecem inalterados - apenas a posição no menu muda.

## Detalhes técnicos

- O filtro de acesso em `getSubMenus` já bloqueia `projeto_skills_performance` para não-líderes/não-admins
- A lógica de auto-expansão do menu será ajustada para expandir "Visão Geral" quando a rota ativa for `/skills/projeto/performance`
- O `useMenuConfig` não precisa de alteração pois já filtra por `parent_key` dinamicamente
