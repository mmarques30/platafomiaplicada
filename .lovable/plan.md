

# BusinessWelcome — passos dinâmicos com dados reais

## Alteração

**Arquivo**: `src/pages/BusinessWelcome.tsx`

1. Adicionar imports de `useContratosBusiness` e `useEtapasBusiness`
2. Dentro do componente, após os hooks existentes, adicionar:
   ```
   const { contrato } = useContratosBusiness(user?.id);
   const { data: etapas } = useEtapasBusiness(contrato?.id);
   const totalEtapas = etapas?.length ?? 0;
   const primeiraEtapa = etapas?.[0]?.titulo ?? 'sua primeira entrega';
   ```
3. Substituir o array `steps` estático (linhas 10-26) por um array computado dentro do componente:
   - Passo 1: título/descrição dinâmicos baseados em `totalEtapas` e `primeiraEtapa`
   - Passo 2: "Sua primeira sessão será agendada" / notificação calendário
   - Passo 3: "A MarIAna já sabe quem você é" / assistente IA com contexto
4. Layout, botão CTA e `handleEnter` permanecem intactos

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/BusinessWelcome.tsx` | Editado — steps dinâmicos com hooks de contrato/etapas |

