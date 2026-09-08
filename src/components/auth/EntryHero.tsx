import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface EntryHeroProps {
  /** Disparado pelo CTA "Começar a aplicar" — abre o acesso (email + senha). */
  onStart: () => void;
}

const PLATFORM_HIGHLIGHTS = [
  "Trilhas práticas",
  "Métodos para aplicar",
  "Biblioteca de prompts",
  "MarIAna, sua assistente",
];

/**
 * EntryHero — primeira tela da plataforma, no branding da LP iaplicada.com.
 *
 * Estrutura adaptada do hero "Sustainable Solutions" (21st.dev): frase
 * central + CTA pill com seta que desliza. Em vez das linhas verticais e da
 * foto, o fundo é o quadriculado escuro da LP (IAplicadaBackground) e a
 * tipografia segue o hero da LP: Instrument Serif italic com trecho em lime.
 *
 * A frase diz o que a pessoa consegue fazer ao entrar: aprender, aplicar e
 * entregar mais rápido — eco direto do "Faça o dobro. Entregue em metade do
 * tempo." usado em iaplicada.com.
 */
export function EntryHero({ onStart }: EntryHeroProps) {
  return (
    <div className="w-full max-w-5xl text-center">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="ia-entry-mono inline-flex items-center gap-2.5"
      >
        <span className="ia-entry-mono__rule" aria-hidden />
        IAplicada · Plataforma
        <span className="ia-entry-mono__rule" aria-hidden />
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12 }}
        className="ia-entry-h1 mt-7"
      >
        Aprenda IA de verdade.
        <br />
        <em>Aplique no seu trabalho hoje.</em>
        <br />
        Entregue em metade do tempo.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="ia-entry-sub mx-auto mt-7 max-w-2xl"
      >
        Trilhas práticas, métodos, biblioteca de prompts e a MarIAna, sua
        assistente de IA. Tudo em um lugar só para você aprender, aplicar e
        acompanhar seus resultados.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <button type="button" onClick={onStart} className="ia-entry-cta group">
          <span className="ia-entry-cta__label">Começar a aplicar</span>
          <span className="ia-entry-cta__icon" aria-hidden>
            <ArrowUpRight className="absolute h-5 w-5 -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
            <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
          </span>
        </button>
        <p className="ia-entry-hint">
          Entre com seu e-mail e senha. Você já cai direto no seu ambiente.
        </p>
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="ia-entry-strip mt-14"
        aria-label="O que você encontra na plataforma"
      >
        {PLATFORM_HIGHLIGHTS.map((item, index) => (
          <li key={item} className="ia-entry-strip__item">
            {index > 0 && (
              <span className="ia-entry-strip__spark" aria-hidden>
                ✱
              </span>
            )}
            <span>{item}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
