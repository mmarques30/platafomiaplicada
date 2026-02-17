
# API REST para Dados de Visitantes

## Objetivo
Criar uma edge function que funcione como API REST pública (autenticada por API key) para que aplicações externas possam consultar dados de visitantes, top conteudos e engajamento.

## Autenticacao
A API sera protegida por uma **API key secreta** que voce define. A aplicacao externa envia essa key no header `x-api-key`. Isso evita que qualquer pessoa acesse os dados sem autorizacao.

## Endpoint Unico

**`GET /api-visitantes`** com parametro `?type=` para selecionar o conjunto de dados:

| Parametro | Retorno |
|-----------|---------|
| `?type=visitantes` | Lista completa de visitantes com nome, email, telefone, status, cupom, data de cadastro |
| `?type=top-conteudos` | Top 10 conteudos mais acessados por visitantes (titulo, tipo, total de acessos) |
| `?type=engajamento` | Todos os visitantes ordenados por engajamento (email, videos, materiais, total acessos, ultimo acesso, lista de conteudos) |
| `?type=resumo` | Metricas gerais: total de acessos, visitantes unicos, acessos ultimos 7 dias, media por usuario |
| sem parametro | Retorna tudo de uma vez (visitantes + top conteudos + engajamento + resumo) |

## Detalhes Tecnicos

### 1. Criar secret para a API key
- Sera solicitado que voce defina uma chave secreta (ex: `VISITANTES_API_KEY`) que sera usada para autenticar as chamadas externas.

### 2. Edge Function `api-visitantes/index.ts`
- Valida o header `x-api-key` contra a secret armazenada
- Usa o **service role key** para consultar as tabelas `profiles` e `content_access_logs` (bypass RLS)
- Replica a mesma logica de agregacao que ja existe no hook `useContentAccessMetrics`
- Retorna JSON formatado

### 3. Configuracao no `config.toml`
- `verify_jwt = false` (autenticacao feita via API key customizada, nao via JWT de usuario)

### 4. Como usar na aplicacao externa

```
GET https://ocwpsanqtfubixerjive.supabase.co/functions/v1/api-visitantes?type=visitantes
Headers:
  x-api-key: SUA_CHAVE_SECRETA
```

### Resposta de exemplo (`?type=resumo`):
```json
{
  "totalAccesses": 342,
  "uniqueUsers": 45,
  "accessesLast7Days": 67,
  "averagePerUser": 7.6
}
```

### Resposta de exemplo (`?type=visitantes`):
```json
{
  "visitantes": [
    {
      "nome": "Joao Silva",
      "email": "joao@email.com",
      "telefone": "11999...",
      "created_at": "2026-01-15",
      "conta_ativa": true,
      "cupom": "Academy12"
    }
  ]
}
```

## Arquivos a Criar/Modificar
1. **Criar** `supabase/functions/api-visitantes/index.ts` -- a edge function completa
2. **Modificar** `supabase/config.toml` -- adicionar `[functions.api-visitantes]` com `verify_jwt = false`
3. **Criar secret** `VISITANTES_API_KEY` -- chave de autenticacao para a API
