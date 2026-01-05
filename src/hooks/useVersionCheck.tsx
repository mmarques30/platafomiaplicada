import { useEffect } from 'react';

const CURRENT_VERSION = '2026-01-05-v6';
const VERSION_KEY = 'app-version';

export function useVersionCheck() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion && storedVersion !== CURRENT_VERSION) {
      console.log('[Version] Nova versão detectada:', CURRENT_VERSION, '(anterior:', storedVersion, ')');
      
      // Limpar caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            console.log('[Version] Removendo cache:', name);
            caches.delete(name);
          });
        });
      }
      
      // Atualizar versão armazenada
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      // Recarregar após limpeza
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  }, []);
}
