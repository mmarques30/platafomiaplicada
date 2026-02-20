

# Icones Animados por Classificacao nas Trilhas

## Resumo

Tres etapas: preencher classificacoes no banco, criar componente de icones animados, integrar abaixo do carrossel.

## 1. Banco de Dados -- Preencher classificacoes

Executar 5 UPDATEs para atribuir classificacoes as 22 trilhas:

- **Aprendizado Inicial** (2): Como Usar a Plataforma IAplicada, Fundamentos de IA
- **Produtividade** (7): Planilhas x2, Comunicacao com IA, Claude Avancado, Dashboard/BI, Manus, Apresentacoes (Gamma)
- **Automacao** (4): Fundamentos de Automacao, Zapier, Make, Apps Web sem Codigo
- **Carreira** (7): IA para Carreira, Recolocacao, Vendas, Marketing, RH, Gestao de Projetos, Financas
- **Rotina** (2): Gravacoes Aulas Semanais, Conteudos BONUS

## 2. Novo Componente: `ClassificacaoIcons.tsx`

Arquivo: `src/components/dashboard/ClassificacaoIcons.tsx`

- Linha horizontal com 5 icones animados usando `framer-motion`
- Animacoes continuas (sempre rodando, estilo do exemplo de referencia):
  - BookOpen com sparkles pulsantes (Aprendizado Inicial)
  - Zap com scale bounce (Produtividade)
  - Cog com rotacao 360 continua (Automacao)
  - Rocket com float vertical (Carreira)
  - Clock com rotacao interna (Rotina)
- Cores da marca (tons de primary/verde)
- Label discreto abaixo de cada icone
- Clique ativa/desativa filtro de classificacao
- Icone ativo: fundo primary/15, borda primary/30

## 3. Integracao no `TodasAsTrilhas.tsx`

- Importar e renderizar `ClassificacaoIcons` logo apos o carrossel (linha ~195)
- Passar `classificacaoFiltro` e `setClassificacaoFiltro` como props
- Clicar no icone ja ativo volta para "todas"

Layout:
```text
[Filtros (pills verdes)]
[Carrossel de Cards]
[Faixa de icones animados]  <-- NOVO
```

## Secao Tecnica

### Arquivos

| Arquivo | Acao |
|---|---|
| `src/components/dashboard/ClassificacaoIcons.tsx` | Criar |
| `src/components/dashboard/TodasAsTrilhas.tsx` | Editar (adicionar import + componente apos carrossel) |

### Dados

22 registros na tabela `trilhas` atualizados via UPDATE (campo `classificacao`)

### Props do componente

```text
ClassificacaoIcons {
  classificacoes: string[]
  activeFilter: string
  onSelect: (cls: string) => void
}
```

### Mapeamento icone-classificacao

```text
"Aprendizado Inicial" -> BookOpen + sparkle-pulse
"Produtividade"       -> Zap + energy-bounce
"Automacao"           -> Cog + rotate-360
"Carreira"            -> Rocket + float-up
"Rotina"              -> Clock + tick-rotate
Fallback              -> Sparkles + pulse
```

