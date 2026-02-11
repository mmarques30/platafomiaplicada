
# Corrigir Abas Skills Travadas - Causa Raiz Encontrada

## Causa Raiz

O hook `useSkillsEquipe.ts` faz uma query que referencia a coluna `profiles.nome`, que **nao existe** no banco de dados. A coluna correta e `nome_completo`. Isso causa o erro no Postgres: `column profiles_1.nome does not exist`.

Esse erro faz com que a query falhe silenciosamente, mantendo a pagina `/skills/equipe` presa no spinner infinito. Como essa pagina e o ponto de entrada principal dos usuarios Skills (via redirecionamento da Mentoria e do menu lateral), o usuario fica travado.

## Arquivo afetado

### `src/hooks/useSkillsEquipe.ts`

**Linha 40** - Na query do Supabase, o campo `nome` esta errado:
```
profiles:user_id (
  id,
  nome,          <-- ERRADO
  avatar_url
)
```
Deve ser:
```
profiles:user_id (
  id,
  nome_completo,  <-- CORRETO
  avatar_url
)
```

**Linha 63** - O mapeamento tambem referencia o campo errado:
```
nome: m.profiles?.nome || "Usuario"
```
Deve ser:
```
nome: m.profiles?.nome_completo || "Usuario"
```

## Evidencia

Os logs do Postgres mostram exatamente esse erro no momento em que o usuario tenta acessar:
```
ERROR: column profiles_1.nome does not exist
```

## Resultado esperado

Apos a correcao, a pagina `/skills/equipe` carregara normalmente, exibindo os membros da equipe com seus nomes corretos. Os usuarios Skills nao ficarao mais presos no spinner infinito ao acessar a plataforma.
