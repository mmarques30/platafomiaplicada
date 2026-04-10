

# Notificações para Admin quando mentorados adicionam documentos, notas e links

## Problema

Quando mentorados/empresas adicionam documentos, anotações ou links no painel de Documentos, o admin não recebe nenhuma notificação.

## Solução

Criar 3 triggers de banco de dados (SECURITY DEFINER) que notificam todos os admins automaticamente quando um mentorado insere um novo registro nas tabelas:

1. **`documentos_business`** — quando um documento/arquivo é adicionado
2. **`notas_projeto_business`** — quando uma anotação é criada
3. **`links_business`** — quando um link é adicionado

Cada trigger:
- Busca o `nome_empresa` do contrato associado (via `contrato_id → contratos_business`)
- Busca todos os `user_id` com role `admin` na tabela `user_roles`
- Insere uma notificação para cada admin na tabela `notificacoes` com tipo, título e mensagem descritivos
- Inclui link direto para o painel de mentoria do usuário (`/admin/mentoria?user=<user_id>`)
- **Ignora** inserções feitas pelo próprio admin (compara `auth.uid()` com os admin_ids)

## Migração SQL

Uma única migração com 3 funções + 3 triggers:

- `notificar_admin_novo_documento()` → trigger ON INSERT em `documentos_business`
- `notificar_admin_nova_nota()` → trigger ON INSERT em `notas_projeto_business`
- `notificar_admin_novo_link()` → trigger ON INSERT em `links_business`

Cada função segue o mesmo padrão já existente em `notificar_nova_duvida()` e `notificar_novo_visitante()`.

## Nenhuma alteração de frontend

O sistema de notificações existente (sino no header + página `/notificacoes`) já exibe notificações da tabela `notificacoes`. As novas notificações aparecerão automaticamente.

