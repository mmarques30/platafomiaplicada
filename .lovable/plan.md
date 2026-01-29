

# Plano: Excluir Formulário Diagnóstico Mentoria (Legacy)

## Problema
O formulário "Diagnóstico Mentoria" (tipo `legacy`) não deve existir, pois não há plano de mentoria legacy no sistema.

## Dados Identificados

| Campo | Valor |
|-------|-------|
| ID | `202cbd89-833f-4013-bd06-4508a4e3df79` |
| Título | Diagnóstico Mentoria |
| Tipo | legacy |
| Categoria | diagnostico |

## Mudanças Necessárias

### 1. Excluir registro do banco de dados
Deletar o registro da tabela `formularios_sistema` com ID `202cbd89-833f-4013-bd06-4508a4e3df79`.

### 2. Limpar código relacionado ao tipo Legacy

**Arquivo: `src/components/admin/formularios/FormulariosDoSistema.tsx`**

| Linha | Ação |
|-------|------|
| 16 | Atualizar tipo para remover `legacy`: `type DiagnosticoTipo = 'academy' \| 'business';` |
| 114-117 | Remover cálculo de `diagnosticosLegacy` |
| 144-147 | Remover estatísticas `diagnostico-legacy` |

**Arquivo: `src/components/admin/formularios/RespostasDiagnosticoDrawer.tsx`**
- Remover caso `legacy` do filtro de plano

**Arquivo: `src/components/admin/formularios/DiagnosticoEstatisticasDrawer.tsx`**
- Remover caso `legacy` do filtro

## Resultado Esperado

Apenas dois cards de diagnóstico aparecerão:
1. Diagnóstico Academy
2. Diagnóstico Business

O código será simplificado, sem referências ao tipo `legacy`.

