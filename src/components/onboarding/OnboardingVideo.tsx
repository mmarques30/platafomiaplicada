import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';

const YOUTUBE_VIDEO_ID = 'SEU_ID_AQUI';
const VIDEO_CONFIGURADO = YOUTUBE_VIDEO_ID !== 'SEU_ID_AQUI' && (YOUTUBE_VIDEO_ID as string).length > 5;

interface OnboardingVideoProps {
  previewMode?: boolean;
  onClose?: () => void;
}

export function OnboardingVideo({ previewMode = false, onClose }: OnboardingVideoProps) {
  const { profile } = useUserProfile();
  const { track } = useOnboardingTracking();
  const [visible, setVisible] = useState(previewMode);

  useEffect(() => {
    if (!previewMode && profile?.primeiro_acesso === true && profile?.senha_temporaria !== true) {
      const jaVisto = sessionStorage.getItem('onboarding_video_visto') === 'true';
      if (!jaVisto) setVisible(true);
    }
  }, [profile, previewMode]);

  const handleEnter = () => {
    if (previewMode) {
      setVisible(false);
      onClose?.();
      return;
    }
    track('video_visto');
    sessionStorage.setItem('onboarding_video_visto', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="bg-brand-cream-soft border border-brand-hairline rounded-2xl overflow-hidden w-full max-w-[560px] shadow-2xl shadow-foreground/15 mx-4">
        {VIDEO_CONFIGURADO ? (
          <div className="relative pb-[56.25%] bg-brand-cream">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Bem-vindo à IAplicada"
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center gap-4 bg-brand-cream">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-serif-display text-brand-strong bg-brand-strong/12 border-2 border-brand-strong/40">
              M
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[300px] leading-[1.6]">
              Em breve: uma mensagem especial da Mariana para você começar.
            </p>
          </div>
        )}
        <div className="px-8 py-7">
          <p className="text-[10px] font-medium text-brand-strong uppercase tracking-[0.16em] mb-3">
            IAplicada
          </p>
          <h2 className="font-serif-display text-2xl md:text-[26px] leading-[1.15] tracking-tight text-foreground mb-3">
            Bem-vindo à sua jornada.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-7">
            Assista ao vídeo acima — preparei uma mensagem especial para você começar com tudo. Quando estiver pronto, clique em entrar.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleEnter}
              className="bg-brand-strong text-brand-cream text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-strong/90 transition-colors shadow-sm"
            >
              Entrar na plataforma →
            </button>
            <button
              onClick={handleEnter}
              className="bg-transparent text-muted-foreground hover:text-foreground text-[13px] py-2.5 transition-colors"
            >
              Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
