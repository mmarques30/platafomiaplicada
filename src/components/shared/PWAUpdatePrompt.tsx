import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdatePrompt() {
  const {
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('[PWA] Service Worker registrado:', swUrl);
      
      if (r) {
        // Verificar imediatamente na montagem
        console.log('[PWA] Verificando atualizações iniciais...');
        r.update();
        
        // Verificar atualizações a cada 1 minuto (mais agressivo)
        setInterval(() => {
          console.log('[PWA] Verificando atualizações periódicas...');
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar Service Worker:', error);
    },
    onNeedRefresh() {
      console.log('[PWA] Nova versão detectada, limpando caches antigos...');
      
      // Limpar caches antigos antes de atualizar
      if ('caches' in window) {
        caches.keys().then(names => {
          const deletePromises = names
            .filter(name => !name.includes('-v5'))
            .map(name => {
              console.log('[PWA] Removendo cache antigo:', name);
              return caches.delete(name);
            });
          
          return Promise.all(deletePromises);
        }).then(() => {
          console.log('[PWA] Caches limpos, aplicando atualização...');
          updateServiceWorker(true);
        }).catch(() => {
          // Se falhar a limpeza, atualiza mesmo assim
          updateServiceWorker(true);
        });
      } else {
        updateServiceWorker(true);
      }
    }
  });

  // Componente não renderiza nada - atualizações são automáticas
  return null;
}
