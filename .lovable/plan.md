

# Mensagem de boas-vindas automática no MarIAnaChatDrawer

## Alteração

**Arquivo**: `src/components/shared/MarIAnaChatDrawer.tsx`

1. **Imports**: Adicionar `useUserProfile` e `useEffectivePlan` + `useUserRole`
2. **Hooks**: No componente, obter `profile` via `useUserProfile()`, `isAdmin`/`isLoading` via `useUserRole()`, e `effectivePlan` via `useEffectivePlan(isAdmin, isLoading)`
3. **Nome**: `const firstName = profile?.nome_completo?.split(' ')?.[0] ?? 'por aqui'`
4. **useEffect de boas-vindas**: Após o useEffect que injeta proactiveMessage (linha 67-71), adicionar novo useEffect que:
   - Verifica `!isLoadingHistory && messages.length === 0 && user && !localStorage.getItem(\`mariana_iniciada_\${user.id}\`)`
   - Monta mensagem baseada em `effectivePlan`:
     - `business_parceria` ou `business_sistemas`: mensagem Business
     - `skills`: mensagem Skills
     - Default (Academy): mensagem Academy
   - Seta `setMessages([{ role: "assistant", content: msg }])`
   - Seta `localStorage.setItem(\`mariana_iniciada_\${user.id}\`, 'true')`
   - Não salva no banco
5. **Prioridade**: A mensagem proativa (mentoria) tem prioridade — o useEffect de boas-vindas só roda se `messages.length === 0` (proactive já teria populado se aplicável)

### Nenhuma outra alteração — envio, histórico, edge function, layout intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/shared/MarIAnaChatDrawer.tsx` | Editado — useEffect de boas-vindas condicional por plano |

