import { motion } from "framer-motion";

import { SAIDA_LONGA } from "./motion-entrada";

/**
 * O ambiente do acesso inicial.
 *
 * Antes, um quadriculado denso com dois glows enormes lavava a tela inteira
 * de verde, e o conteúdo disputava contraste com o fundo. A estrutura agora é
 * a do refractweb.com: base escura neutra, e a cor concentrada em dois orbes
 * saturados fora do enquadramento, num canto só. O resto da tela fica limpo,
 * que é o que deixa a tipografia respirar.
 *
 * Os orbes também chegam: entram em escala ao longo de dois segundos, mais
 * devagar que qualquer texto, então a luz já está lá quando a pessoa começa a
 * ler. Depois disso eles derivam devagar, em ciclos longos e dessincronizados,
 * para a tela nunca ficar parada sem chamar atenção.
 *
 * Fica atrás do conteúdo; o wrapper precisa ser `relative overflow-hidden` e o
 * conteúdo, z-10.
 */
export function IAplicadaBackground() {
  return (
    <div className="ia-entry-bg" aria-hidden="true">
      <div className="ia-entry-bg__grid" />

      <motion.div
        className="ia-entry-bg__orbe ia-entry-bg__orbe--lime"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: SAIDA_LONGA }}
      />
      <motion.div
        className="ia-entry-bg__orbe ia-entry-bg__orbe--oliva"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.25, ease: SAIDA_LONGA }}
      />

      <div className="ia-entry-bg__grain" />
    </div>
  );
}
