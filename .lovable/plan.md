

# Corrigir Skills Travado em Producao - Solucao Definitiva

## Problema

Duas causas simultaneas:

### 1. PWA Cache Desatualizado (causa principal em producao)
As versoes de cache no `vite.config.ts` ainda sao `v11`. O Service Worker da producao continua servindo codigo antigo (com o bug `nome` ao inves de `nome_completo`) porque nenhuma versao de cache foi incrementada. Mesmo apos o fix e o deploy, o browser do usuario nao busca o codigo novo.

### 2. Race Condition no Redirecionamento das Sub-paginas
Os componentes `ProjetoSkillsDiagnosticoPage` e `ProjetoSkillsProjetosPage` usam `useEffect` para redirecionar quando `equipeId` e null. No React Query v5, quando a query esta desabilitada (`enabled: false`), `isPending` retorna `true`, mas ha um breve instante durante a transicao onde `isLoading` pode ser `false` antes do `equipeId` resolver, causando redirect prematuro para `/skills/projeto`.

## Solucao

### Arquivo 1: `vite.config.ts`
Incrementar TODAS as versoes de cache do PWA:
- `html-cache-v11` para `html-cache-v12`
- `assets-cache-v11` para `assets-cache-v12`
- `images-cache-v11` para `images-cache-v12`

Isso forca o Service Worker a descartar caches antigos e servir o codigo corrigido na proxima abertura do app.

### Arquivo 2: `src/pages/skills/ProjetoSkillsDiagnosticoPage.tsx`
Substituir o padrao `useEffect` + `navigate()` por `Navigate` declarativo do React Router:
- Remover imports de `useEffect` e `useNavigate`
- Adicionar import de `Navigate`
- Enquanto `isLoading`, mostrar spinner
- Quando `!equipeId`, retornar `<Navigate to="/skills/projeto" replace />`
- Senao, renderizar conteudo

### Arquivo 3: `src/pages/skills/ProjetoSkillsProjetosPage.tsx`
Mesma correcao: trocar `useEffect` + `navigate()` por `Navigate` declarativo.

## Resultado Esperado
- Apos publicar, o app de producao servira o codigo corrigido (cache v12 invalida o v11)
- As sub-paginas nao redirecionarao prematuramente durante o carregamento
- O spinner aparece apenas enquanto dados estao carregando de verdade

## Instrucao para o usuario
Apos o deploy: feche completamente o app no celular/browser e reabra. A nova versao sera carregada automaticamente.

