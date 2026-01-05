import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function PWAUpdatePrompt() {
  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, registration) {
        console.log('[PWA] SW registrado:', swUrl);
        
        if (registration) {
          // Verificar atualizações a cada 1 minuto
          setInterval(() => {
            console.log('[PWA] Verificando atualização...');
            registration.update();
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
  }, []);

  return null;
}
