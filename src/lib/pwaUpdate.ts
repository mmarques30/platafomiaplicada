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
    
    // 2. Desregistrar service workers (sem chamar update() antes)
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        try {
          await registration.unregister();
          console.log('[PWA] Service worker desregistrado');
        } catch (e) {
          console.warn('[PWA] Erro ao desregistrar SW:', e);
        }
      }
    }
    
    // 3. Limpar localStorage de versão
    localStorage.removeItem('app-version');
    
    // 4. Delay maior para iOS/Safari processar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Recarregar de forma mais segura para Safari
    window.location.href = window.location.origin + '/';
  } catch (error) {
    console.error('[PWA] Erro ao forçar atualização:', error);
    // Fallback simples
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  }
}
