

## Diagnóstico: por que as entregas "somem" depois de processadas

Investiguei o banco de dados e os logs. As entregas **estão sendo salvas com sucesso pela IA**, mas há **3 problemas combinados** que fazem com que elas desapareçam ou pareçam ter sumido.

### O que confirmei nos dados

| Cliente | Etapas | Entregas no DB | Notificações de "nova entrega" hoje |
|---|---|---|---|
| **Claudia De Meo** (Business iAplicada) | 6 | **0** | **13 entregas × 2 vezes** (=26 inserts) |
| **Raquel Tetti** | — | — | **15 entregas × 2 vezes** (=30 inserts) |
| Uiara (UMAS) | 6 | 31 | (anterior, intactas) |

Conclusão: a IA processou, gerou as entregas corretamente, **as entregas foram inseridas no banco** (cada uma 2 vezes hoje, confirmado pelas notificações automáticas) — e depois **alguém apagou todas** entre os ciclos. Hoje o contador está em zero.

### Causa #1 — Botão "Limpar Tudo" apaga TUDO sem aviso suficiente

Em `src/components/admin/business/EntregasBusinessManager.tsx` (linhas 65-84) existe um botão **"Limpar Tudo"** que executa:

```ts
supabase.from("entregas_business").delete().eq("contrato_id", contratoId);
```

Isso apaga **todas** as entregas do contrato (não só a última importação). O texto do diálogo diz apenas "Esta ação irá remover permanentemente todas as entregas". O fluxo real do usuário é:

1. Processa → 13 entregas criadas
2. Vê duplicatas/algo estranho → clica "Limpar Tudo" pra "limpar a importação"
3. Reprocessa → 13 entregas criadas de novo
4. Volta a ver duplicatas → clica "Limpar Tudo" de novo → **fica em zero**

### Causa #2 — IA sobrescreve os títulos das etapas existentes

Em `GeracaoEntregasModal.tsx` (linhas 524-549), o `handleSalvar` casa etapas **pelo número** (`numero_etapa`), não pelo título. Como o contrato Business iAplicada já vem com etapas pré-criadas ("Diagnóstico e Alinhamento Estratégico", "Infraestrutura de Dados…", etc.), e a IA devolve etapas genéricas ("Kickoff", "MVP — Importação", "Dashboard"…), o save **silenciosamente sobrescreve os títulos originais** da fase 1, 2, 3, 4.

O usuário perde os títulos personalizados que ele/admin definiu no contrato sem ser avisado.

### Causa #3 — Entregas com `etapa_numero=0` ficam órfãs

A IA às vezes retorna "Etapa 0: Kickoff" (numeração começando em zero). O save faz `etapasMap[etapa.numero] || null`, e como não existe etapa 0 no DB, todas as entregas dessa fase entram com `etapa_id = null` — ficam soltas, sem aparecer no Gantt agrupado por fase.

---

## Plano de correção

### 1. Tornar "Limpar Tudo" muito mais explícito e seguro

Em `EntregasBusinessManager.tsx`:
- Mudar o texto do diálogo para mostrar **a quantidade exata** que será deletada e os nomes (até 5, com "…+N mais"):
  > "Esta ação vai apagar permanentemente as **13 entregas** deste contrato (Documentação do Projeto, Identidade Visual De Meo, …+10 mais) e todas as instruções vinculadas. Esta ação **não pode ser desfeita**."
- Adicionar uma **confirmação por digitação**: o usuário precisa digitar o nome do cliente (ou "LIMPAR") para habilitar o botão de confirmação.
- Trocar o ícone/texto do botão de `"Limpar Tudo"` para `"Apagar todas as entregas"` (mais claro).

### 2. Modo "Atualizar" no save: NÃO sobrescrever títulos de etapas existentes

Em `GeracaoEntregasModal.tsx` (`handleSalvar`, bloco "ETAPAS — atualizar/criar"):
- Quando uma etapa existente é encontrada por número, **NÃO atualizar `titulo`** — preservar o que o admin já configurou. Atualizar apenas `objetivo` se estiver vazio.
- Comentário no código explicando que títulos de etapas em contratos Business iAplicada são "verdade do admin" e não devem ser substituídos pela IA.

### 3. Mapear etapas por título (com fallback por número) e tratar etapa 0

Em `handleSalvar`:
- Construir `etapasExistentesPorTitulo` além de `etapasExistentesPorNumero`. Tentar primeiro casar por título normalizado; só cair pra número se não achar.
- Se a IA retornar `etapa_numero = 0`, **renumerar para 1** antes do mapeamento (ou criar uma "Etapa 0 — Kickoff" se realmente não existir nada).
- Nunca permitir que entrega seja inserida com `etapa_id = null` em modo "atualizar" — se não conseguir mapear, criar a etapa nova automaticamente.

### 4. Evitar inserts duplicados em re-importação

Hoje o match de duplicata é só pelo `titulo` exato. Se a IA gerar o mesmo título com pontuação diferente ("Identidade Visual De Meo" vs "Identidade Visual de Meo."), entra como nova. Vou normalizar o título (lowercase + trim + sem pontuação final) na chave do `entregasExistentesPorTitulo` Map.

### Arquivos que serão editados

1. `src/components/admin/business/EntregasBusinessManager.tsx` — diálogo de "Limpar Tudo" com confirmação por digitação + texto claro mostrando quantas serão apagadas.
2. `src/components/admin/business/GeracaoEntregasModal.tsx` — `handleSalvar`: não sobrescrever título de etapa existente, mapear etapas por título com fallback, tratar `etapa_numero = 0`, normalizar título de entrega no match de duplicata.

### Resultado esperado

- O botão "Limpar Tudo" fica claro o suficiente para impedir cliques acidentais (causa principal do "sumiço").
- Reimportar o mesmo documento não duplica nem apaga as entregas existentes — apenas atualiza descrição/prioridade quando estiver em modo "atualizar".
- Os títulos das etapas configuradas no contrato (Business iAplicada) não são mais sobrescritos pela IA.
- Entregas geradas pela IA sempre ficam vinculadas a uma etapa válida.

Sem mudanças em hooks, banco, edge functions ou outros arquivos.

