

# Correção: Meu Progresso diferente por ambiente + race condition Skills

## Regra de negócio correta

| Menu | Gratuito | Academy | Skills | Business | Business iAplicada |
|------|----------|---------|--------|----------|-------------------|
| Meu Progresso (grupo) | Oculto | Oculto | Oculto | Visível (Visão Geral, Roadmap, Conteúdo) | Visível (Visão Geral, Roadmap, Entregas) |
| Evolução / Diagnóstico / Dúvidas (itens soltos) | Oculto | Visível | Oculto | Oculto | Oculto |
| Projeto Skills | Oculto | Oculto | Visível | Oculto | Oculto |

O Academy NÃO usa o grupo "Meu Progresso" — ele usa itens individuais (Evolução, Diagnóstico, Dúvidas). O grupo expandível "Meu Progresso" é exclusivo do Business.

## Problemas atuais

1. **Gratuito**: não tem entrada em `hiddenByEnvironment`, então "Meu Progresso" (pai) aparece
2. **Academy**: não oculta o grupo "Meu Progresso" (pai + 4 filhos), então aparece um grupo vazio ou com itens errados
3. **Skills**: race condition no `useSkillsMembro` faz Projeto Skills sumir temporariamente para líderes

## Alterações

### Arquivo 1: `src/hooks/useMenuConfig.tsx`

**Adicionar entrada `gratuito`** ao `hiddenByEnvironment`:
```
gratuito: [
  'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
  'meu_progresso_conteudo', 'meu_progresso_entregas',
  'evolucao', 'meu_diagnostico', 'minhas_duvidas',
  'projeto_skills', 'projeto_skills_visao_geral',
  'projeto_skills_performance', 'projeto_skills_diagnostico',
  'trilhas_skills', 'skills_minha_equipe', 'skills_backlog',
  'skills_roadmap', 'skills_entregas', 'skills_painel_lider',
  'squad', 'squad_lider'
],
```

**Adicionar ao `academy`** o grupo Meu Progresso (pai + 4 filhos) — Academy usa evolução/diagnóstico/dúvidas soltos, não o grupo:
```
academy: [
  'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
  'meu_progresso_conteudo', 'meu_progresso_entregas',
  'projeto_skills', 'projeto_skills_visao_geral',
  'projeto_skills_performance', 'projeto_skills_diagnostico',
  'squad', 'squad_lider'
],
```

As listas de `skills`, `business` e `business_iaplicada` permanecem como estão (já estão corretas).

### Arquivo 2: `src/hooks/useSkillsMembro.ts`

Trocar `isLoading` por `isPending` do React Query na linha 28. Isso corrige a race condition onde `isLider` retorna `false` prematuramente porque a query está habilitada mas ainda buscando dados:

```typescript
// Antes
const { data, isLoading } = useQuery({ ... });

// Depois
const { data, isPending } = useQuery({ ... });
```

O retorno `isLoading` do hook continua usando `isPending || authLoading || roleLoading`, garantindo que o `SkillsAdminGuard` espere o dado real antes de redirecionar.

## Resumo

- 2 arquivos modificados, nenhuma alteração no banco de dados
- "Meu Progresso" (grupo): visível apenas em Business e Business iAplicada
- Evolução/Diagnóstico/Dúvidas (soltos): visíveis apenas no Academy
- Gratuito: nenhum desses menus aparece
- Projeto Skills para de sumir temporariamente para líderes

