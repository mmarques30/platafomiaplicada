

# Remover console.log em produção via esbuild

## Resumo
Adicionar configuração `esbuild.drop` no `vite.config.ts` para remover automaticamente `console.*` e `debugger` em builds de produção.

## Arquivo

| Arquivo | Ação |
|---|---|
| `vite.config.ts` | Editar |

## Detalhes

Após o bloco `optimizeDeps` (linha ~111), adicionar:

```ts
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
},
```

Usa a variável `mode` já disponível no callback `defineConfig(({ mode }) => ...)`, sem precisar de `process.env.NODE_ENV`.

Nenhuma outra alteração.

