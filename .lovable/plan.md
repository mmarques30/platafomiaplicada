

## Diagnóstico dos dois pontos

### 1. "A visão não foi alterada" — é cache do navegador

Confirmei no código: `src/pages/MentoriaDocumentos.tsx` (linha 504) e `src/pages/MeuSistemaDocumentos.tsx` **já estão usando** `<ProjetoResumoDashboard>`, que tem:
- 4 KPIs (Progresso, Saúde, Prazo, Documentação)
- Gráfico radial Progresso × Cronograma
- Donut de composição da documentação
- Timeline visual de Atividade Recente
- Painel de Insights estilizado

A screenshot que você enviou mostra a **versão antiga** (3 cards simples: "Evolução das Entregas", "Atividade Recente", "Insights do Projeto"). Esses textos **não existem mais nos arquivos** (busca só achou 2 ocorrências dentro do componente novo, em contexto diferente).

**Causa**: o Service Worker do PWA + cache HTTP estão servindo o bundle JavaScript anterior. O HMR já tentou atualizar várias vezes mas o SW segura. Há inclusive um erro de runtime no log: `Failed to update a ServiceWorker... script resource is behind a redirect`.

**Solução**: hard reload + descartar SW. Não é alteração de código; é interação no navegador:
- **Mac**: `Cmd + Shift + R` (uma vez); se continuar, abrir DevTools → Application → Service Workers → "Unregister" → recarregar.
- **Windows**: `Ctrl + Shift + R`; mesma rota no DevTools se persistir.

Se você confirmar que continua igual após esse procedimento, eu investigo se há algum bypass de Suspense/lazy ou se algum admin override está renderizando outra página.

### 2. "A data ainda aparece em Visão Geral"

Confirmei no banco: **toda etapa de contrato Business tem `data_prevista` preenchida automaticamente** quando o admin cria o contrato (intervalos mensais a partir de `data_inicio`). Hoje, em `BusinessVisaoGeralGrid.tsx`, o KPI "Próxima Sessão" pega a primeira `data_prevista` futura — mas isso é a **data calculada**, não uma data **aprovada por você**.

Sua regra é clara: **só aparece data se você aprovou**. Como não existe campo `aprovada_pelo_admin` em `etapas_business`, a única fonte de "data aprovada por você" hoje é a tabela `sessoes_mentoria` (você cria/edita manualmente cada sessão com data, hora e link de reunião).

### Plano de correção

**Mudar a fonte do KPI "Próxima Sessão" de `etapas_business.data_prevista` para `sessoes_mentoria`** em `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx`:

1. Adicionar `useMentoriaSessoes(businessUserId)` (hook já existente).
2. Filtrar sessões com `status = 'agendada'` e `data_sessao > now()`.
3. Pegar a mais próxima.
4. Exibir:
   - Valor: `format(data_sessao, "dd MMM", { locale: ptBR })` + hora `HH'h'mm`.
   - Sub-label: título da sessão truncado (ex: "Encontro 2: ..."), ou "Aguardando agendamento" se não houver.
5. Se não houver nenhuma sessão agendada → exibir `—` no valor e "Aguardando agendamento" no sub-label. **Não cair de volta** para `etapas_business`.

Remover totalmente o uso de `useEtapasBusiness` para o KPI de próxima sessão (continua sendo usado para `progressoGeralPct`).

### Arquivo editado

- `src/components/mentoria/business/BusinessVisaoGeralGrid.tsx` — única alteração.

### Resultado esperado

- O KPI "Próxima Sessão" só mostra data quando você (admin) **agendou explicitamente** uma sessão em `sessoes_mentoria`.
- Enquanto não houver sessão agendada, o card mostra `—` + "Aguardando agendamento" — sem mais "vazar" datas calculadas do contrato.
- O KPI "Progresso Geral" continua funcionando igual (etapas).
- Para o problema #1, basta o hard reload + reset do Service Worker; nenhum código a mexer ali.

