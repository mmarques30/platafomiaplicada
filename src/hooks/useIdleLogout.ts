import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const IDLE_MS = 3 * 60 * 60 * 1000; // 3 horas de inatividade
const FIVE_MIN_MS = 5 * 60 * 1000; // 5 minutos
const CHANNEL = "idle-session";
const KEY = "last-activity-ts";
const DEBOUNCE_MS = 1000; // 1 segundo de debounce para evitar chamadas excessivas

export function useIdleLogout(idleMs = IDLE_MS) {
  const { user, signOut } = useAuth();
  const timerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const warningToastIdRef = useRef<string | number | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const lastResetRef = useRef<number>(0);

  const showWarning = useCallback(() => {
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
            // Reset manual pelo usuário - força reset ignorando debounce
            lastResetRef.current = 0;
            resetTimerInternal();
            bcRef.current?.postMessage({ type: "extend-session" });
          },
        },
        onDismiss: () => {
          warningToastIdRef.current = null;
        },
      }
    );
  }, []);

  const resetTimerInternal = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(KEY, String(now));
    
    if (warningToastIdRef.current) {
      toast.dismiss(warningToastIdRef.current);
      warningToastIdRef.current = null;
    }
    
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    
    // Calcular warning dinamicamente (idleMs - 5 minutos)
    const warningMs = Math.max(idleMs - FIVE_MIN_MS, 0);
    
    warningTimerRef.current = window.setTimeout(() => {
      showWarning();
      bcRef.current?.postMessage({ type: "show-warning" });
    }, warningMs);
    
    timerRef.current = window.setTimeout(() => {
      bcRef.current?.postMessage({ type: "logout" });
      signOut();
    }, idleMs);
  }, [idleMs, showWarning, signOut]);

  // resetTimer com debounce para evitar chamadas excessivas
  const resetTimer = useCallback(() => {
    const now = Date.now();
    // Debounce: só executa se passou mais de DEBOUNCE_MS desde a última execução
    if (now - lastResetRef.current < DEBOUNCE_MS) return;
    lastResetRef.current = now;
    
    resetTimerInternal();
  }, [resetTimerInternal]);

  useEffect(() => {
    if (!user) return;

    // Inicializar BroadcastChannel se disponível
    bcRef.current = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

    const onMessage = (ev: MessageEvent<any>) => {
      if (ev.data?.type === "activity") {
        resetTimer();
      }
      if (ev.data?.type === "extend-session") {
        // Força reset ignorando debounce
        lastResetRef.current = 0;
        resetTimerInternal();
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
    resetTimerInternal();

    // Verificação periódica via localStorage (fallback para sincronização entre abas)
    const warningMs = Math.max(idleMs - FIVE_MIN_MS, 0);
    
    const checkInterval = window.setInterval(() => {
      const ts = Number(localStorage.getItem(KEY) || "0");
      const elapsed = Date.now() - ts;
      
      if (elapsed > warningMs && elapsed < idleMs && !warningToastIdRef.current) {
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
  }, [user?.id, signOut, idleMs, resetTimer, resetTimerInternal, showWarning]);
}
