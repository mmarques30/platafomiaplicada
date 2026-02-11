
# Remover Botao "Atualizar App" da Tela de Auth

## Alteracao unica

### `src/pages/Auth.tsx`
- Remover os imports `forceFullAppReload` e `RefreshCw` (linhas 6-7)
- Remover o bloco `motion.button` "Atualizar App" (linhas 124-131)

O TopHeader ja possui esse botao dentro do sistema, entao nao ha necessidade de duplica-lo na tela de login.
