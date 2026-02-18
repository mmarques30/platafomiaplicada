import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Zap, Tag, User, Layers, BookOpen, ExternalLink, CheckCircle2, XCircle, Play, Archive, RotateCcw, ArrowRight, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

const statusLabels: Record<string, string> = {
  levantado: "Levantado",
  aprovado: "Aprovado",
  nao_aprovado: "Não Aprovado",
  backlog: "Backlog",
  priorizado: "Priorizado",
  em_execucao: "Em Execução",
  entregue: "Entregue",
};

const statusColors: Record<string, string> = {
  levantado: "bg-muted text-muted-foreground",
  aprovado: "bg-blue-500/15 text-blue-700 border-blue-200",
  nao_aprovado: "bg-destructive/15 text-destructive border-destructive/30",
  backlog: "bg-amber-500/15 text-amber-700 border-amber-200",
  priorizado: "bg-indigo-500/15 text-indigo-700 border-indigo-200",
  em_execucao: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  entregue: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
};

const prioridadeCores: Record<string, string> = {
  alta: "bg-red-500/15 text-red-700 border-red-200",
  media: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  baixa: "bg-[#9EB038]/10 text-[#9EB038] border-[#9EB038]/20",
};

const prioridadeTrilhaCores: Record<string, string> = {
  essencial: "bg-primary/15 text-primary border-primary/30",
  recomendado: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
};

interface ProjetoDetailModalProps {
  item: BacklogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: string) => void;
  onUpdate?: (id: string, fields: Record<string, any>) => void;
  equipeId?: string | null;
}

export default function ProjetoDetailModal({ item, open, onOpenChange, onStatusChange, onUpdate, equipeId }: ProjetoDetailModalProps) {
  const [obsValue, setObsValue] = useState(item?.observacoes || "");

  useEffect(() => {
    setObsValue(item?.observacoes || "");
  }, [item?.observacoes, item?.id]);

  const { data: membros } = useQuery({
    queryKey: ["membros-equipe-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("user_id, profiles!membros_equipe_skills_user_id_fkey(id, nome_completo, avatar_url)")
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      if (error) throw error;
      return (data || []).map((m: any) => ({
        id: m.user_id,
        nome: m.profiles?.nome_completo || "Sem nome",
        avatar_url: m.profiles?.avatar_url || null,
      }));
    },
    enabled: !!equipeId && open,
  });

  if (!item) return null;

  const trilhas: any[] = Array.isArray(item.trilhas_recomendadas) ? item.trilhas_recomendadas : [];
  const currentStatus = item.status || "levantado";

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
            <Badge variant="outline" className={statusColors[currentStatus]}>
              {statusLabels[currentStatus] || currentStatus}
            </Badge>
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

          {/* Ações rápidas de status - contextuais */}
          {onStatusChange && (
            <div className="flex flex-wrap gap-2">
              {(currentStatus === "levantado" || currentStatus === "backlog") && (
                <>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "aprovado")}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    Aprovar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "nao_aprovado")}>
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                    Não Aprovar
                  </Button>
                  {currentStatus === "levantado" && (
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "backlog")}>
                      <Archive className="h-3.5 w-3.5 text-amber-600" />
                      Manter no Backlog
                    </Button>
                  )}
                </>
              )}
              {currentStatus === "aprovado" && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "priorizado")}>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
                  Priorizar
                </Button>
              )}
              {currentStatus === "priorizado" && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "em_execucao")}>
                  <Play className="h-3.5 w-3.5 text-[#738925]" />
                  Iniciar Execução
                </Button>
              )}
              {currentStatus === "em_execucao" && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "entregue")}>
                  <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Marcar como Entregue
                </Button>
              )}
              {currentStatus === "nao_aprovado" && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onStatusChange(item.id, "levantado")}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reabrir
                </Button>
              )}
              <Select value={currentStatus} onValueChange={s => onStatusChange(item.id, s)}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Descrição */}
          {item.descricao && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h4>
              <p className="text-sm whitespace-pre-wrap">{item.descricao}</p>
            </div>
          )}

          {/* Observações */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Observações</h4>
            {onUpdate ? (
              <Textarea
                value={obsValue}
                onChange={(e) => setObsValue(e.target.value)}
                onBlur={() => {
                  if (obsValue !== (item.observacoes || "")) {
                    onUpdate(item.id, { observacoes: obsValue || null });
                  }
                }}
                placeholder="Adicione observações sobre este projeto..."
                className="min-h-[60px] text-sm"
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {item.observacoes || "Nenhuma observação"}
              </p>
            )}
          </div>

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

          {/* Responsável - Editável */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Responsável</span>
            </div>
            {onUpdate && membros && membros.length > 0 ? (
              <Select
                value={item.responsavel_id || "__none__"}
                onValueChange={(val) => {
                  const newId = val === "__none__" ? null : val;
                  onUpdate(item.id, { responsavel_id: newId });
                }}
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">Sem responsável</span>
                  </SelectItem>
                  {membros.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={m.avatar_url || ""} />
                          <AvatarFallback className="text-[8px]">{m.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{m.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : item.responsavel ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.responsavel.avatar_url || ""} />
                  <AvatarFallback className="text-[9px]">{item.responsavel.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{item.responsavel.nome}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum responsável atribuído</p>
            )}
          </div>

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

          {/* Trilhas Recomendadas */}
          {trilhas.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium">Trilhas Recomendadas</h4>
              </div>
              <div className="space-y-2">
                {trilhas.map((trilha, i) => (
                  <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium leading-snug flex-1">
                        {trilha.trilha_titulo || "Trilha"}
                      </span>
                      <Badge variant="outline" className={prioridadeTrilhaCores[trilha.prioridade] || ""}>
                        {trilha.prioridade === "essencial" ? "Essencial" : "Recomendado"}
                      </Badge>
                    </div>
                    {trilha.modulos_prioritarios?.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Módulos prioritários: {trilha.modulos_prioritarios.join(", ")}
                      </p>
                    )}
                    {trilha.justificativa && (
                      <p className="text-xs text-muted-foreground italic">{trilha.justificativa}</p>
                    )}
                    {trilha.trilha_id && (
                      <Link to={`/trilhas/${trilha.trilha_id}`}>
                        <Button variant="outline" size="sm" className="mt-1 h-7 text-xs gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Assistir Trilha
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
