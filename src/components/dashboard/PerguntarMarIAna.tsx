import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { MarIAnaChatDrawer } from "@/components/shared/MarIAnaChatDrawer";

/**
 * Porta de entrada da MarIAna no painel. O campo aqui não conversa: ele abre
 * a gaveta, que é onde a conversa acontece de verdade.
 */
export function PerguntarMarIAna() {
  const [aberta, setAberta] = useState(false);

  return (
    <>
      <section className="rounded-card border border-border bg-card p-5 shadow-card">
        <span className="rotulo-mono" style={{ textTransform: "none", letterSpacing: "0.06em" }}>
          MarIAna
        </span>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Pergunte sobre qualquer aula, prompt ou ferramenta da plataforma.
        </p>

        <button
          type="button"
          onClick={() => setAberta(true)}
          className="group mt-4 flex w-full items-center gap-2 rounded-full border border-border bg-surface py-2.5 pl-4 pr-2.5 text-left transition-colors hover:border-primary/50"
        >
          <span className="flex-1 truncate text-sm text-muted-foreground">
            Como aplico isso no meu time?
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </button>
      </section>

      <AnimatePresence>
        {aberta && <MarIAnaChatDrawer onClose={() => setAberta(false)} />}
      </AnimatePresence>
    </>
  );
}
