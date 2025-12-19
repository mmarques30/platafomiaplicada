import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstall {
  canInstall: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
  deviceType: 'ios' | 'android' | 'desktop';
  triggerInstall: () => Promise<void>;
  dismissBanner: () => void;
}

const DISMISS_KEY = 'pwa-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function usePWAInstall(): UsePWAInstall {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Detectar tipo de dispositivo
  const getDeviceType = useCallback((): 'ios' | 'android' | 'desktop' => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    return 'desktop';
  }, []);

  const [deviceType] = useState<'ios' | 'android' | 'desktop'>(getDeviceType);

  // Verificar se já está instalado
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Escutar mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => mediaQuery.removeEventListener('change', checkInstalled);
  }, []);

  // Verificar se foi dispensado recentemente
  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  // Capturar evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Função para disparar instalação
  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // Função para dispensar o banner
  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  // canInstall: tem prompt disponível OU é iOS (que não suporta prompt mas pode instalar manualmente)
  const canInstall = !isInstalled && (!!deferredPrompt || deviceType === 'ios');

  return {
    canInstall,
    isInstalled,
    isDismissed,
    deviceType,
    triggerInstall,
    dismissBanner
  };
}
