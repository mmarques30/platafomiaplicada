

# BriefingSemanal — card semanal no Dashboard

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/BriefingSemanal.tsx` | Criar |
| `src/pages/Dashboard.tsx` | Editar — inserir após `<WelcomeHeader />` (linha 83) |

## Detalhes técnicos

### BriefingSemanal.tsx
1. Verificação de exibição: `ehSegunda` (day === 1) + `jaViu` via localStorage com chave `briefing_{uid}_semana_{weekNum}`
2. `getWeekNumber` helper conforme especificado pelo usuário
3. `useEffect` com `supabase.functions.invoke('gerar-curadoria-semanal', { body: { tipos: ['noticia'] } })` — usa token autenticado automaticamente
4. Se erro (403 para não-admins, ou qualquer falha): return null silenciosamente
5. Loading: `Skeleton` (3 linhas)
6. Card: `border-l-4 border-[#AFC040]`, label "BRIEFING DA SEMANA" (tracking-widest, uppercase, text-[10px]), título do primeiro item retornado, corpo (resumo)
7. Botão "Entendido": `localStorage.setItem(chave, 'true')` + setState para ocultar

### Dashboard.tsx
- Import `BriefingSemanal`
- Inserir `<BriefingSemanal />` na linha 83, após `<WelcomeHeader />`

Nenhuma outra alteração.

