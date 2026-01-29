import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/RatingStars";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { ExternalLink, CheckCircle, AlertCircle, Star, Users } from "lucide-react";
import { useFerramentaRating } from "@/hooks/useFerramentaRating";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface FerramentaDetalhesModalProps {
  ferramenta: any;
  onClose: () => void;
}

export function FerramentaDetalhesModal({ ferramenta, onClose }: FerramentaDetalhesModalProps) {
  const { user } = useAuth();
  const { isVisitante, isMentorado, isAdmin } = useUserRole();
  const { userRating, stats, rate, isRating } = useFerramentaRating(ferramenta?.id);

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

  // Verificar se usuário pode avaliar (mentorado ou admin, não visitante)
  const canRate = user && !isVisitante && (isMentorado || isAdmin);

  const handleRate = (nota: number) => {
    if (!canRate || isRating) return;
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
                {gratuito && <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Gratuita</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Avaliação do Mentor */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted-foreground">Avaliação do Mentor:</span>
          <RatingStars rating={avaliacao || 0} size="lg" />
        </div>

        {/* Avaliação da Comunidade */}
        <div className="p-4 rounded-lg border bg-muted/30 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Avaliação da Comunidade</span>
            </div>
            {stats && stats.total_avaliacoes_comunidade > 0 && (
              <span className="text-sm text-muted-foreground">
                {stats.total_avaliacoes_comunidade} {stats.total_avaliacoes_comunidade === 1 ? 'avaliação' : 'avaliações'}
              </span>
            )}
          </div>

          {stats && stats.total_avaliacoes_comunidade > 0 ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.avaliacao_comunidade || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">
                {(stats.avaliacao_comunidade || 0).toFixed(1)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">Nenhuma avaliação ainda</p>
          )}

          {/* Seção para avaliar */}
          {canRate ? (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {userRating ? "Sua avaliação:" : "Avalie esta ferramenta:"}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    disabled={isRating}
                    className="p-1 hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    <Star
                      className={`w-6 h-6 cursor-pointer ${
                        star <= (userRating?.nota || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : isVisitante ? (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                💡 Adquira um plano para avaliar ferramentas
              </p>
            </div>
          ) : null}
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