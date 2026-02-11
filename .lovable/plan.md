

# Corrigir Tela Preta no Celular

## Causa Raiz

O `useVersionCheck` esta limpando TODOS os caches do navegador (incluindo os caches do Service Worker com os assets JS/CSS/imagens) quando detecta uma mudanca de versao. Isso forca o app a recarregar sem nenhum cache disponivel. Em conexoes moveis lentas, o resultado e uma tela preta enquanto tudo e baixado novamente da rede.

O problema e que existem dois mecanismos competindo:
- `PWAUpdatePrompt`: detecta novo SW, faz reload automatico (mecanismo correto)
- `useVersionCheck`: detecta timestamp diferente, limpa TODOS os caches e faz reload (mecanismo destrutivo)

Quando ambos disparam, os caches sao destruidos antes do novo conteudo estar pronto, resultando em tela preta.

## Solucao

Simplificar o `useVersionCheck` para que ele apenas registre a versao atual no localStorage, sem destruir caches e sem forcar reload. O Service Worker (via `PWAUpdatePrompt`) ja cuida de:
- Detectar novas versoes (a cada 15s e ao voltar ao foco)
- Ativar o novo SW com `skipWaiting` e `clientsClaim`
- Recarregar a pagina automaticamente via `onNeedRefresh`

A estrategia `NetworkFirst` no `vite.config.ts` ja garante que assets frescos sao buscados da rede primeiro.

## Alteracao

### Arquivo: `src/hooks/useVersionCheck.tsx`

Remover toda a logica destrutiva de limpeza de cache e reload. Manter apenas o registro da versao para fins de log/debug:

```text
import { useEffect } from 'react';

const CURRENT_VERSION = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const VERSION_KEY = 'app-version';

export function useVersionCheck() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion && storedVersion !== CURRENT_VERSION) {
      console.log('[Version] Nova versao detectada:', CURRENT_VERSION, '(anterior:', storedVersion, ')');
    }

    // Apenas registrar a versao atual - o SW cuida do resto
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }, []);
}
```

Mudancas:
- Removido: `caches.keys()` + `caches.delete()` (limpeza destrutiva de todos os caches)
- Removido: `navigator.serviceWorker.getRegistrations()` + `reg.update()` (duplica o que PWAUpdatePrompt faz)
- Removido: `window.location.reload()` (duplica o que onNeedRefresh faz)
- Mantido: Log de versao e registro no localStorage

## Resultado

- O app nunca mais tera seus caches destruidos abruptamente
- O Service Worker continua atualizando normalmente via `PWAUpdatePrompt`
- No celular, o app carrega instantaneamente do cache (NetworkFirst com fallback)
- Quando o novo SW estiver pronto, faz reload automatico com os novos assets ja cacheados
- Sem tela preta

