import { Navigate } from "react-router-dom";

/**
 * Modelos prontos virou a aba "Modelos" de Métodos práticos.
 *
 * A rota continua existindo e redireciona para lá: links antigos, favoritos
 * do navegador e qualquer lugar do sistema que ainda aponte para
 * `/ia-copie-use` chegam no mesmo conteúdo em vez de num 404.
 */
export default function IACopieUse() {
  return <Navigate to="/metodos-aplicar?tab=modelos" replace />;
}
