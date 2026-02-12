
# Seletor de Equipe para Admin no Ambiente Skills

## Problema

Quando um administrador acessa `/skills/projeto` (Visao Geral), o hook `useSkillsMembro` automaticamente busca a primeira equipe disponivel no banco como fallback (linha 49 do hook). Isso faz com que dados de uma empresa especifica sejam exibidos imediatamente, sem que o admin tenha escolhido qual empresa/equipe visualizar.

Com multiplas empresas, isso e incorreto -- o admin precisa selecionar explicitamente qual equipe quer ver.

## Solucao

### 1. Remover o fallback automatico do `useSkillsMembro`

**Arquivo:** `src/hooks/useSkillsMembro.ts`

Remover a logica que busca automaticamente a primeira equipe quando o admin nao tem equipe. Em vez disso, retornar `equipeId: null` para que a UI possa reagir e mostrar um seletor.

Adicionar um novo campo `needsTeamSelection: true` quando for admin sem equipe propria e sem simulacao ativa.

### 2. Criar componente seletor de equipe para admin

**Novo arquivo:** `src/components/skills/AdminTeamSelector.tsx`

Um componente com:
- Lista de equipes disponiveis (usando query em `equipes_skills`)
- Select dropdown com nome da equipe e empresa
- Ao selecionar, armazenar a escolha em estado (via contexto ou state lift)

### 3. Criar contexto para equipe selecionada pelo admin

**Novo arquivo:** `src/contexts/SkillsAdminTeamContext.tsx`

Um contexto simples que armazena o `selectedEquipeId` escolhido pelo admin. Isso permite que todos os hooks filhos (`useSkillsLider`, `useSkillsEquipe`, etc.) usem essa equipe sem precisar de fallback automatico.

### 4. Atualizar `useSkillsMembro` para usar o contexto

**Arquivo:** `src/hooks/useSkillsMembro.ts`

- Se o usuario e admin e nao tem equipe propria, verificar se existe uma equipe selecionada no contexto `SkillsAdminTeamContext`
- Se sim, usar essa equipe
- Se nao, retornar `equipeId: null` e `needsTeamSelection: true`

### 5. Atualizar pagina Visao Geral para mostrar seletor

**Arquivo:** `src/pages/skills/ProjetoSkills.tsx`

- Envolver com o Provider do contexto
- Quando `needsTeamSelection === true`, mostrar o `AdminTeamSelector` em vez do conteudo normal
- Apos selecionar, os componentes filhos carregam normalmente

### 6. Envolver rotas Skills com o Provider

**Arquivo:** `src/App.tsx` ou layout das rotas Skills

Adicionar o `SkillsAdminTeamProvider` ao redor das rotas `/skills/projeto/*` para que o contexto seja compartilhado entre Visao Geral, Diagnostico, Projetos e Performance.

## Fluxo Resultante

- **Membro/Lider:** Acessa normalmente, ve dados da sua equipe (sem mudanca)
- **Admin simulando usuario:** Acessa normalmente via simulacao (sem mudanca)
- **Admin sem simulacao:** Ve um seletor de equipe no topo. Escolhe a equipe e ve os dados. A escolha persiste enquanto navega entre as sub-paginas do Skills.

## Detalhes Tecnicos

```text
Antes:
  Admin acessa /skills/projeto
    -> useSkillsMembro busca primeira equipe automaticamente
    -> Dados carregam sem escolha

Depois:
  Admin acessa /skills/projeto
    -> useSkillsMembro retorna equipeId: null, needsTeamSelection: true
    -> UI mostra seletor de equipe
    -> Admin escolhe equipe
    -> Contexto armazena escolha
    -> useSkillsMembro retorna equipeId da escolha
    -> Dados carregam normalmente
```

### Arquivos modificados:
- `src/hooks/useSkillsMembro.ts` -- remover fallback, integrar contexto
- `src/pages/skills/ProjetoSkills.tsx` -- adicionar seletor condicional
- `src/App.tsx` -- envolver rotas com Provider

### Arquivos novos:
- `src/contexts/SkillsAdminTeamContext.tsx` -- contexto da equipe selecionada
- `src/components/skills/AdminTeamSelector.tsx` -- componente seletor
