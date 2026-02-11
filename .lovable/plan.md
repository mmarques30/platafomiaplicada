

# Bloquear Diagnostico Academy para Usuarios Skills

## Problema
Usuarios Skills conseguem acessar o diagnostico Academy de duas formas:
1. Via rota `/meu-diagnostico` -- que redireciona para `/diagnostico/painel` (painel Academy) porque nao ha guard para Skills
2. Via acesso direto a `/diagnostico/painel` ou `/diagnostico/formulario` -- nenhuma dessas paginas bloqueia Skills

O diagnostico Academy e o diagnostico Skills sao experiencias completamente diferentes e nao devem ser misturados.

## Solucao

### 1. `src/pages/MeuDiagnostico.tsx`
Adicionar guard para Skills antes do fallthrough para Academy:
- Apos o check de `isBusiness`, adicionar check para `effectivePlan === 'skills'`
- Redirecionar Skills para `/skills/projeto/diagnostico` (a pagina de diagnostico propria do Skills)

### 2. `src/pages/DiagnosticoPainelAcademy.tsx`
Adicionar guard no useEffect para redirecionar Skills:
- Checar `effectivePlan` e se for `skills`, redirecionar para `/skills/projeto/diagnostico`

### 3. `src/pages/MentoriaDiagnostico.tsx`
Adicionar guard para bloquear Skills de acessar o formulario Academy:
- Checar `effectivePlan` e se for `skills`, redirecionar para `/skills/projeto/diagnostico`

## Detalhes Tecnicos

### MeuDiagnostico.tsx - Adicionar guard Skills
```typescript
// Apos o check de isBusiness:
// Skills -> diagnostico Skills (nao Academy)
if (effectivePlan === 'skills') {
  hasRedirected.current = true;
  navigate('/skills/projeto/diagnostico', { replace: true });
  return;
}
```

### DiagnosticoPainelAcademy.tsx - Adicionar guard Skills
Importar `effectivePlan` do hook `useEffectivePlan` (ja importado, so nao desestruturado) e adicionar no useEffect:
```typescript
if (effectivePlan === 'skills') {
  navigate('/skills/projeto/diagnostico', { replace: true });
  return;
}
```

### MentoriaDiagnostico.tsx - Adicionar guard Skills
Similar ao painel, adicionar verificacao de plano Skills e redirecionar.

### Impacto
- Usuarios **Academy**: continuam acessando normalmente o diagnostico Academy
- Usuarios **Skills**: sao redirecionados para seu proprio diagnostico em `/skills/projeto/diagnostico`
- Usuarios **Business**: ja estao corretamente redirecionados para `/mentoria/diagnostico`
- Nenhuma mudanca de banco de dados necessaria
