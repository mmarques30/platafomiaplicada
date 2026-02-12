
# Exibir Trilhas Recomendadas com Link para "Aprender"

## Objetivo

Mostrar as trilhas recomendadas nos cards/modais de projetos e entregas do Skills, com botoes/links clicaveis que direcionam o usuario diretamente para a trilha na aba "Aprender" (rota `/trilhas/{trilha_id}`).

## O que muda

### 1. Hook `useSkillsBacklog.ts` -- incluir `trilhas_recomendadas` no tipo

O tipo `BacklogItem` nao inclui `trilhas_recomendadas`. Sera adicionado ao interface e o select ja traz `*` (todos os campos), entao o dado ja vem do banco.

### 2. Modal de detalhes do projeto (`ProjetoDetailModal.tsx`)

Adicionar uma secao "Trilhas Recomendadas" abaixo das tags, exibindo:
- Icone de livro (BookOpen)
- Titulo da trilha
- Badge "Essencial" ou "Recomendado"
- Modulos prioritarios (ex: "Modulos 1, 2, 5")
- Justificativa em texto pequeno
- Botao/link clicavel que navega para `/trilhas/{trilha_id}`

### 3. Card do Kanban de entregas (`KanbanCard.tsx`)

Adicionar um indicador compacto quando a entrega tem `conteudo_suporte`:
- Badge pequeno com icone de livro e quantidade de trilhas vinculadas
- Ao exibir detalhes, links para as trilhas

### 4. Card do Backlog de projetos (`BacklogCard.tsx`)

Adicionar um indicador compacto (icone BookOpen + quantidade) quando o projeto tem trilhas recomendadas, servindo de indicador visual rapido.

## Estrutura dos dados (ja existente no banco)

`backlog_skills.trilhas_recomendadas` (JSONB):
```text
[
  {
    "trilha_id": "uuid",
    "trilha_titulo": "Planilhas - Analise e Insights",
    "prioridade": "essencial",
    "modulos_prioritarios": [1, 2, 5],
    "justificativa": "Necessario para criar analises automatizadas"
  }
]
```

`entregas_skills.conteudo_suporte` (JSONB):
```text
[
  {
    "trilha_id": "uuid",
    "trilha_titulo": "Fundamentos de Automacao",
    "modulos": [3, 4],
    "descricao": "Assistir modulos 3 e 4"
  }
]
```

## Rota de destino

Os links usarao a rota ja existente: `/trilhas/{trilha_id}` -- a mesma usada em toda a plataforma (TrilhaCard, TrilhaCardBloqueavel, etc).

## Detalhes Tecnicos

### Arquivos modificados

1. **`src/hooks/useSkillsBacklog.ts`**
   - Adicionar `trilhas_recomendadas: any[] | null` ao tipo `BacklogItem`

2. **`src/components/skills/backlog/ProjetoDetailModal.tsx`**
   - Importar `BookOpen`, `ExternalLink` de lucide-react e `Link` de react-router-dom
   - Parsear `item.trilhas_recomendadas` (JSONB) como array
   - Renderizar secao com cards por trilha: titulo, badge de prioridade, modulos, justificativa
   - Cada trilha com botao "Assistir" que e um `Link to={/trilhas/${trilha_id}}`

3. **`src/components/skills/backlog/BacklogCard.tsx`**
   - Importar `BookOpen` de lucide-react
   - Mostrar indicador compacto (icone + contagem) quando `item.trilhas_recomendadas?.length > 0`

4. **`src/components/skills/kanban/KanbanCard.tsx`**
   - Verificar `entrega.conteudo_suporte` (JSONB)
   - Mostrar badge compacto com icone BookOpen + quantidade de trilhas quando existir conteudo de suporte
