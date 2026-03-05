

# Adicionar campo `nome_empresa` ao formulário admin e incluí-lo no save

## Problema
O formulário de contrato no admin (`ContratoBusinessManager`) não possui o campo `nome_empresa`. Apenas `razao_social` existe. Quando você edita a razão social e salva, o valor é persistido, mas o título na página "Meu Projeto" usa `nome_empresa || razao_social`. Como `nome_empresa` é sempre `null`, sempre cai no `razao_social`.

Se você atualizou o nome e ele não mudou, pode ser que o save não tenha sido executado com sucesso, ou o campo editado não correspondeu ao que aparece no título.

## Solução
Adicionar o campo `nome_empresa` (Nome Fantasia / Nome de Exibição) ao formulário admin na seção "Contratante", e incluí-lo no `handleSave`. Assim o admin pode definir um nome curto para exibição no título do projeto.

### Alterações

1. **`src/components/admin/business/ContratoBusinessManager.tsx`**:
   - Adicionar `nome_empresa: ""` ao estado `dadosContratante`
   - Preencher `nome_empresa` no `useEffect` que carrega dados do contrato
   - Adicionar input "Nome da Empresa (exibição)" na seção Contratante
   - Incluir `nome_empresa` no objeto `data` do `handleSave`

2. **`src/hooks/useContratoBusinessMutations.tsx`**:
   - Adicionar `nome_empresa` ao tipo `ContratoBusinessInput` (opcional)

Isso permitirá que o admin defina o nome que aparece no título "Projeto [Nome]".

