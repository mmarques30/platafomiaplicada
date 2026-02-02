import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Atualizar ultimo_acesso quando o usuário faz login
        if (session?.user) {
          setTimeout(async () => {
            // Verificar se é visitante com acesso expirado
            const { data: profile } = await supabase
              .from("profiles")
              .select("is_visitante, acesso_expirado")
              .eq("id", session.user.id)
              .single();
            
            // Se acesso expirado, redirecionar
            if (profile?.is_visitante && profile?.acesso_expirado) {
              window.location.href = "/acesso-expirado";
              return;
            }
            
            // Atualizar ultimo_acesso
            supabase
              .from("profiles")
              .update({ ultimo_acesso: new Date().toISOString() })
              .eq("id", session.user.id);
          }, 0);
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

  // Atualizar ultimo_acesso periodicamente (a cada 2 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await supabase
        .from("profiles")
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq("id", user.id);
    }, 2 * 60 * 1000); // A cada 2 minutos

    return () => clearInterval(interval);
  }, [user]);

  const signOut = async () => {
    try {
      // Limpar ambiente selecionado
      sessionStorage.removeItem("selected_environment");
      
      await supabase.auth.signOut();
      
      // CRÍTICO: Limpar TODO o cache do React Query
      queryClient.clear();
      
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return { 
    user, 
    session, 
    loading, 
    signOut
  };
}