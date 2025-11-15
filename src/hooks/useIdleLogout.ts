import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

const IDLE_MS = 10 * 60 * 1000; // 10 minutos
const CHANNEL = "idle-session";
const KEY = "last-activity-ts";

export function useIdleLogout(idleMs = IDLE_MS) {
  const { user, signOut } = useAuth();
  const timerRef = useRef<number | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const resetTimer = () => {
    const now = Date.now();
    localStorage.setItem(KEY, String(now));
    if (timerRef.current) window.clearTimeout(timerRef.current);
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
      if (ts && Date.now() - ts > idleMs) {
        bcRef.current?.postMessage({ type: "logout" });
        signOut();
      }
    }, 30_000); // Verifica a cada 30 segundos

    return () => {
      events.forEach(evt => window.removeEventListener(evt, onActivity));
      document.removeEventListener("visibilitychange", onActivity);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (bcRef.current) bcRef.current.close();
      clearInterval(checkInterval);
    };
  }, [user?.id, signOut, idleMs]);
}
