

# Adicionar Documentos Aditivos ao Contrato com Atualização via IA

## Contexto
A aba Contrato já possui a seção "Importar Contrato Existente" que extrai dados de um documento e preenche o formulário. O pedido é permitir adicionar **aditivos** ou **documentos atualizados** que a IA lê e **atualiza apenas os campos alterados** no contrato existente, sem sobrescrever dados não mencionados.

## Mudanças

### 1. Novo componente `ContratoAditivoSection.tsx`
Seção que aparece **somente quando já existe um contrato salvo**, abaixo do formulário principal. Permite:
- Upload de arquivo (PDF/DOCX/TXT) ou colar texto do aditivo
- Ao processar, a IA recebe o **contexto do contrato atual** + o texto do aditivo
- Retorna apenas os campos que foram alterados/adicionados
- Preview das mudanças detectadas antes de aplicar (diff visual simples)
- Botão "Aplicar Alterações" que faz merge nos campos do formulário

### 2. Nova edge function `parse-aditivo-contrato`
Similar à `parse-contrato-texto`, mas com prompt diferente:
- Recebe o texto do aditivo **e** os dados atuais do contrato como contexto
- Instrução para retornar **somente campos que mudaram**
- Retorna JSON com campos alterados + campo `resumo_alteracoes` (texto explicativo)

### 3. Integrar no `ContratoBusinessManager.tsx`
- Renderizar `ContratoAditivoSection` quando `contrato` existe
- Handler `handleAditivoParsed` que faz merge inteligente: só atualiza campos presentes no resultado da IA
- Ao aplicar, salva automaticamente no banco

### 4. Histórico de aditivos (tabela `aditivos_contrato`)
Nova tabela para registrar cada aditivo processado:
- `id`, `contrato_id`, `texto_original`, `alteracoes_json`, `resumo`, `created_at`
- Permite rastrear o histórico de mudanças no contrato

### Arquivos impactados
- `src/components/admin/business/ContratoAditivoSection.tsx` — novo
- `supabase/functions/parse-aditivo-contrato/index.ts` — novo
- `src/components/admin/business/ContratoBusinessManager.tsx` — integrar seção de aditivos
- Migration SQL — criar tabela `aditivos_contrato`

