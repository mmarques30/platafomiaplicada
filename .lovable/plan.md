

# Skeleton Loading para paginas autenticadas

## Problema
Durante 2-3s de carregamento, as paginas mostram tela preta (spinner pequeno ou nada). Precisamos de skeletons que simulem o layout real.

## Solucao
Criar um componente reutilizavel `PageSkeleton` com variantes por pagina, e substituir os spinners atuais.

### 1. Criar `src/components/shared/PageSkeleton.tsx`
Componente com variantes: `dashboard`, `trilhas`, `calendario`, `evolucao`. Usa `Skeleton` existente com classes customizadas (`bg-white/5` ou `bg-zinc-800/50`) para manter identidade visual escura.

Cada variante simula o layout real:
- **Dashboard**: header welcome (titulo + subtitulo), card grande central de conteudo, ticker de ranking
- **Trilhas**: titulo, grid de 3 cards com imagem placeholder + texto
- **Calendario**: titulo + tabs, card grande de calendario, card de proximo encontro
- **Evolucao**: titulo, tabs, card hero, grid de cards de trilhas

### 2. Atualizar `src/pages/Dashboard.tsx`
- Substituir o spinner `loadingRole` (linhas 33-38) por `<PageSkeleton variant="dashboard" />`

### 3. Atualizar `src/pages/Trilhas.tsx`
- Adicionar estado de loading com `loadingRole` mostrando `<PageSkeleton variant="trilhas" />`

### 4. Atualizar `src/components/calendario/CalendarioAulas.tsx`
- Substituir o `Loader2` spinner (linhas 11-16) por skeleton de cards de aula

### 5. Atualizar `src/pages/Evolucao.tsx`
- Adicionar guard `roleLoading` com `<PageSkeleton variant="evolucao" />`

## Detalhes tecnicos
- Skeleton base: `bg-white/5 animate-pulse rounded-lg` (fundo escuro com pulse)
- Cards skeleton: `bg-zinc-900/50 border border-white/5 rounded-xl`
- Nao muda nenhuma logica de dados, apenas o estado visual durante loading
- Arquivos: 1 novo + 4 editados

