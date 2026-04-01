import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';

const YOUTUBE_VIDEO_ID = 'SUBSTITUIR_PELO_ID_DO_VIDEO';

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#14160F', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0C0F0A' }}>
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div style={{ padding: '28px 32px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#AFC040', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>✱ IAplicada</p>
          <p style={{ fontSize: 21, fontWeight: 600, color: '#E2E5DC', marginBottom: 8, lineHeight: 1.3 }}>Bem-vindo à sua jornada.</p>
          <p style={{ fontSize: 14, color: '#6B7060', lineHeight: 1.7, marginBottom: 28 }}>Assista ao vídeo acima — preparei uma mensagem especial para você começar com tudo. Quando estiver pronto, clique em entrar.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={handleEnter} disabled={entering} style={{ background: '#AFC040', color: '#0C0F0A', fontSize: 14, fontWeight: 600, padding: '12px 32px', borderRadius: 10, border: 'none', cursor: entering ? 'not-allowed' : 'pointer', opacity: entering ? 0.7 : 1, fontFamily: 'inherit', transition: 'opacity 0.15s' }}>
              {entering ? 'Entrando...' : 'Entrar na plataforma →'}
            </button>
            <button onClick={handleEnter} disabled={entering} style={{ background: 'transparent', color: '#6B7060', fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '12px 0' }}>
              Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
