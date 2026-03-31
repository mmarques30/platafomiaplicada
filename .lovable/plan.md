

# Transições de página com Framer Motion

## 1. Novo componente: `src/components/ui/PageTransition.tsx`
Wrapper com `motion.div` usando fade + translateY sutil, duração 150ms, `exit` com fade-out rápido.

## 2. `src/components/layout/MainLayout.tsx`
- Importar `AnimatePresence` e `useLocation`
- Envolver `<Outlet />` com `<AnimatePresence mode="wait">` usando `location.pathname` como key
- Envolver `<Outlet />` dentro de `<PageTransition key={location.pathname}>`

```tsx
const location = useLocation();
...
<AnimatePresence mode="wait">
  <PageTransition key={location.pathname}>
    <Outlet />
  </PageTransition>
</AnimatePresence>
```

## 3. Admin layout: `src/components/admin/AdminLayout.tsx`
Mesma abordagem — envolver o `<Outlet />` com `AnimatePresence` + `PageTransition`.

## Arquivos
- **Novo**: `src/components/ui/PageTransition.tsx`
- **Editados**: `MainLayout.tsx`, `AdminLayout.tsx` (apenas wrapper no Outlet)

