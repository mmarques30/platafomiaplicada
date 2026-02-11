

# Corrigir Layout Antigo Persistente (Cache PWA)

## Problema

O arquivo `vite.config.ts` configura o cache de arquivos JS e CSS com a estratégia `StaleWhileRevalidate`. Essa estratégia entrega primeiro a versao do cache (antiga) e atualiza em segundo plano. Resultado: o usuario ve o layout antigo ate que o Service Worker termine de baixar e ativar a nova versao.

## Causa Raiz

Linha 89 de `vite.config.ts`:
```text
handler: 'StaleWhileRevalidate'  // <-- serve cache antigo primeiro
```

## Solucao

Trocar a estrategia de cache dos assets JS/CSS de `StaleWhileRevalidate` para `NetworkFirst`, com um timeout de rede curto (3 segundos). Isso garante que:

- Se houver internet, busca a versao mais recente
- Se a rede demorar mais de 3s, usa o cache como fallback
- O usuario sempre ve o layout atual

## Alteracao

### Arquivo: `vite.config.ts` (linhas 88-96)

De:
```text
{
  urlPattern: /\.(js|css)$/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'assets-cache-v10',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 86400
    }
  }
}
```

Para:
```text
{
  urlPattern: /\.(js|css)$/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'assets-cache-v11',
    networkTimeoutSeconds: 3,
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 86400
    }
  }
}
```

Mudancas:
- `handler`: de `StaleWhileRevalidate` para `NetworkFirst`
- `cacheName`: incrementado para `v11` para invalidar o cache antigo
- `networkTimeoutSeconds: 3`: adicionado para fallback rapido se offline

## Resultado

O usuario sempre recebera o layout mais recente ao abrir a plataforma, sem precisar forcar atualizacao manual.

