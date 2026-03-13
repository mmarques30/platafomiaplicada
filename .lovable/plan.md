

# Fix: Erro ao criar usuário com plano Business

## Problema
O log da edge function mostra que `planoMentoria: "business"` está sendo enviado, mas a validação só aceita: `academy`, `skills`, `business_parceria`, `business_sistemas`. Resultado: erro 400.

## Causa
Os labels do PLANOS no `NovoUsuarioModal.tsx` precisam mostrar nomes amigáveis ("Business", "Business iAplicada"), mas os **values** devem permanecer como `business_parceria` e `business_sistemas` para corresponder ao enum do banco de dados.

## Correção

**Arquivo: `src/components/admin/NovoUsuarioModal.tsx`** (linhas 31-32)

Atualizar apenas os labels, mantendo os values corretos:

```tsx
{ value: "business_parceria", label: "Business", description: "Consultoria colaborativa - cliente participa" },
{ value: "business_sistemas", label: "Business iAplicada", description: "iAplicada constrói - cliente acompanha" },
```

Mesma correção no **`src/components/admin/EditUserModal.tsx`** (linhas 61-62) para manter consistência.

