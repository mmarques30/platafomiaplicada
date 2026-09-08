import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

interface EntryHeroProps {
  /** Disparado pelo CTA "Começar a aplicar" — abre o acesso (email + senha). */
  onStart: () => void;
}

/**
 * EntryHero — primeira tela da plataforma, no branding da LP iaplicada.com.
 *
 * Estrutura adaptada do hero "Sustainable Solutions" (21st.dev): frase
 * central + CTA pill com seta que desliza. Em vez das linhas verticais e da
 * foto, o fundo é o quadriculado escuro da LP (IAplicadaBackground) e a
 * tipografia segue o hero da LP: Instrument Serif italic com trecho em lime.
 *
 * Copy = proposta de valor da LP: "Faça o dobro. Entregue em metade do tempo."
 */
export function EntryHero({ onStart }: EntryHeroProps) {
  return (
    <div className="w-full max-w-5xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="ia-entry-logo-row"
      >
        <span className="ia-entry-logo-row__rule" aria-hidden />
        <img src={logoIAplicada} alt="IAplicada" className="ia-entry-logo-row__logo" />
        <span className="ia-entry-logo-row__rule" aria-hidden />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12 }}
        className="ia-entry-h1 mt-8"
      >
        Faça o dobro.
        <br />
        <em>Entregue em metade do tempo.</em>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="ia-entry-sub mx-auto mt-7 max-w-2xl"
      >
        Tudo em um só lugar para você aumentar seus resultados.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        className="mt-10 flex justify-center"
      >
        <button type="button" onClick={onStart} className="ia-entry-cta group">
          <span className="ia-entry-cta__label">Começar a aplicar</span>
          <span className="ia-entry-cta__icon" aria-hidden>
            <ArrowUpRight className="absolute h-5 w-5 -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
            <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}
