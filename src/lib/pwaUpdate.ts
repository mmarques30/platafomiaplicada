import { toast } from "sonner";

export async function forceFullAppReload() {
  toast.info("Limpando cache e atualizando...");
  
  try {
    // 1. Limpar TODOS os caches do PWA
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[PWA] Todos os caches limpos:', cacheNames);
    }
    
    // 2. Forçar update e desregistrar service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        try {
          await registration.update();
          await registration.unregister();
          console.log('[PWA] Service worker desregistrado');
        } catch (e) {
          console.warn('[PWA] Erro ao desregistrar SW:', e);
        }
      }
    }
    
    // 3. Limpar localStorage de versão
    localStorage.removeItem('app-version');
    
    // 4. Pequeno delay para garantir que tudo foi processado
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 5. Recarregar com cache-busting
    window.location.replace(window.location.origin + '/?forceReload=' + Date.now());
  } catch (error) {
    console.error('[PWA] Erro ao forçar atualização:', error);
    // Mesmo com erro, tentar recarregar
    window.location.reload();
  }
}
