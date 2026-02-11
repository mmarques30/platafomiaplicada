import { useEffect } from 'react';

const CURRENT_VERSION = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const VERSION_KEY = 'app-version';

export function useVersionCheck() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion && storedVersion !== CURRENT_VERSION) {
      console.log('[Version] Nova versão detectada:', CURRENT_VERSION, '(anterior:', storedVersion, ')');
      
      // Limpar TODOS os caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            console.log('[Version] Removendo cache:', name);
            caches.delete(name);
          });
        });
      }
      
      // Forçar update do Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const reg of registrations) {
            reg.update();
          }
        });
      }
      
      // Atualizar versão armazenada
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      // Recarregar após limpeza
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  }, []);
}
