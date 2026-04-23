

## Corrigir data errada na "Próxima Sessão" do mentorado Parceria

### Causa raiz

No painel `Mentoria` (visão Business Parceria), o KPI **"Próxima Sessão"** em `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx` usa o hook `useProximaAula()`, que consulta a tabela `aulas_semanais` — o **calendário geral de aulas/lives** da plataforma, não o cronograma do contrato do mentorado.

Resultado: aparece a data da próxima aula coletiva (ou qualquer data inserida em `aulas_semanais`), e não a data prevista da próxima etapa do projeto dele.

### Regra correta

Conforme você definiu:

> "as datas das seções somente aparecem se forem aprovadas por mim, o que vai aparecer de data no painel do mentorado parceria é somente o dado da seção prevista baseada no contrato"

Como **não existe campo de "aprovação"** em `sessoes_mentoria` (só `agendada / realizada / cancelada`), a fonte da verdade da próxima sessão deve ser a **data prevista da próxima etapa do contrato** — `etapas_business.data_prevista` — pois essas etapas são geradas/aprovadas pelo admin no momento da configuração do projeto.

### Mudança

Em `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx`:

1. **Remover** o uso de `useProximaAula()` (e o import de `useCalendarioAulas`).
2. **Calcular a próxima sessão a partir das `etapas` já carregadas** pelo hook `useEtapasBusiness(contrato?.id)`:
   - Filtrar etapas com `data_prevista` no futuro (≥ hoje) e `status !== 'concluida'`.
   - Ordenar por `data_prevista` ascendente.
   - Pegar a primeira → essa é a "Próxima Sessão prevista".
3. **Atualizar o KPI**:
   - Label superior continua: **"Próxima Sessão"**.
   - Valor principal: data formatada `format(data_prevista, "dd MMM", { locale: ptBR })`.
   - Linha auxiliar (substitui a hora, que não existe em etapas): `Etapa {numero_etapa}` (ex.: "Etapa 3"), com truncate do título se houver espaço — ou `prevista` como fallback simples.
   - Quando não houver etapas futuras: continuar exibindo `—` (igual ao comportamento atual de fallback).

### Arquivo editado

- `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx` — única alteração; nenhum hook novo, nenhuma migration, nenhum outro arquivo afetado.

### Resultado esperado

- O KPI **"Próxima Sessão"** no painel do mentorado Parceria passa a refletir a **próxima etapa prevista do contrato dele** (data definida pelo admin na configuração do projeto), eliminando a data incorreta vinda do calendário geral de aulas.
- Demais telas (Calendário, CalendarioAulas) continuam usando `useProximaAula` normalmente — sem regressões.

