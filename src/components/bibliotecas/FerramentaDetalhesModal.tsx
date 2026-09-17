import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/RatingStars";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { ExternalLink, CheckCircle, AlertCircle, Star } from "lucide-react";
import { useFerramentaRating } from "@/hooks/useFerramentaRating";

interface FerramentaDetalhesModalProps {
  ferramenta: any;
  onClose: () => void;
}

export function FerramentaDetalhesModal({ ferramenta, onClose }: FerramentaDetalhesModalProps) {
  const { stats, isAdmin, rate, isRating } = useFerramentaRating(ferramenta?.id);

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

  // Só a mentora dá nota. Mentorado e visitante leem a indicação.
  const handleRate = (nota: number) => {
    if (!isAdmin || isRating) return;
    rate(nota);
  };

  return (
    <Dialog open={!!ferramenta} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <ToolLogo 
              logoUrl={logo_url}
              toolName={nome}
              linkFerramenta={link_ferramenta}
              size="xl"
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl">{nome}</DialogTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{categoria}</Badge>
                {gratuito && <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">Gratuita</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* A indicação é da mentora, e só dela.
            Antes havia um bloco de avaliação da comunidade com peso de 40% no
            ranking, e qualquer membro votava. A biblioteca passa a ser uma
            lista curada: o mentorado lê a indicação, e quem dá a nota é a
            mentora, pelo admin. */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <span className="text-sm text-muted-foreground">Indicação da Mari</span>
          <RatingStars rating={stats?.avaliacao || avaliacao || 0} size="lg" />

          {isAdmin && (
            <div className="flex w-full items-center gap-2 border-t pt-3">
              <span className="text-xs text-muted-foreground">Sua nota:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  disabled={isRating}
                  className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                  aria-label={`Dar nota ${star}`}
                >
                  <Star
                    className={`h-6 w-6 cursor-pointer ${
                      star <= (stats?.avaliacao || 0)
                        ? "fill-status-warning text-status-warning"
                        : "text-muted hover:text-status-warning"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
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
              ? 'bg-status-success/10 border-status-success/20' 
              : 'bg-status-danger/10 border-status-danger/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {vale_a_pena ? (
                <>
                  <CheckCircle className="w-5 h-5 text-status-success" />
                  <h3 className="font-semibold text-status-success dark:text-status-success/40">Vale a pena!</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-status-danger" />
                  <h3 className="font-semibold text-status-danger dark:text-status-danger/40">Não recomendado</h3>
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