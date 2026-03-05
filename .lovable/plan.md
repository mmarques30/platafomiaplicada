

# Submenu "Meu Projeto" com Sistema e Documentos

## Estrutura final do sidebar

```text
Meu Projeto
  ├── Sistema      → /meu-sistema          (página atual, visão geral)
  └── Documentos   → /meu-sistema/documentos (nova página)
```

## Alterações

### 1. Menu config (migração SQL)
Inserir 2 filhos de `meu_sistema` na tabela `menu_config`:
- `meu_sistema_sistema` — label "Sistema", url `/meu-sistema`, parent_key `meu_sistema`, ordem 1
- `meu_sistema_documentos` — label "Documentos", url `/meu-sistema/documentos`, parent_key `meu_sistema`, ordem 2
- Ambos com `planos_permitidos: ['business_sistemas']`

Remover a `url` do pai `meu_sistema` (setar para `null`) para que ele funcione apenas como grupo expansível, sem rota própria.

### 2. Nova página: Documentos (`src/pages/MeuSistemaDocumentos.tsx`)
Página que lista:
- **Reports** do contrato (da tabela `reports_business`) — com visualização de conteúdo HTML/IA e download de arquivos
- **Documentos** do contrato (da tabela `documentos_business`) — com download via signed URL
- **Dados do contrato** em seção colapsável: empresa, CNPJ, representante, módulos, datas, valores, garantias

Usa os hooks existentes `useContratosBusiness`, `useDocumentosBusiness` e `useBusinessUserId`.

### 3. Rota (`src/App.tsx`)
Adicionar rota `/meu-sistema/documentos` apontando para a nova página.

### 4. Sidebar (`src/components/layout/AppSidebar.tsx`)
Nenhuma alteração necessária — o sidebar já renderiza submenus automaticamente via `parent_key`.

### 5. useMenuConfig (`src/hooks/useMenuConfig.tsx`)
Ajuste no `getMenuUrl`: quando `meu_sistema` não tiver URL (grupo), redirecionar para `/meu-sistema` (primeiro filho).

**Total: 1 migração SQL, 1 novo arquivo, 2 arquivos editados.**

