

# ProgressBar animada com crescimento 0% → valor

## 1. Novo componente: `src/components/ui/ProgressBar.tsx`
Criar conforme especificado — `useState(0)` inicial, `setTimeout` de 80ms para setar o valor real, transição CSS `width` com `transition: all 500ms ease-out`.

## 2. Substituições

### `src/components/mentoria/AcademyRoadmapEducacional.tsx`
- **Linha 152-156**: Trilhas em andamento — substituir `<Progress>` por `<ProgressBar value={trilha.percentual} height={8} showValue={false} />`
- **Linha 220-224**: Próximo objetivo — substituir `<Progress>` por `<ProgressBar value={proximoObjetivo.percentual} height={10} />`
- Remover import de `Progress` (não mais usado)

### `src/components/evolucao/TrilhasEmAndamentoCards.tsx`
- **Linha 101**: Substituir `<Progress value={progresso} className="h-1.5" />` por `<ProgressBar value={progresso} height={6} />`

### `src/components/evolucao/ProgressoCertificados.tsx`
- **Linha 59**: Substituir `<Progress value={trilha.percentual} className="h-2" />` por `<ProgressBar value={trilha.percentual} height={8} />`

### `src/components/evolucao/TrilhaEmAndamentoCard.tsx`
- **Linha 58**: Substituir `<Progress value={progressoPercent} className="h-3" />` por `<ProgressBar value={progressoPercent} height={12} />`

**Nota**: `BusinessVisaoRapida` não existe no código atual — ignorado.

## Arquivos
- **Novo**: `src/components/ui/ProgressBar.tsx`
- **Editados**: `AcademyRoadmapEducacional.tsx`, `TrilhasEmAndamentoCards.tsx`, `ProgressoCertificados.tsx`, `TrilhaEmAndamentoCard.tsx`

