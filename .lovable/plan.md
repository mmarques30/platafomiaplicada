

# Reorganizar Metricas de Diagnostico em Cards Individuais

## Problema Atual
Os itens dentro dos cards "Perfil Mapeado", "Economia Potencial" e "Economia da Equipe" estao exibidos como texto simples em grid, sem separacao visual clara. Falta padrao e organizacao.

## Solucao
Transformar cada metrica em um mini-card individual com borda, padding e fundo sutil, seguindo o padrao visual "accent" ja utilizado no projeto (fundo `bg-[#9EB038]/15` com borda).

## Mudancas

### 1. Perfil Mapeado (`DiagnosticoResults.tsx` - `ProfileItem`)
- Cada item (Cargo, Area, Nivel Tecnico, Disponibilidade) vira um mini-card com borda `border-border`, `rounded-lg`, padding `p-3` e fundo `bg-muted/50`
- Label em cima, valor em baixo com fonte semibold

### 2. Economia Potencial (`DiagnosticoResults.tsx` - secao economia)
- Cada metrica (Horas/semana, Economia estimada, Valor mensal) vira um card individual com o mesmo estilo
- Remover o `text-center` solto e usar cards com padding consistente

### 3. Economia da Equipe (`EquipeConsolidadoView.tsx`)
- Os 2 itens (Total horas manuais, Potencial de economia) tambem viram cards individuais com o mesmo padrao

## Detalhes Tecnicos

### Arquivo `src/components/skills/diagnostico/DiagnosticoResults.tsx`
- Atualizar `ProfileItem` para renderizar dentro de um `div` com classes `rounded-lg border border-border bg-muted/50 p-3`
- Na secao "Economia Potencial", envolver cada metrica em `div` com as mesmas classes de card
- Manter o grid responsivo existente (`grid-cols-2 sm:grid-cols-4` para perfil, `grid-cols-1 sm:grid-cols-3` para economia)

### Arquivo `src/components/skills/diagnostico/EquipeConsolidadoView.tsx`
- Na secao "Economia da Equipe", envolver cada metrica em card individual com `rounded-lg border border-border bg-muted/50 p-4`

