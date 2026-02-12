import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Target, Users, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import SkillsTabActions from "./SkillsTabActions";

interface Props { equipeId: string }

export default function ProjetosMapeadosTab({ equipeId }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: projetos = [], isLoading } = useQuery({
    queryKey: ["backlog-skills", equipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backlog_skills")
        .select("*, profiles:responsavel_id(nome_completo)")
        .eq("equipe_id", equipeId)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!equipeId,
  });

  // Check diagnostics status for pre-requisite feedback
  const { data: diagStatus } = useQuery({
    queryKey: ["diag-status-projetos", equipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnosticos_skills")
        .select("id, completado")
        .eq("equipe_id", equipeId);
      if (error) throw error;
      const total = data?.length || 0;
      const completos = data?.filter(d => d.completado).length || 0;
      return { total, completos };
    },
    enabled: !!equipeId,
  });

  const handleGerarProjetos = async () => {
    if (!diagStatus?.completos) {
      toast.error("Nenhum diagnóstico preenchido. Os membros precisam preencher seus diagnósticos primeiro.");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-projetos-skills', { body: { equipe_id: equipeId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${data.projetos_criados || 0} projetos gerados!`);
      queryClient.invalidateQueries({ queryKey: ["backlog-skills", equipeId] });
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar projetos");
    } finally {
      setIsGenerating(false);
    }
  };

  const prioridadeColors: Record<string, string> = {
    alta: "bg-red-500/10 text-red-600 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Projetos Mapeados</h3>
          <Badge variant="secondary" className="text-xs">{projetos.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
        <Button onClick={handleGerarProjetos} disabled={isGenerating || !diagStatus?.completos} size="sm">
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Gerar Projetos com IA
        </Button>
        <SkillsTabActions
          onClear={async () => {
            const { error } = await supabase.from("backlog_skills").delete().eq("equipe_id", equipeId);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["backlog-skills", equipeId] });
          }}
          hasData={projetos.length > 0}
          clearDescription="Todos os projetos mapeados desta equipe serão removidos."
        />
        </div>
      </div>

      {/* Pre-requisite indicator */}
      {diagStatus && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${diagStatus.completos > 0 ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
          {diagStatus.completos > 0 ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-green-600">{diagStatus.completos}/{diagStatus.total} diagnósticos preenchidos — pronto para gerar projetos</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <span className="text-yellow-600">Nenhum diagnóstico preenchido ({diagStatus.total} membros). Os membros precisam preencher o diagnóstico antes de gerar projetos.</span>
            </>
          )}
        </div>
      )}

      {projetos.length === 0 ? (
        <Card className="border-border/50"><CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Nenhum projeto mapeado</p>
          <p className="text-sm text-muted-foreground/70">Use "Gerar Projetos com IA" para criar projetos baseados nos diagnósticos</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {projetos.map(proj => (
            <Card key={proj.id} className="border-border/50 hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{proj.titulo}</h4>
                    {proj.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.descricao}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {proj.prioridade && <Badge variant="outline" className={`text-xs ${prioridadeColors[proj.prioridade] || ""}`}>{proj.prioridade}</Badge>}
                      {(proj as any).profiles?.nome_completo && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{(proj as any).profiles.nome_completo}</span>}
                      {proj.horas_estimadas_economia && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{proj.horas_estimadas_economia}h economia</span>}
                      {proj.status && <Badge variant="secondary" className="text-xs">{proj.status}</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
