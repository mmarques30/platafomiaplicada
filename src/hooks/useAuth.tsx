import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [precisaTrocarSenha, setPrecisaTrocarSenha] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Verificar senha temporária após login
        if (session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('senha_temporaria, primeiro_acesso')
              .eq('id', session.user.id)
              .single();

            if (profile?.senha_temporaria || profile?.primeiro_acesso) {
              setPrecisaTrocarSenha(true);
            }
          }, 0);
        } else {
          setPrecisaTrocarSenha(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return { 
    user, 
    session, 
    loading, 
    signOut,
    precisaTrocarSenha,
    setPrecisaTrocarSenha
  };
}