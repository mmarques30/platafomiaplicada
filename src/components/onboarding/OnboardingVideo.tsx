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
    if (!previewMode && profile?.primeiro_acesso === true) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-[8px]">
      <div className="bg-[#14160F] rounded-2xl overflow-hidden w-full max-w-[560px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/[0.06]">
        {VIDEO_CONFIGURADO ? (
          <div className="relative pb-[56.25%] bg-[#0C0F0A]">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Bem-vindo à IAplicada"
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg, #0C0F0A 0%, #1A1E14 100%)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-bold text-[#AFC040]" style={{ background: 'rgba(175,192,64,0.15)', border: '2px solid rgba(175,192,64,0.4)' }}>
              M
            </div>
            <p className="text-sm text-[#6B7060] text-center max-w-[300px] leading-[1.6]">
              Em breve: uma mensagem especial da Mariana para você começar.
            </p>
          </div>
        )}
        <div className="px-8 py-7">
          <p className="text-[10px] font-semibold text-[#AFC040] uppercase tracking-[0.1em] mb-2">✱ IAplicada</p>
          <p className="text-[21px] font-semibold text-[#E2E5DC] mb-2 leading-[1.3]">Bem-vindo à sua jornada.</p>
          <p className="text-sm text-[#6B7060] leading-[1.7] mb-7">Assista ao vídeo acima — preparei uma mensagem especial para você começar com tudo. Quando estiver pronto, clique em entrar.</p>
          <div className="flex items-center gap-4">
            <button onClick={handleEnter} className="bg-[#AFC040] text-[#0C0F0A] text-sm font-semibold px-8 py-3 rounded-[10px] border-none font-[inherit] transition-opacity duration-150 cursor-pointer opacity-100">
              Entrar na plataforma →
            </button>
            <button onClick={handleEnter} className="bg-transparent text-[#6B7060] text-[13px] border-none cursor-pointer font-[inherit] py-3 px-0">
              Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
