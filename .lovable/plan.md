

# Corrigir título "Projeto" para exibir nome da empresa

## Problema
O campo `nome_empresa` está `null` em todos os contratos. O nome da empresa está armazenado no campo `razao_social` do contrato (ex: "J IMOBI GESTÃO E NEGÓCIOS LTDA").

## Solução
No `MeuSistema.tsx`, usar fallback: `contrato.nome_empresa || contrato.razao_social || ""`.

Isso fará com que o título exiba "Projeto J IMOBI GESTÃO E NEGÓCIOS LTDA" corretamente.

### Arquivo alterado
- `src/pages/MeuSistema.tsx` — linha 65: adicionar fallback para `razao_social`
- Também ajustar a condição da linha 67 para mostrar o subtítulo quando `razao_social` existir

1 arquivo, 2 linhas.

