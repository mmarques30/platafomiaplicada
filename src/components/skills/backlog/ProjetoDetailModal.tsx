import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Zap, Tag, User, BarChart3, Layers } from "lucide-react";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

const statusLabels: Record<string, string> = {
  levantado: "Levantado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  descartado: "Descartado",
};

const prioridadeCores: Record<string, string> = {
  alta: "bg-red-500/15 text-red-700 border-red-200",
  media: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  baixa: "bg-green-500/15 text-green-700 border-green-200",
};

interface ProjetoDetailModalProps {
  item: BacklogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjetoDetailModal({ item, open, onOpenChange }: ProjetoDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {item.origem === "ia" && <Zap className="h-4 w-4 text-amber-500" />}
            {item.titulo}
          </DialogTitle>
          <DialogDescription className="sr-only">Detalhes do projeto</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Status + Prioridade */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{statusLabels[item.status || "levantado"]}</Badge>
            {item.prioridade && (
              <Badge variant="outline" className={prioridadeCores[item.prioridade]}>
                {item.prioridade.toUpperCase()}
              </Badge>
            )}
            {item.origem && (
              <Badge variant="secondary" className="text-xs">
                {item.origem === "ia" ? "Gerado por IA" : "Manual"}
              </Badge>
            )}
          </div>

          {/* Descrição */}
          {item.descricao && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
              <p className="text-sm whitespace-pre-wrap">{item.descricao}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {item.area_impactada && (
              <div className="flex items-start gap-2">
                <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Área Impactada</p>
                  <p className="text-sm font-medium">{item.area_impactada}</p>
                </div>
              </div>
            )}

            {item.horas_estimadas_economia != null && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Economia Estimada</p>
                  <p className="text-sm font-medium">{item.horas_estimadas_economia} h/semana</p>
                </div>
              </div>
            )}
          </div>

          {/* Responsável */}
          {item.responsavel && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Avatar className="h-6 w-6">
                <AvatarImage src={item.responsavel.avatar_url || ""} />
                <AvatarFallback className="text-[9px]">{item.responsavel.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{item.responsavel.nome}</span>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
