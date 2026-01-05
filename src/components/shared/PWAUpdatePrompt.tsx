import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function PWAUpdatePrompt() {
  useEffect(() => {
    let registration: ServiceWorkerRegistration | undefined;
    
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, reg) {
        console.log('[PWA] SW registrado:', swUrl);
        registration = reg;
        
        if (registration) {
          // Verificar atualizações a cada 1 minuto
          setInterval(() => {
            console.log('[PWA] Verificando atualização (interval)...');
            registration?.update();
          }, 60 * 1000);
        }
      },
      onNeedRefresh() {
        console.log('[PWA] Nova versão detectada! Recarregando...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('[PWA] App pronto para uso offline');
      }
    });

    // Verificar atualizações quando o app volta ao foco (especialmente importante no iOS)
    const handleFocus = () => {
      console.log('[PWA] App voltou ao foco, verificando atualizações...');
      registration?.update();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[PWA] App visível novamente, verificando atualizações...');
        registration?.update();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
