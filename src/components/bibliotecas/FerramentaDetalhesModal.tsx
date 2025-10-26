import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/RatingStars";
import { ExternalLink, CheckCircle, AlertCircle, Wrench } from "lucide-react";

interface FerramentaDetalhesModalProps {
  ferramenta: any;
  onClose: () => void;
}

export function FerramentaDetalhesModal({ ferramenta, onClose }: FerramentaDetalhesModalProps) {
  if (!ferramenta) return null;

  const {
    nome,
    categoria,
    objetivo,
    o_que_entrega,
    logo_url,
    avaliacao,
    vale_a_pena,
    justificativa,
    link_ferramenta,
    gratuito,
  } = ferramenta;

  return (
    <Dialog open={!!ferramenta} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
              {logo_url ? (
                <img src={logo_url} alt={nome} className="w-full h-full object-contain" />
              ) : (
                <Wrench className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{nome}</DialogTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{categoria}</Badge>
                {gratuito && <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Gratuita</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Avaliação */}
        <div className="flex items-center gap-3 mb-6">
          <RatingStars rating={avaliacao || 0} size="lg" />
        </div>

        {/* Seção: Objetivo */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Objetivo</h3>
          <p className="text-muted-foreground">{objetivo}</p>
        </div>

        {/* Seção: O que Entrega */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">O que Entrega</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{o_que_entrega}</p>
        </div>

        {/* Seção: Vale a Pena? */}
        {vale_a_pena !== null && justificativa && (
          <div className={`p-4 rounded-lg mb-6 border ${
            vale_a_pena 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {vale_a_pena ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Vale a pena!</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Não recomendado</h3>
                </>
              )}
            </div>
            <p className="text-sm text-foreground/80">{justificativa}</p>
          </div>
        )}

        {/* Botão de Ação */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {link_ferramenta && (
            <Button onClick={() => window.open(link_ferramenta, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Ferramenta
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
