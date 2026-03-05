

# Processos Mapeados — Formato tabela com limite de 2 e "Ver mais"

## Mudança

Substituir o layout de cards grid por uma **tabela** clean com colunas: Tipo (ícone), Título, Descrição, Ação (botão Acessar/Baixar).

- Mostrar no máximo **2 linhas** por padrão
- Botão **"Ver mais"** aparece quando há mais de 2 processos, expandindo para mostrar todos
- Estado expandido controlado por `useState<boolean>`
- Empty state: tabela com 2 linhas placeholder em `opacity-50`

## Arquivo
- **Editar:** `src/pages/MeuSistemaEntregas.tsx`
  - Adicionar `const [showAllProcessos, setShowAllProcessos] = useState(false)`
  - Lines 91-167: Substituir grid de cards por tabela HTML estilizada com Tailwind
  - Slice `processos.slice(0, showAllProcessos ? processos.length : 2)`
  - Botão "Ver mais (N)" abaixo da tabela quando `processos.length > 2`

