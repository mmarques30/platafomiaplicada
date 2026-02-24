
# Corrigir erro de upload de arquivo em Materiais Gratuitos

## Problema identificado

Ao criar um novo material gratuito no painel admin, o formulario nao possui um campo visivel para a coluna `url`, que e obrigatoria (NOT NULL) no banco de dados. Quando o usuario cria um material apenas com arquivos (upload) ou links, o campo `url` vai como string vazia, o que pode causar erros de validacao ou comportamento inesperado.

Alem disso, se o formulario e submetido sem links nem arquivos, nao ha nenhuma URL valida associada ao material.

## Solucao

Duas alteracoes combinadas:

1. **Banco de dados**: Tornar a coluna `url` nullable (permitir NULL), ja que os materiais agora usam `arquivos_url` e `links_url` como fontes principais.

2. **Codigo**: No `handleSubmit`, auto-preencher o campo `url` com o primeiro link ou a primeira URL de arquivo disponivel. Se nenhum existir, enviar `null`.

## Secao Tecnica

### 1. Migracao SQL

```sql
ALTER TABLE materiais_gratuitos ALTER COLUMN url DROP NOT NULL;
```

### 2. Arquivo modificado

| Arquivo | Mudanca |
|---|---|
| `src/pages/admin/GerenciarMateriais.tsx` | Ajustar `handleSubmit` para calcular `url` automaticamente a partir dos links/arquivos |

### Logica no handleSubmit

```text
const autoUrl = linkUrls[0] || arquivoUrls[0] || null;
// Incluir autoUrl no payload de create/update
```

Isso garante que:
- Se o usuario adicionou links, o primeiro link vira a URL principal
- Se so enviou arquivos, a URL do primeiro arquivo e usada
- Se nao tem nada, `url` fica como `null` (agora permitido)
