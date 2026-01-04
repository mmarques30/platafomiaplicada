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
        
        // Verificar atualizações a cada 5 minutos (mais frequente para iOS)
        setInterval(() => {
          console.log('[PWA] Verificando atualizações periódicas...');
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar Service Worker:', error);
    },
    onNeedRefresh() {
      // Auto-update: aplicar atualização automaticamente sem prompt
      console.log('[PWA] Nova versão detectada, atualizando automaticamente...');
      updateServiceWorker(true);
    }
  });

  // Componente não renderiza nada - atualizações são automáticas
  return null;
}
