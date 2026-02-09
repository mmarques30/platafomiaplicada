

# Corrigir "Meu Progresso" no ambiente Academy

## Problema

No banco de dados, os menus `evolucao`, `meu_diagnostico` e `minhas_duvidas` tem `parent_key: meu_progresso`. Porem, no codigo (`useMenuConfig.tsx`), o ambiente `academy` esconde `meu_progresso` (o pai do grupo). Como o pai esta oculto, a sidebar nunca renderiza os filhos, mesmo eles nao estando na lista de ocultos.

## Solucao

Remover `meu_progresso` da lista `hiddenByEnvironment` do ambiente `academy`. Os submenus que NAO pertencem ao Academy (`meu_progresso_visao_geral`, `meu_progresso_roadmap`, `meu_progresso_conteudo`, `meu_progresso_entregas`) continuam ocultos, e o filtro de `planos_permitidos` no banco ja garante que so aparecem para os planos corretos.

### Alteracao em `src/hooks/useMenuConfig.tsx`

Linha 93-99 - mudar de:

```typescript
academy: [
  'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
  'meu_progresso_conteudo', 'meu_progresso_entregas',
  ...
],
```

Para:

```typescript
academy: [
  'meu_progresso_visao_geral', 'meu_progresso_roadmap',
  'meu_progresso_conteudo', 'meu_progresso_entregas',
  ...
],
```

### Resultado esperado

No ambiente Academy, o menu lateral mostrara:

```
Meu Progresso
  ├── Minha Evolucao
  ├── Meu Diagnostico
  └── Minhas Duvidas
```

Os submenus Business (`Visao Geral`, `Roadmap`, `Conteudo`, `Entregas`) continuam ocultos tanto pela lista `hiddenByEnvironment` quanto pelo `planos_permitidos` no banco.

## Arquivo alterado

- `src/hooks/useMenuConfig.tsx` - remover `meu_progresso` da lista de ocultos do ambiente academy

