

# BusinessVisaoRapida — Componente de resumo contextual

## Resumo
Criar componente `BusinessVisaoRapida` com header contextual + grid de 3 cards (próxima sessão, tarefas críticas, última entrega) e inserir acima do `BusinessROIChart` na aba Visão Geral do Business Parceria.

## Alterações

### 1. Novo componente: `src/components/mentoria/business/BusinessVisaoRapida.tsx`

**Header contextual:**
- "Olá, [nome] — Semana X da sua jornada" (calcular semana com `differenceInWeeks` entre `contrato.data_inicio` e hoje)
- Badge de status do contrato (ativo/pausado/concluído) com cor (verde/âmbar/cinza)
- Barra de progresso geral das etapas (usando `useEtapasBusiness`)

**Grid de 3 cards (`md:grid-cols-3`):**

1. **Próxima Sessão** — query `sessoes_mentoria` filtrada por `user_id`, `status = 'agendada'`, `data_sessao > now()`, limit 1. Exibir data formatada + hora. Nota: `sessoes_mentoria` não tem `link_reuniao`, então o botão "Entrar na reunião" só aparece se houver `video_url` (usado como link) — caso contrário, texto "Aguardando link".

2. **Tarefas Críticas** — filtrar `tarefas_mentoria` do userId onde `prioridade` IN (`alta`, `critica`) e `status` != `concluida`. Exibir contagem + link `/mentoria/tarefas`.

3. **Última Entrega** — usar `useEntregasBusiness` (já disponível via `contratoId`), pegar a entrega mais recente com `status = 'concluida'`, exibir título, data de `updated_at` e badge de status.

**Dados:** Usa hooks existentes `useContratosBusiness`, `useEtapasBusiness`, `useEntregasBusiness` + query inline para sessões e tarefas (via `useBusinessUserId`).

Estilo: Cards com `bg-card border rounded-xl`, consistente com o dark theme existente.

### 2. Editar: `src/pages/Mentoria.tsx`
- Importar `BusinessVisaoRapida`
- Inserir `<BusinessVisaoRapida />` acima de `<BusinessROIChart />` no bloco `isBusiness` (linha ~109)

## Arquivos
- **Novo**: `src/components/mentoria/business/BusinessVisaoRapida.tsx`
- **Editado**: `src/pages/Mentoria.tsx`

