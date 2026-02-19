

# Icones Animados por Classificacao nas Trilhas de Aprendizado

## Contexto

As trilhas atualmente nao possuem classificacoes preenchidas (campo `classificacao` existe mas esta NULL). Vamos:
1. Definir e atribuir classificacoes a todas as 22 trilhas
2. Criar um componente de icones animados horizontais abaixo do carrossel de cards
3. Ao clicar, o filtro de classificacao e ativado automaticamente

## Classificacoes Sugeridas (5 grupos)

| Classificacao | Icone Animado | Trilhas |
|---|---|---|
| Aprendizado Inicial | Livro com brilho pulsante | Como Usar a Plataforma, Fundamentos de IA |
| Produtividade | Raio com pulso energetico | Planilhas (x2), Comunicacao com IA, Claude Avancado, Dashboard/BI, Manus, Apresentacoes (Gamma) |
| Automacao | Engrenagem com rotacao continua | Fundamentos de Automacao, Zapier, Make, Apps Web sem Codigo |
| Carreira | Foguete com animacao de subida | IA para Carreira, Recolocacao, Vendas, Marketing, RH, Gestao de Projetos, Financas |
| Rotina | Relogio com ponteiro animado | Gravacoes Aulas Semanais, Conteudos BONUS |

## Alteracoes

### 1. Banco de Dados -- Atribuir classificacoes (operacao de dados, nao migracao)

Executar UPDATE nas 22 trilhas para preencher o campo `classificacao`:

```sql
UPDATE trilhas SET classificacao = 'Aprendizado Inicial' WHERE titulo IN ('Como Usar a Plataforma IAplicada', 'Fundamentos de IA');
UPDATE trilhas SET classificacao = 'Produtividade' WHERE titulo IN ('Planilhas - Limpeza e Organização', 'Planilhas - Análise e Insights', 'Comunicação com IA', 'Claude Avançado', 'Dashboard e Business Intelligence', 'Manus - Dashboards Profissionais', 'Apresentações Executivas (Gamma)');
UPDATE trilhas SET classificacao = 'Automação' WHERE titulo IN ('Fundamentos de Automação', 'Zapier do Zero ao Avançado', 'Make do Zero ao Avançado', 'Apps Web sem Código');
UPDATE trilhas SET classificacao = 'Carreira' WHERE titulo IN ('IA para Carreira e Liderança', 'IA para Recolocação e Posicionamento', 'IA para Vendas', 'IA para Marketing', 'IA para RH e Pessoas', 'IA para Gestão de Projetos', 'IA para Finanças');
UPDATE trilhas SET classificacao = 'Rotina' WHERE titulo IN ('Gravações Aulas Semanais', 'Conteúdos BÔNUS');
```

### 2. Novo Componente: `ClassificacaoIcons`

Arquivo: `src/components/dashboard/ClassificacaoIcons.tsx`

- Linha horizontal unica com 5 icones animados usando `framer-motion` (ja instalado)
- Cada icone: SVG customizado com animacao continua (sem hover -- sempre animando, como no exemplo de referencia)
- Cores da marca (verde primario em tons variados: `primary`, `primary/70`, `primary/40`)
- Label discreto abaixo de cada icone (nome da classificacao)
- Ao clicar: chama callback `onSelectClassificacao(nome)` que ativa o filtro

Animacoes por icone:
- **Aprendizado Inicial**: Icone `BookOpen` do Lucide com sparkles pulsantes ao redor (scale + opacity loop)
- **Produtividade**: Icone `Zap` com pulso de energia (scale bounce infinito)
- **Automacao**: Icone `Cog` com rotacao continua suave (rotate 360 loop)
- **Carreira**: Icone `Rocket` com movimento sutil de subida (translateY oscilante)
- **Rotina**: Icone `Clock` com ponteiro girando (rotate interno)

### 3. Integracao no `TodasAsTrilhas.tsx`

- Adicionar o componente `ClassificacaoIcons` logo apos o fechamento do carrossel (abaixo dos cards)
- Passar `classificacaoFiltro` e `setClassificacaoFiltro` como props
- O icone ativo tera destaque visual (fundo `primary/15` com borda `primary/30`)
- Clicar no icone ja ativo desativa o filtro (volta para "todas")

Layout final da pagina:
```
[Filtros (pills verdes)]
[Carrossel de Cards 9:16]
[Faixa horizontal de icones animados]  <-- NOVO
```

## Secao Tecnica

### Estrutura do componente

```text
ClassificacaoIcons
  props: {
    classificacoes: string[]           // lista dinamica do banco
    activeFilter: string               // "todas" | nome da classificacao
    onSelect: (cls: string) => void    // callback para setClassificacaoFiltro
  }
```

Mapeamento icone-classificacao via objeto constante:
```text
ICON_MAP = {
  "Aprendizado Inicial": { icon: BookOpen, animation: sparkle-pulse },
  "Produtividade":       { icon: Zap,      animation: energy-bounce },
  "Automação":           { icon: Cog,      animation: rotate-360 },
  "Carreira":            { icon: Rocket,   animation: float-up },
  "Rotina":              { icon: Clock,    animation: tick-rotate },
}
```

Classificacoes nao mapeadas receberao um icone generico (`Sparkles`) com animacao de pulso.

### Arquivos modificados
- `src/components/dashboard/TodasAsTrilhas.tsx` -- adicionar ClassificacaoIcons apos carrossel
- Novo: `src/components/dashboard/ClassificacaoIcons.tsx` -- componente dos icones animados

### Dados atualizados
- 22 registros em `trilhas` terao campo `classificacao` preenchido

