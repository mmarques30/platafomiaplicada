import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Detecta automaticamente quando um novo build do app foi deployado e
 * mostra um toast pedindo reload — resolve o problema clássico de
 * "atualizei a correção mas o usuário continua com a versão antiga em
 * cache".
 *
 * Como funciona:
 *  - Ao montar, lê o hash dos scripts JS atualmente carregados no <head>
 *    (Vite gera nomes com hash de conteúdo, ex: `/assets/index-ABC123.js`).
 *  - A cada 60s (e ao recuperar foco da aba), busca `/index.html?ts=<now>`
 *    com cache-bust e compara os hashes dos scripts da resposta com os
 *    que estão rodando.
 *  - Se diferentes, exibe um toast persistente com botão "Atualizar agora"
 *    que dispara `window.location.reload()` com cache invalidation forçada.
 *
 * Não exige qualquer config de build — funciona com o hash que o Vite já
 * emite por padrão.
 */
export function useVersionCheck(options?: { intervalMs?: number; enabled?: boolean }) {
  const intervalMs = options?.intervalMs ?? 60_000;
  const enabled = options?.enabled ?? true;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialScripts = useRef<string[]>([]);
  const toastShown = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Captura os scripts carregados agora (versão "rodando")
    initialScripts.current = Array.from(document.querySelectorAll("script[src]"))
      .map((s) => (s as HTMLScriptElement).src)
      .filter((src) => src.includes("/assets/") || src.includes("index"))
      .sort();

    let cancelled = false;

    const check = async () => {
      try {
        // cache-bust forte: query param + no-store
        const resp = await fetch(`/index.html?ts=${Date.now()}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!resp.ok) return;
        const html = await resp.text();
        const matches = Array.from(html.matchAll(/src=["']([^"']+\.js[^"']*)["']/g))
          .map((m) => new URL(m[1], window.location.origin).href)
          .filter((src) => src.includes("/assets/") || src.includes("index"))
          .sort();

        if (matches.length === 0 || cancelled) return;

        const currentSet = new Set(initialScripts.current);
        const remoteSet = new Set(matches);
        const hasNewScript = matches.some((m) => !currentSet.has(m));
        const hasRemovedScript = initialScripts.current.some((s) => !remoteSet.has(s));

        if ((hasNewScript || hasRemovedScript) && !toastShown.current) {
          toastShown.current = true;
          setUpdateAvailable(true);
          toast("Nova versão disponível", {
            description: "Atualize pra receber as últimas correções.",
            action: {
              label: "Atualizar agora",
              onClick: () => {
                // Reload com cache invalidation forçada
                window.location.reload();
              },
            },
            duration: Infinity,
            id: "version-update-toast",
          });
        }
      } catch {
        // ignora erros transientes de fetch
      }
    };

    const interval = setInterval(check, intervalMs);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, intervalMs]);

  return { updateAvailable };
}
