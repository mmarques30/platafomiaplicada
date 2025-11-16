import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const IDLE_MS = 60 * 60 * 1000; // 60 minutos (1 hora)
const WARNING_MS = 55 * 60 * 1000; // 55 minutos (aviso 5 min antes)
const CHANNEL = "idle-session";
const KEY = "last-activity-ts";

export function useIdleLogout(idleMs = IDLE_MS) {
  const { user, signOut } = useAuth();
  const timerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const warningToastIdRef = useRef<string | number | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const showWarning = () => {
    if (warningToastIdRef.current) {
      toast.dismiss(warningToastIdRef.current);
    }

    warningToastIdRef.current = toast.warning(
      "Sua sessão expirará em 5 minutos por inatividade",
      {
        duration: Infinity,
        action: {
          label: "Continuar conectado",
          onClick: () => {
            resetTimer();
            bcRef.current?.postMessage({ type: "extend-session" });
          },
        },
        onDismiss: () => {
          warningToastIdRef.current = null;
        },
      }
    );
  };

  const resetTimer = () => {
    const now = Date.now();
    localStorage.setItem(KEY, String(now));
    
    if (warningToastIdRef.current) {
      toast.dismiss(warningToastIdRef.current);
      warningToastIdRef.current = null;
    }
    
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    
    warningTimerRef.current = window.setTimeout(() => {
      showWarning();
      bcRef.current?.postMessage({ type: "show-warning" });
    }, WARNING_MS);
    
    timerRef.current = window.setTimeout(() => {
      bcRef.current?.postMessage({ type: "logout" });
      signOut();
    }, idleMs);
  };

  useEffect(() => {
    if (!user) return;

    // Inicializar BroadcastChannel se disponível
    bcRef.current = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

    const onMessage = (ev: MessageEvent<any>) => {
      if (ev.data?.type === "activity") {
        resetTimer();
      }
      if (ev.data?.type === "extend-session") {
        resetTimer();
      }
      if (ev.data?.type === "show-warning") {
        showWarning();
      }
      if (ev.data?.type === "logout") {
        signOut();
      }
    };

    if (bcRef.current) {
      bcRef.current.addEventListener("message", onMessage);
    }

    const onActivity = () => {
      resetTimer();
      bcRef.current?.postMessage({ type: "activity", ts: Date.now() });
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    
    events.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));
    
    // visibilitychange é do document, não do window
    document.addEventListener("visibilitychange", onActivity, { passive: true });

    // Inicializa estado de atividade
    resetTimer();

    // Verificação periódica via localStorage (fallback para sincronização entre abas)
    const checkInterval = window.setInterval(() => {
      const ts = Number(localStorage.getItem(KEY) || "0");
      const elapsed = Date.now() - ts;
      
      if (elapsed > WARNING_MS && elapsed < idleMs && !warningToastIdRef.current) {
        showWarning();
      }
      
      if (ts && elapsed > idleMs) {
        bcRef.current?.postMessage({ type: "logout" });
        signOut();
      }
    }, 30_000); // Verifica a cada 30 segundos

    return () => {
      events.forEach(evt => window.removeEventListener(evt, onActivity));
      document.removeEventListener("visibilitychange", onActivity);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      if (warningToastIdRef.current) toast.dismiss(warningToastIdRef.current);
      if (bcRef.current) bcRef.current.close();
      clearInterval(checkInterval);
    };
  }, [user?.id, signOut, idleMs]);
}
