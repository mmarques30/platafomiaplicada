import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Smartphone, X, ArrowRight } from 'lucide-react';

export function PWAInstallBanner() {
  const navigate = useNavigate();
  const { canInstall, isDismissed, dismissBanner } = usePWAInstall();

  // Não mostrar se já instalado, não pode instalar, ou foi dispensado
  if (!canInstall || isDismissed) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm md:text-base">
              Instale o app para acesso rápido
            </p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              Sempre atualizado, direto da tela inicial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/instalar')}
            className="hidden sm:flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            Saiba mais
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/instalar')}
            className="sm:hidden text-primary hover:bg-primary/10"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            onClick={dismissBanner}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
