
# Fallback para businessUserId no WelcomeHeader

## Alteração

**Arquivo**: `src/components/dashboard/WelcomeHeader.tsx`

Linha 68: trocar `const businessUserId = useBusinessUserId();` por:

```ts
const rawBusinessUserId = useBusinessUserId();
const businessUserId = rawBusinessUserId ?? user?.id;
```

Os console.logs e toda a lógica restante permanecem iguais — apenas o valor de `businessUserId` ganha fallback para `user?.id`.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editado — fallback no businessUserId |
