

# Corrigir Delay de 2 Minutos no Carregamento (Layout Antigo)

## Diagnostico

O problema tem 3 causas combinadas:

1. **Versao hardcoded desatualizada**: O `useVersionCheck.tsx` usa a versao `'2026-01-05-v10'` (de 5 de janeiro). Como nao muda a cada build, nunca detecta versoes novas e nunca limpa o cache automaticamente.

2. **Service Worker antigo ainda ativo**: Usuarios que ja instalaram o PWA tem o SW antigo (com `StaleWhileRevalidate`) servindo assets do cache. A mudanca para `NetworkFirst` so toma efeito quando o novo SW e instalado e ativado - o que pode levar ate 60 segundos (intervalo de verificacao).

3. **Fluxo de ativacao lento**: Mesmo com `skipWaiting` e `clientsClaim`, o ciclo completo e: detectar novo SW -> baixar -> instalar -> ativar -> recarregar. Durante esse tempo, o SW antigo continua servindo o layout antigo.

## Solucao

### 1. Versao automatica por build (`src/hooks/useVersionCheck.tsx`)

Trocar a versao hardcoded por um hash gerado automaticamente pelo Vite a cada build, usando `import.meta.env.VITE_BUILD_TIME` ou a propria data de build. Dessa forma, cada deploy gera uma versao diferente e dispara a limpeza de cache imediatamente.

```text
// ANTES:
const CURRENT_VERSION = '2026-01-05-v10';

// DEPOIS:
const CURRENT_VERSION = __BUILD_TIMESTAMP__;
```

Adicionar a definicao do timestamp no `vite.config.ts` via `define`:
```text
define: {
  __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
}
```

### 2. Forcar ativacao imediata do novo SW (`src/components/shared/PWAUpdatePrompt.tsx`)

Reduzir o intervalo de verificacao de 60s para 15s e adicionar um mecanismo que forca o reload imediatamente quando o novo SW esta pronto, sem esperar o proximo ciclo de navegacao.

```text
// Intervalo mais curto para deteccao
setInterval(() => {
  registration?.update();
}, 15 * 1000); // 15 segundos em vez de 60
```

### 3. Limpeza proativa no `useVersionCheck.tsx`

Quando detectar versao diferente, alem de limpar caches, tambem forcar desregistro e re-registro do SW para garantir que o novo SW com `NetworkFirst` seja instalado:

```text
// Alem de limpar caches, forcar SW update
if ('serviceWorker' in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const reg of registrations) {
    await reg.update();
  }
}
```

### 4. Incrementar cacheName do HTML (`vite.config.ts`)

Incrementar `html-cache-v10` para `html-cache-v11` para forcar invalidacao do cache HTML tambem, garantindo que o index.html com a referencia ao novo JS seja carregado.

## Arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `vite.config.ts` | Adicionar `define: { __BUILD_TIMESTAMP__ }` e incrementar `html-cache-v11` |
| `src/hooks/useVersionCheck.tsx` | Usar `__BUILD_TIMESTAMP__` em vez de versao hardcoded; forcar SW update ao detectar mudanca |
| `src/components/shared/PWAUpdatePrompt.tsx` | Reduzir intervalo de verificacao para 15s |

## Resultado

- Cada novo deploy gera um timestamp unico
- Ao abrir o app, `useVersionCheck` detecta a versao diferente imediatamente e limpa todos os caches
- O SW verifica atualizacoes a cada 15s em vez de 60s
- O usuario ve o layout correto na primeira carga, sem delay de 2 minutos

