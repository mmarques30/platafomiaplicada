

# Ocultar "Meu Progresso" completo no Business iAplicada

## Problema

No `business_iaplicada`, o pai `meu_progresso` esta na lista de ocultos, porem os submenus `meu_progresso_visao_geral`, `meu_progresso_roadmap` e `meu_progresso_entregas` nao estao. Dependendo de como a sidebar renderiza, esses itens podem aparecer mesmo sem o pai.

## Solucao

Adicionar todos os submenus de "Meu Progresso" na lista `hiddenByEnvironment` do `business_iaplicada`:

### Alteracao em `src/hooks/useMenuConfig.tsx`

Linha 87-94 - adicionar os submenus faltantes:

```typescript
business_iaplicada: [
  'trilhas', 'trilhas_skills', 'calendario',
  'evolucao', 'meu_diagnostico', 'minhas_duvidas',
  'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
  'meu_progresso_conteudo', 'meu_progresso_entregas',
  'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas', 'skills_painel_lider',
  'projeto_skills', 'projeto_skills_visao_geral', 'projeto_skills_performance', 'projeto_skills_diagnostico', 'projeto_skills_projetos',
  'comunidade', 'comunidade_feed', 'comunidade_sala',
  'squad', 'squad_lider'
],
```

## Arquivo alterado

- `src/hooks/useMenuConfig.tsx` - adicionar `meu_progresso_visao_geral`, `meu_progresso_roadmap` e `meu_progresso_entregas` na lista de ocultos do ambiente `business_iaplicada`

