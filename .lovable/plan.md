

# MomentumScore — hook + card no Dashboard

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/hooks/useMomentumScore.ts` | Criar — hook com cálculo de score 0-100 baseado em localStorage |
| `src/components/dashboard/MomentumCard.tsx` | Criar — card condicional (coral < 40, verde > 80, null 40-80) |
| `src/pages/Dashboard.tsx` | Editar — importar e inserir `<MomentumCard />` após `<WelcomeHeader />` na section (linha ~72) |

## Detalhes

1. **useMomentumScore.ts**: Implementação exata conforme especificado — registra acesso, filtra 30 dias, calcula ptsDias + ptsFreq + ptsTend, retorna score 0-100.

2. **MomentumCard.tsx**: Usa `useAuth` para obter `user.id`, chama `useMomentumScore`. Renderiza card com Tailwind:
   - `score < 40`: fundo coral (`bg-red-500/10 border-red-500/30`), texto "Que tal retomar hoje?", botão "Continuar" que navega para `/trilhas`
   - `score > 80`: fundo verde (`bg-primary/10 border-primary/30`), texto "Você está em ótimo ritmo!", mostra acessos da semana
   - `score 40-80` ou `null`: `return null`

3. **Dashboard.tsx**: Inserir `<MomentumCard />` logo após `<WelcomeHeader />` dentro da `<section>` existente (linha 72). Nenhuma outra alteração.

