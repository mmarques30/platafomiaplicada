
# Aplicar cores da marca no Gantt

## Problema
O Gantt usa cores genericas do tema (`bg-muted/30`, `border-border`, `hsl(var(--primary))`) em vez da paleta da marca IAplicada, ficando desconectado visualmente do resto da pagina.

## Solucao

Arquivo: `src/components/meu-sistema/GanttEntregas.tsx`

### 1. STATUS_CONFIG - usar cores da marca
- `concluida`: manter `#738925` (brand 900)
- `em_andamento`: trocar `hsl(var(--primary))` para `#889C2D` (brand 800) 
- `pendente`: manter `#D4A017` (amber)
- `cancelada`: trocar para `#B91C1C` (vermelho solido)

### 2. Fundo do card principal
- Adicionar borda sutil em brand green: `border` com cor `aplicada-green-300`

### 3. Header da sidebar e month headers
- Trocar `bg-muted/30` para fundo brand off-white `#F6F7E9` (brand 100)
- Texto dos headers em `#2F302B` (aplicada dark) em vez de `text-muted-foreground`

### 4. Group headers dos modulos
- Fundo `#E9EBC6` (brand 200) em vez de `bg-muted/20`
- Texto em `#738925` (brand 900) em vez de `text-muted-foreground`
- Chevron na cor brand 700

### 5. Grid lines e bordas
- Grid lines verticais em brand 200 com opacidade (`#E9EBC640`)
- Bordas entre rows em brand 200

### 6. Today marker
- Trocar de vermelho destructive para brand 900 (`#738925`) com label em verde escuro

### 7. Hover states
- Hover nas rows: fundo `#F6F7E9` (brand 100) em vez de `bg-muted/20`
- Hover na sidebar: mesmo brand 100

### 8. Dialog de detalhes
- Manter neutro (ja funciona bem)

1 arquivo editado: `GanttEntregas.tsx`
