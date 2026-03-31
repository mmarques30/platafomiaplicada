

# Substituir Loader2 por PageSkeleton em páginas de mentoria

As variantes existentes do `PageSkeleton` são: `dashboard`, `trilhas`, `calendario`, `evolucao`. Como não podemos alterar o componente nem criar novos, cada página receberá a variante mais próxima da sua estrutura visual.

## Páginas a alterar (full-page Loader2 → PageSkeleton)

| Arquivo | Variante | Justificativa |
|---------|----------|---------------|
| `BusinessDashboard.tsx` (L123-127) | `dashboard` | KPI cards + gráficos |
| `MentoriaPainelDiagnostico.tsx` (L69-73) | `dashboard` | Painel com cards |
| `MentoriaProjetos.tsx` (L49-53) | `trilhas` | Grid de cards |
| `MentoriaDocumentos.tsx` (L88-92) | `evolucao` | Lista de itens |
| `MentoriaTasksBusiness.tsx` (L218-224) | `evolucao` | Lista de tarefas |
| `MentoriaEtapasBusiness.tsx` (L55-59) | `evolucao` | Lista de etapas |
| `MentoriaInstrucoesBusiness.tsx` (L174-178) | `evolucao` | Lista de instruções |

## Loader2 mantidos (inline em botões/ações) — sem alteração

- `InsightIA.tsx` — botão "Gerando diagnóstico..."
- `DiagnosticoAcademyPanel.tsx` — botões de gerar/atualizar
- `AtividadeModal.tsx` — botão "Salvando..."
- `ProjetoPreparacaoSection.tsx` — botão "Atualizando..."
- `MentoriaDocumentos.tsx` (L189) — botão "Baixando..."
- `AcademyProximoPasso.tsx` — loading parcial dentro de card
- `MentoriaPainelDiagnostico.tsx` (L95-98) — loading dentro de seção de card

## Para cada arquivo

Substituir o bloco `Loader2` de loading full-page por `<PageSkeleton variant="..." />`, importar de `@/components/shared/PageSkeleton`, e remover `Loader2` do import se não for mais usado no arquivo.

## Arquivos editados

`BusinessDashboard.tsx`, `MentoriaPainelDiagnostico.tsx`, `MentoriaProjetos.tsx`, `MentoriaDocumentos.tsx`, `MentoriaTasksBusiness.tsx`, `MentoriaEtapasBusiness.tsx`, `MentoriaInstrucoesBusiness.tsx`

