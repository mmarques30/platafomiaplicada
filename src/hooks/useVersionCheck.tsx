import { useEffect } from 'react';

const CURRENT_VERSION = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
const VERSION_KEY = 'app-version';

export function useVersionCheck() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);

    if (storedVersion && storedVersion !== CURRENT_VERSION) {
      console.log('[Version] Nova versão detectada:', CURRENT_VERSION, '(anterior:', storedVersion, ')');
    }

    // Apenas registrar a versão atual - o SW cuida do resto
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }, []);
}
