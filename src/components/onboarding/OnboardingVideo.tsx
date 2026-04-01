import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';

const YOUTUBE_VIDEO_ID = 'SEU_ID_AQUI';

export function OnboardingVideo() {
  const { profile } = useUserProfile();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (profile?.primeiro_acesso === true) {
      setVisible(true);
    }
  }, [profile]);

  const handleEnter = async () => {
    setEntering(true);
    try {
      await supabase
        .from('profiles')
        .update({ primeiro_acesso: false })
        .eq('id', profile?.id);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (e) {
      console.error('Onboarding update error:', e);
    }
    setVisible(false);
    setEntering(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-[8px]">
      <div className="bg-[#14160F] rounded-2xl overflow-hidden w-full max-w-[560px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/[0.06]">
        <div className="relative pb-[56.25%] bg-[#0C0F0A]">
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
            className="absolute top-0 left-0 w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="px-8 py-7">
          <p className="text-[10px] font-semibold text-[#AFC040] uppercase tracking-[0.1em] mb-2">✱ IAplicada</p>
          <p className="text-[21px] font-semibold text-[#E2E5DC] mb-2 leading-[1.3]">Bem-vindo à sua jornada.</p>
          <p className="text-sm text-[#6B7060] leading-[1.7] mb-7">Assista ao vídeo acima — preparei uma mensagem especial para você começar com tudo. Quando estiver pronto, clique em entrar.</p>
          <div className="flex items-center gap-4">
            <button onClick={handleEnter} disabled={entering} className={`bg-[#AFC040] text-[#0C0F0A] text-sm font-semibold px-8 py-3 rounded-[10px] border-none font-[inherit] transition-opacity duration-150 ${entering ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'}`}>
              {entering ? 'Entrando...' : 'Entrar na plataforma →'}
            </button>
            <button onClick={handleEnter} disabled={entering} className="bg-transparent text-[#6B7060] text-[13px] border-none cursor-pointer font-[inherit] py-3 px-0">
              Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
