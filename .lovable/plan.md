

# Renomear título para "Projeto [Empresa]"

O `contrato.nome_empresa` já é buscado do banco de dados via `useContratosBusiness`, que usa o `businessUserId` do usuário logado. O nome da empresa já aparece dinamicamente. Basta trocar o texto.

## Alterações em `src/pages/MeuSistema.tsx`

1. **Linha 52** (fallback sem contrato): `"Meu Sistema"` → `"Meu Projeto"`
2. **Linha 65** (título principal): `` `Gestão ${contrato.nome_empresa || "Sistema"}` `` → `` `Projeto ${contrato.nome_empresa || ""}` ``
3. **Linha 69** (subtítulo): `"...do seu sistema..."` → `"...do seu projeto..."`

3 linhas, 1 arquivo.

