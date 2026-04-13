

# Criar tabela `webhook_lia_logs` para registrar eventos de webhook da Lia

## O que será feito

Criar uma migração SQL com a tabela `webhook_lia_logs` exatamente como especificado, incluindo:
- Tabela com colunas: `id`, `event_type`, `entity_type`, `payload`, `customer_email`, `customer_name`, `offer_id`, `offer_name`, `bill_id`, `status`, `error_message`, `user_created_id`, `created_at`
- 3 índices (email, status, created_at DESC)
- RLS habilitado com 2 policies:
  - `Service role full access` — acesso total para edge functions
  - `Authenticated users can read logs` — leitura para usuários autenticados

## Migração SQL

Uma única migração contendo exatamente o SQL fornecido, sem alterações.

## Observação de segurança

A policy de SELECT permite leitura para **qualquer** usuário autenticado. Conforme indicado no SQL, a verificação de admin será feita no frontend. Se preferir restringir no banco para apenas admins, posso ajustar usando `has_role(auth.uid(), 'admin')`.

