import { useState } from "react";
import { ArrowLeft, FileText, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/shared/PageTitle";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MentoriaReports() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessUserId = useBusinessUserId();
  const { reports, contrato, isLoading } = useContratosBusiness(businessUserId);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGerarReport = async () => {
    if (!contrato?.id || !businessUserId) return;
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke("gerar-report-business", {
        body: { contrato_id: contrato.id, user_id: businessUserId },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["reports-business", contrato.id] });
      toast({ title: "Report gerado com sucesso", description: "O novo report já está disponível na lista." });
    } catch (err: any) {
      toast({ title: "Erro ao gerar report", description: err.message || "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>
      
      <div className="flex items-center justify-between mb-2">
        <PageTitle primary="Reports" secondary="Executivos" />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={isGenerating || !contrato}
          onClick={handleGerarReport}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Gerar novo report
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">
        Acompanhe os relatórios e análises do seu projeto
      </p>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum report disponível ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {isGenerating && <SkeletonCard variant="list" />}
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">{report.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(report.data_envio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    {report.tipo && <Badge variant="outline" className="mt-1">{report.tipo}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.arquivo_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(report.arquivo_url!, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
