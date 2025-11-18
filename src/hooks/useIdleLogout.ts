import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 horas de inatividade
const FIVE_MIN_MS = 5 * 60 * 1000; // 5 minutos
const CHANNEL = "idle-session";
const KEY = "last-activity-ts";

export function useIdleLogout(idleMs = IDLE_MS) {
  const { user, signOut } = useAuth();
  const timerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const warningToastIdRef = useRef<string | number | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const showWarning = () => {
    console.log("[IdleLogout] showWarning - aviso de sessão expira em 5 min");
    
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
            console.log("[IdleLogout] Usuário clicou em 'Continuar conectado'");
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
    console.log("[IdleLogout] resetTimer chamado em", new Date().toISOString());
    
    if (warningToastIdRef.current) {
      toast.dismiss(warningToastIdRef.current);
      warningToastIdRef.current = null;
    }
    
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    
    // Calcular warning dinamicamente (idleMs - 5 minutos)
    const warningMs = Math.max(idleMs - FIVE_MIN_MS, 0);
    
    warningTimerRef.current = window.setTimeout(() => {
      console.log("[IdleLogout] Aviso disparado pelo TIMER após", warningMs, "ms");
      showWarning();
      bcRef.current?.postMessage({ type: "show-warning" });
    }, warningMs);
    
    timerRef.current = window.setTimeout(() => {
      console.log("[IdleLogout] Logout disparado pelo TIMER (idleMs)", { idleMs });
      bcRef.current?.postMessage({ type: "logout" });
      signOut();
    }, idleMs);
  };

  useEffect(() => {
    if (!user) return;

    // Inicializar BroadcastChannel se disponível
    bcRef.current = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

    const onMessage = (ev: MessageEvent<any>) => {
      console.log("[IdleLogout] Mensagem recebida no BroadcastChannel:", ev.data);
      
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
        console.log("[IdleLogout] Logout recebido via BroadcastChannel");
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
    const warningMs = Math.max(idleMs - FIVE_MIN_MS, 0);
    
    const checkInterval = window.setInterval(() => {
      const ts = Number(localStorage.getItem(KEY) || "0");
      const elapsed = Date.now() - ts;
      console.log("[IdleLogout] checkInterval", { ts, elapsed, warningMs, idleMs });
      
      if (elapsed > warningMs && elapsed < idleMs && !warningToastIdRef.current) {
        console.log("[IdleLogout] Aviso disparado pelo INTERVALO", { elapsed, warningMs, idleMs });
        showWarning();
      }
      
      if (ts && elapsed > idleMs) {
        console.log("[IdleLogout] Logout disparado pelo INTERVALO (elapsed > idleMs)", { elapsed, idleMs });
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
