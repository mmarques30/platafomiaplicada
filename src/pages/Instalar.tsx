import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Smartphone, 
  Zap, 
  RefreshCw, 
  WifiOff,
  Share2,
  PlusSquare,
  CheckCircle2,
  ArrowLeft,
  Monitor
} from 'lucide-react';
// Usar caminho estático para evitar problemas de cache no PWA
const logoSimbolo = "/logo-simbolo.png?v=8";

export default function Instalar() {
  const navigate = useNavigate();
  const { deviceType, triggerInstall, isInstalled, canInstall } = usePWAInstall();

  const beneficios = [
    {
      icon: Smartphone,
      titulo: 'Acesso direto',
      descricao: 'Abra o app direto da tela inicial do seu dispositivo'
    },
    {
      icon: Zap,
      titulo: 'Tela cheia',
      descricao: 'Experiência imersiva sem a barra do navegador'
    },
    {
      icon: RefreshCw,
      titulo: 'Sempre atualizado',
      descricao: 'Receba as novidades automaticamente'
    },
    {
      icon: WifiOff,
      titulo: 'Funciona offline',
      descricao: 'Acesse conteúdos mesmo sem internet'
    }
  ];

  // Se já está instalado
  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">App já instalado</h1>
            <p className="text-muted-foreground">
              O IAplicada Academy já está instalado no seu dispositivo.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden bg-card border border-border shadow-lg">
            <img 
              src={logoSimbolo} 
              alt="IAplicada" 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Instale o IAplicada Academy
          </h1>
          <p className="text-muted-foreground">
            Tenha acesso rápido ao app no seu dispositivo
          </p>
        </div>

        {/* Instruções por dispositivo */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {deviceType === 'ios' ? (
              // Instruções iOS
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span>Instalação no iPhone/iPad</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Toque no ícone de compartilhar</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Na barra inferior do Safari, toque no ícone
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded border">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Compartilhar</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Selecione "Adicionar à Tela Inicial"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Role as opções e encontre esta opção
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded border">
                        <PlusSquare className="w-4 h-4" />
                        <span className="text-sm">Adicionar à Tela Inicial</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Confirme tocando em "Adicionar"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        O app será adicionado à sua tela inicial
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Instruções Android/Desktop
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-medium">
                  {deviceType === 'android' ? (
                    <Smartphone className="w-5 h-5 text-primary" />
                  ) : (
                    <Monitor className="w-5 h-5 text-primary" />
                  )}
                  <span>
                    Instalação no {deviceType === 'android' ? 'Android' : 'Computador'}
                  </span>
                </div>

                {canInstall ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-6">
                      Clique no botão abaixo para adicionar o app ao seu dispositivo
                    </p>
                    <Button
                      size="lg"
                      onClick={triggerInstall}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-5 h-5" />
                      Instalar Agora
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Seu navegador não mostrou o prompt de instalação. Tente:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Usar o Chrome ou Edge para acessar esta página
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Procurar o ícone de instalação na barra de endereço
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        Acessar o menu do navegador e procurar "Instalar app"
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefícios */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Por que instalar?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {beneficios.map((beneficio) => (
              <div 
                key={beneficio.titulo}
                className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <beneficio.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{beneficio.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {beneficio.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voltar */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
