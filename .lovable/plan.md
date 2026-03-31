

# Adicionar botão "Gerar novo report" na página /mentoria/reports

## Alteração

**Arquivo**: `src/pages/MentoriaReports.tsx`

### 1. Imports adicionais
- `useState` do React
- `Sparkles`, `Loader2` do lucide-react
- `supabase` do client
- `useQueryClient` do react-query
- `toast` do use-toast
- `SkeletonCard` do ui/SkeletonCard

### 2. Header com botão (entre a descrição e a lista, linhas 24-27)
Adicionar flex row com título à esquerda e botão "Gerar novo report" à direita (outline, ícone Sparkles). Durante processamento: ícone troca para Loader2 animate-spin, botão disabled.

### 3. Lógica do botão
- `useState` para `isGenerating`
- Ao clicar: chama `supabase.functions.invoke('gerar-report-business', { body: { contrato_id: contrato.id, user_id: businessUserId } })`
- Precisa do `contrato` do hook `useContratosBusiness` (já disponível, basta desestruturar)
- Sucesso: `queryClient.invalidateQueries({ queryKey: ["reports-business"] })` + toast sucesso
- Erro: toast erro + reabilitar botão

### 4. Skeleton durante geração
Quando `isGenerating === true`, renderizar um `<SkeletonCard variant="list" />` no topo da lista de reports existente.

## Arquivos
| Arquivo | Ação |
|---|---|
| `src/pages/MentoriaReports.tsx` | Editado |

Nenhum outro arquivo alterado.

