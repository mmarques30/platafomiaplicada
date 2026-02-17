

# Implementacao da API REST para Visitantes

## API Key
Vou gerar uma chave aleatoria segura e configurar como secret automaticamente. Voce recebera a chave gerada para usar na aplicacao externa.

## O que sera feito

### 1. Configurar secret `VISITANTES_API_KEY`
- Gerar uma chave aleatoria segura (UUID ou string hex de 32 caracteres)
- Armazenar como secret do projeto

### 2. Criar `supabase/functions/api-visitantes/index.ts`
- Validar header `x-api-key`
- Consultar `profiles` (visitantes) e `content_access_logs` usando service role key
- Suportar parametro `?type=` com opcoes: `visitantes`, `top-conteudos`, `engajamento`, `resumo`
- Sem parametro retorna tudo junto

### 3. Atualizar `supabase/config.toml`
- Adicionar `[functions.api-visitantes]` com `verify_jwt = false`

## Como usar depois

```
GET https://ocwpsanqtfubixerjive.supabase.co/functions/v1/api-visitantes?type=resumo
Headers:
  x-api-key: [chave que sera gerada]
```

