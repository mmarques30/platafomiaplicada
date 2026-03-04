

# Renomear Timeline para RoadMap com efeito de scroll animado

## Alteracoes

### 1. Renomear titulo
- De: "Metodologia APLICA — Timeline do Projeto"
- Para: "RoadMap"

### 2. Adicionar efeito de linha vertical animada com scroll (`TimelineEtapas.tsx`)
- Usar `useEffect` + `useRef` + `IntersectionObserver` para detectar quais etapas estao visiveis na tela
- A linha vertical de conexao entre etapas tera duas camadas:
  - Camada base: `bg-border` (cinza)
  - Camada de preenchimento: `bg-primary` que cresce conforme o usuario faz scroll
- Cada nó (circulo) ganha animacao de fade-in ao entrar na viewport
- A linha colorida preenche progressivamente ate o ultimo nó visivel

### 3. Estrutura tecnica
- `useRef` no container da timeline
- `IntersectionObserver` com threshold para detectar cada etapa
- Estado `activeIndex` que rastreia ate qual etapa o scroll chegou
- A linha de preenchimento usa `style={{ height }}` calculado dinamicamente com base na posicao dos nós
- Transicao suave com `transition-all duration-700`
- Cards com `animate-fade-in` ao entrarem na viewport usando classes CSS existentes

### Arquivo editado
- `src/components/meu-sistema/TimelineEtapas.tsx`

