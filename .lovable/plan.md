

# Correção: "Projeto Skills" aparecendo nos ambientes Academy e Business

## Problema

O grupo de menus "Projeto Skills" (com submenus Visão Geral, Performance e Diagnóstico) está aparecendo no menu lateral para TODOS os ambientes e planos porque:

1. **No banco de dados**: `planos_permitidos = NULL` (visível para todos)
2. **No código**: as listas de exclusão por ambiente (`academy`, `business`, `business_iaplicada`) não incluem esses menus

Isso faz com que "Projeto Skills" apareça quando o admin simula um usuário Academy ou Business, ou quando um usuário real desses planos acessa a plataforma.

## Solução (dupla proteção)

### Parte 1: Corrigir no banco de dados

Atualizar `planos_permitidos` dos 4 registros de `menu_config` para restringir ao plano `skills`:

- `projeto_skills` -> planos_permitidos = `['skills']`
- `projeto_skills_visao_geral` -> planos_permitidos = `['skills']`
- `projeto_skills_performance` -> planos_permitidos = `['skills']`
- `projeto_skills_diagnostico` -> planos_permitidos = `['skills']`

### Parte 2: Adicionar às listas de exclusão no código

**Arquivo:** `src/hooks/useMenuConfig.tsx`

Adicionar `projeto_skills`, `projeto_skills_visao_geral`, `projeto_skills_performance` e `projeto_skills_diagnostico` às listas de exclusão dos ambientes:

- **academy**: adicionar os 4 menus
- **business**: adicionar os 4 menus
- **business_iaplicada**: adicionar os 4 menus

Isso garante que, mesmo se o banco de dados tiver dados inconsistentes no futuro, o código impede a exibição.

## Arquivos

### Migração SQL
- Atualizar `planos_permitidos` na tabela `menu_config` para os 4 registros

### Modificar
- `src/hooks/useMenuConfig.tsx` - Adicionar menus do Projeto Skills às listas de exclusão de `academy`, `business` e `business_iaplicada`

