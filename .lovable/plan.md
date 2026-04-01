

# Substituir layout do AcademyRoadmapEducacional por 4 cards visuais conectados

## Alteração

**Arquivo**: `src/components/mentoria/AcademyRoadmapEducacional.tsx`

### Dados (derivados dos hooks existentes)

| Variável | Fonte |
|---|---|
| `diagnosticoPreenchido` | `formulario?.completado === true` (já existe como `diagnosticoCompleto`) |
| `diagnosticoData` | `formulario?.updated_at` formatado |
| `modulosConcluidos` | `allTrilhas.filter(t => t.percentual === 100).length` |
| `totalModulos` | `allTrilhas.length` |
| `conquistasCount` | `totalVideos + certificadosEmitidos.length + totalProjetos` (soma das conquistas existentes) |
| `certificadoEmitido` | `certificadosEmitidos.length > 0` |

### JSX — substituir todo o bloco `return` (linhas 62-251)

Renderizar um `grid grid-cols-1 sm:grid-cols-2 gap-4` com 4 cards, cada um contendo:
- Label "Estágio XX" em `text-[11px] uppercase tracking-wider`
- Icone Lucide (ClipboardList, BookOpen, Trophy, Award) com cor condicional (emerald se concluído, amber se atual, muted se próximo)
- Título do estágio
- Badge de status (Concluído / Em andamento / Pendente)
- Meta text descritivo

### Conectores visuais
Linha horizontal entre cards no desktop (`hidden sm:block` divider entre cols) e linha vertical no mobile (border-left ou pseudo-element).

### Imports
- Trocar `ClipboardCheck` por `ClipboardList`
- Remover imports não utilizados (`Clock`, `ArrowRight`, `Flame`, `Star`, `Target`, `Button`, `ProgressBar`, `useCountUp`, `useSequenciaEstudo`, `useNavigate`, `CheckCircle2`)
- Manter `BookOpen`, `Trophy`, `Award`, `Badge`, `Card`, `CardContent`, `Skeleton`

### Hooks mantidos (sem alteração)
`useMentoriaForm`, `useProgressoCertificados`, `useMinhaEvolucao`, `useMeusCertificados`

### Nenhuma outra alteração — outros componentes, auth, roles, planos intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/mentoria/AcademyRoadmapEducacional.tsx` | Editado — layout de 4 seções → 4 cards visuais conectados |

