

# RitmoCard — card de ritmo semanal na aba Evolução

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/evolucao/RitmoCard.tsx` | Criar — card com cálculo de ritmo semanal |
| `src/pages/Evolucao.tsx` | Editar — inserir `<RitmoCard />` após `<VitrineConquistas />` (linha 66) |

## Detalhes técnicos

### RitmoCard.tsx
- `useQuery` busca `progresso_videos` do usuário com `completado = true`, select `id, created_at`
- Agrupa por número da semana (últimas 8 semanas) usando `Date` arithmetic
- `atualMedia` = média módulos/semana das últimas 2 semanas
- `baseMedia` = média módulos/semana das semanas 3-8
- `variacaoPct = baseMedia > 0 ? Math.round(((atualMedia - baseMedia) / baseMedia) * 100) : 0`
- Se menos de 3 semanas com dados: `return null`
- Layout: `Card` com `border-t-[3px]` colorida (verde/coral/cinza conforme variação), label "SEU RITMO", valor `{atualMedia} módulos/semana`, badge de variação
- Badge: `> +15%` verde com `↑`, `< -15%` coral com `↓`, else cinza com `→ Ritmo estável`

### Evolucao.tsx
- Import `RitmoCard` e inserir `<RitmoCard />` após `<VitrineConquistas />` na aba "minha-evolucao"

