
# Corrigir Travamento na Pagina Avaliacao (Skills)

## Problema Identificado

Tres causas estao atuando juntas:

### 1. Race Condition no `useSkillsDiagnostico`
O hook usa `isLoading` do React Query v5, que retorna `false` quando a query esta desabilitada (enquanto auth carrega). Isso faz o componente `ProjetoSkillsDiagnostico` achar que o carregamento terminou antes de ter dados, mostrando o formulario brevemente e potencialmente causando erros.

### 2. `localData` desincronizado no `useSkillsDiagnostico`
O hook retorna `localData` (inicializado como `{}`) em vez dos dados reais da query. O `hasInsight` fica `false` por um breve momento mesmo quando o diagnostico ja tem insight, porque o `useEffect` que sincroniza `localData` com os dados da query roda depois do render.

### 3. Producao com codigo antigo
O cache v12 ja foi configurado mas precisa ser publicado. A producao pode ainda estar servindo codigo com o bug da coluna `nome`.

## Solucao

### Arquivo 1: `src/hooks/useSkillsDiagnostico.ts`
Corrigir o `isLoading` para incluir auth loading e query pending:
- Importar `isPending` da query de diagnostico
- Retornar `isLoading` como `isPending || !effectiveUserId` (verdadeiro ate ter usuario E dados)
- Mudar `hasInsight` para verificar os dados da query diretamente, nao o `localData`

Mudanca especifica:
```typescript
const { data: diagnostico, isLoading: queryLoading, isPending } = useQuery({...});

// isLoading inclui auth loading
const isLoading = isPending || !effectiveUserId;

// hasInsight baseado nos dados da query, nao no localData
const hasInsight = !!diagnostico?.insight_ia;
```

### Arquivo 2: `src/components/skills/ProjetoSkillsDiagnostico.tsx`
Simplificar a logica de estado para evitar flashes:
- Em vez de `useEffect` para definir o estado, calcular o estado diretamente dos dados
- Se `isLoading` → spinner
- Se `diagnostico.completado && hasInsight` → results (direto, sem useEffect)
- Senao → form

Mudanca especifica:
```typescript
// Remover useState/useEffect para state
// Calcular estado derivado
const currentView = isProcessing ? "processing" 
  : (diagnostico?.completado && hasInsight) ? "results" 
  : "form";
```

### Arquivo 3: `vite.config.ts`
Incrementar cache para v13 para garantir que ESTA correcao chegue na producao apos publicar:
- `html-cache-v12` → `html-cache-v13`
- `assets-cache-v12` → `assets-cache-v13`
- `images-cache-v12` → `images-cache-v13`

## Resultado Esperado
- A pagina "Avaliacao" nao ficara mais travada no spinner
- O diagnostico de Erich (completo com insight) mostrara diretamente a tela de resultados com as abas "Minha Analise" e "Analise da Equipe"
- Apos publicar, a producao carregara o codigo corrigido (cache v13)

## Instrucao para o usuario
Apos a implementacao: publique o app e peca ao Erich para fechar e reabrir o app completamente.
