

# Limpar enums legados: plano_mentoria e nivel_acesso_plano

## Situacao atual

Verifiquei o banco de dados e o codigo:

- **plano_mentoria** tem 9 valores: `club, pro, boost, legacy, academy, lab, skills, business, business_iaplicada`
- **nivel_acesso_plano** tem 5 valores: `academy, lab, skills, club, business`
- **Zero usuarios** associados aos planos antigos (club, pro, boost, legacy, lab)
- **Zero conteudos** com nivel_acesso lab ou club
- Os modais de admin ja mostram apenas academy/skills/business — so faltam os enums no banco e referencias residuais no codigo

Nenhuma pessoa sera afetada. Podemos prosseguir com seguranca.

## O que sera feito

### 1. Migracao SQL (banco de dados)

Recriar os dois enums apenas com os valores validos:

- **plano_mentoria**: `academy`, `skills`, `business`, `business_iaplicada`
- **nivel_acesso_plano**: `academy`, `skills`, `business`

Isso envolve: renomear enum antigo → criar novo → migrar colunas → dropar antigo. Tambem atualizar as funcoes `calcular_prazo_sla` e `user_has_access_level` que referenciam valores antigos.

### 2. Codigo (2 arquivos)

| Arquivo | Mudanca |
|---|---|
| `src/components/shared/TrilhaCardBloqueavel.tsx` | Remover condicional `nivel_minimo_acesso === 'club'` (badge Club) |
| `src/components/admin/formularios/DiagnosticoPreviewModal.tsx` | Remover `'legacy'` do tipo `DiagnosticoTipo` |

O arquivo `types.ts` sera regenerado automaticamente apos a migracao.

