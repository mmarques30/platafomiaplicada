

# Substituir spinner genérico por PageSkeleton no MainLayout

## Alteração

**Arquivo**: `src/components/layout/MainLayout.tsx`

**Linhas 60–66** — substituir:
```tsx
return (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);
```

Por:
```tsx
return <PageSkeleton variant="dashboard" />;
```

**Import**: Adicionar `import { PageSkeleton } from "@/components/shared/PageSkeleton";` no topo do arquivo.

Nenhuma outra alteração no arquivo.

