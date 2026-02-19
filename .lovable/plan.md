

# Remover Badges "Gerado por IA" das Telas do Usuario

## Contexto

Atualmente, badges como "Gerado por IA", icones de raio (Zap) e badges "IA/Manual" aparecem em diversas telas visiveis para o usuario comum. A informacao de origem (IA vs manual) deve ser visivel **somente para administradores** na area Mentoria > Skills.

## Arquivos a alterar (telas do usuario)

### 1. `src/components/mentoria/ObjetivosGerados.tsx`
- **Remover** o badge "Gerado por IA" (linhas 73-77) que aparece quando `objetivo.gerado_por_ia` e true
- Substituir por um badge "Diagnostico" fixo no mesmo local, indicando que o objetivo veio do diagnostico

### 2. `src/components/mentoria/business/InstrucaoCard.tsx`
- **Remover** o badge "IA" (linhas 112-114) que aparece quando `instrucao.gerado_por_ia` e true
- Substituir por badge "Diagnostico"

### 3. `src/components/skills/backlog/BacklogCard.tsx`
- **Remover** o icone Zap amarelo (linha 89) que indica `item.origem === "ia"`
- Nao substituir por nada (o card ja tem informacoes suficientes)

### 4. `src/components/skills/backlog/BacklogTable.tsx`
- **Remover** o icone Zap amarelo (linha 68) na coluna Titulo que indica `item.origem === "ia"`

### 5. `src/components/skills/backlog/ProjetoDetailModal.tsx`
- **Remover** o icone Zap amarelo no titulo (linha 141)
- **Remover** o badge "Gerado por IA" / "Manual" (linhas 189-193)
- Substituir o badge por "Diagnostico" quando a origem for "ia"

### 6. `src/components/skills/ProjetoSkillsEntregas.tsx`
- **Remover** a coluna "Origem" da tabela de entregas (linhas 374-378) que mostra badges "IA" ou "Manual"
- Remover o TableHead correspondente

## Arquivos que NAO serao alterados (admin)

Os seguintes arquivos ficam em areas administrativas e devem **manter** as indicacoes de IA:
- `src/components/admin/business/ReportsBusinessManager.tsx`
- `src/components/admin/business/InstrucoesBusinessManager.tsx`
- `src/components/admin/business/GeracaoEntregasModal.tsx`
- `src/components/admin/business/UploadTranscricaoModal.tsx`
- `src/components/admin/skills/GerarReportSkillsModal.tsx`
- `src/components/admin/mentoria/ProjetosIAAdmin.tsx`

## Detalhes tecnicos

| Arquivo | Acao |
|---|---|
| `ObjetivosGerados.tsx` | Remover condicional `gerado_por_ia`, colocar badge "Diagnostico" fixo |
| `InstrucaoCard.tsx` | Remover badge "IA", colocar badge "Diagnostico" |
| `BacklogCard.tsx` | Remover icone Zap (linha 89) |
| `BacklogTable.tsx` | Remover icone Zap (linha 68) |
| `ProjetoDetailModal.tsx` | Remover Zap do titulo e badge "Gerado por IA"/"Manual", mostrar "Diagnostico" se origem=ia |
| `ProjetoSkillsEntregas.tsx` | Remover coluna "Origem" inteira da tabela |

