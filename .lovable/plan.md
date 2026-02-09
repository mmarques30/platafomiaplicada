

# Criar menu "Meu Sistema" para Business iAplicada

## O que sera feito

Adicionar um novo item de menu grupo "Meu Sistema" no sidebar, visivel apenas no ambiente `business_iaplicada`, posicionado logo abaixo de "Aprender" (ordem 3).

## Alteracoes

### 1. Inserir registro no banco de dados (`menu_config`)

Criar o menu pai "Meu Sistema" com:
- `menu_key`: `meu_sistema`
- `label`: Meu Sistema
- `tipo`: sidebar
- `icon`: Monitor (ou outro icone Lucide adequado)
- `ordem`: 3 (entre Aprender=2 e Projeto Skills=3, ajustar Projeto Skills para 4)
- `parent_key`: null (menu de nivel raiz)
- `planos_permitidos`: `["business_iaplicada"]`
- `visivel`: true
- `url`: `/meu-sistema`

Tambem ajustar a `ordem` dos menus seguintes (Projeto Skills, Meu Progresso, etc.) para abrir espaco.

### 2. Ocultar "Meu Sistema" nos outros ambientes (`useMenuConfig.tsx`)

Adicionar `meu_sistema` nas listas `hiddenByEnvironment` de todos os ambientes **exceto** `business_iaplicada`:
- `gratuito`: adicionar `meu_sistema`
- `skills`: adicionar `meu_sistema`
- `business`: adicionar `meu_sistema`
- `academy`: adicionar `meu_sistema`

Como o menu tera `planos_permitidos: ["business_iaplicada"]`, a filtragem por plano ja ajuda, mas a lista de exclusao por ambiente garante consistencia total.

### 3. Criar pagina placeholder `/meu-sistema`

Criar um componente basico em `src/pages/MeuSistema.tsx` com layout padrao (sidebar + header) para que a rota nao de 404.

### 4. Registrar rota no `App.tsx`

Adicionar a rota `/meu-sistema` apontando para o novo componente, protegida por autenticacao.

## Arquivos alterados

- **Banco de dados**: INSERT na tabela `menu_config` + UPDATE de ordem nos menus existentes
- `src/hooks/useMenuConfig.tsx`: adicionar `meu_sistema` nas listas de exclusao dos ambientes que nao sao business_iaplicada
- `src/pages/MeuSistema.tsx`: novo componente placeholder
- `src/App.tsx`: nova rota `/meu-sistema`

