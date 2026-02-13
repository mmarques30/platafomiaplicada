

# Correcao de Contraste de Texto nos Cards do Painel Lider

## Problema

No modo escuro da aplicacao, tanto os cards pretos quanto os cards com fundo verde transparente (accent) acabam tendo textos com baixo contraste. Os cards accent precisam de textos mais escuros (para parecerem cards "claros"), e os cards pretos precisam de textos mais brilhantes/claros.

## Solucao

### Arquivo: `src/components/skills/performance/KPICard.tsx`

Ajustar o objeto `variantStyles`:

**Cards `dark` (fundo preto):**
- Titulo: manter `text-white/70` (ja claro)
- Valor: manter `text-white` (ja claro)
- Subtitulo: mudar de `text-white/50` para `text-white/60` (um pouco mais visivel)
- Icone: manter `text-[#9EB038]` (verde vibrante)

**Cards `accent` (fundo verde transparente):**
- Aumentar opacidade do fundo de `/10` para `/15` para que o card pareca mais "claro"
- Titulo: mudar de `text-foreground/70` para `text-[#1a1a1a]` (escuro fixo, independente do tema)
- Valor: mudar de `text-foreground` para `text-[#0D0D0D]` (preto fixo)
- Subtitulo: mudar de `text-muted-foreground` para `text-[#3a3a3a]` (cinza escuro fixo)
- Icone: mudar para `text-[#6B7A20]` (verde mais escuro para contraste no fundo claro)
- Trend: ajustar para `text-[#5a6a1a]`

### Arquivo: `src/components/skills/ProjetoSkillsPerformance.tsx`

**Card de Filtros (accent):**
- Ajustar fundo de `bg-[#9EB038]/5` para `bg-[#9EB038]/15` para consistencia com os cards accent

### Resultado esperado

- Cards pretos: textos brancos brilhantes com boa legibilidade
- Cards verdes (accent): fundo verde translucido mais visivel com textos escuros, criando contraste claro entre os dois tipos de card
