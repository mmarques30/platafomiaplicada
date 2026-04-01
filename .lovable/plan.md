

# Adicionar console.log de diagnóstico no WelcomeHeader

## Alteração

**Arquivo**: `src/components/dashboard/WelcomeHeader.tsx`

Adicionar 6 `console.log` temporários sem alterar nenhuma lógica ou JSX:

1. **Após linha 72** (`const businessUserId = useBusinessUserId();`):
   - `console.log('[WelcomeHeader] businessUserId:', businessUserId);`
   - `console.log('[WelcomeHeader] user?.id:', user?.id);`
   - `console.log('[WelcomeHeader] effectivePlan:', effectivePlan);`
   - `console.log('[WelcomeHeader] isBusiness:', isBusiness);`

2. **Após linha 73** (`const { contrato } = useContratosBusiness(...)`):
   - `console.log('[WelcomeHeader] contrato:', contrato);`

3. **Após linha 74** (`const { data: etapas } = useEtapasBusiness(...)`):
   - `console.log('[WelcomeHeader] etapas:', etapas?.length, 'etapas');`

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editado — adiciona console.log |

