import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useReportsSkills } from "@/hooks/admin/useReportsSkills";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; equipeId: string }

export function GerarReportSkillsModal({ open, onOpenChange, equipeId }: Props) {
  const [periodo, setPeriodo] = useState("T1 2026");
  const [trimestre, setTrimestre] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const { createReport } = useReportsSkills(equipeId);

  const handleGerar = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-report-skills', {
        body: { equipe_id: equipeId, trimestre: Number(trimestre), periodo }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await createReport.mutateAsync({
        equipe_id: equipeId,
        titulo: data.titulo || `Report ${periodo}`,
        descricao: data.resumo_executivo?.slice(0, 500) || null,
        periodo_referencia: periodo,
        trimestre: Number(trimestre),
        data_envio: new Date().toISOString(),
        conteudo_html: data.conteudo_html || null,
        metricas: data.metricas || null,
        gerado_por_ia: true,
        resumo_executivo: data.resumo_executivo || null,
      });
      toast.success("Report gerado e salvo!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Gerar Report Trimestral via IA</DialogTitle>
          <DialogDescription>A IA analisará métricas, entregas e diagnósticos da equipe para gerar um report executivo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Período</Label><Input value={periodo} onChange={e => setPeriodo(e.target.value)} placeholder="T1 2026" /></div>
            <div className="space-y-2"><Label>Trimestre</Label>
              <Select value={trimestre} onValueChange={setTrimestre}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">T1</SelectItem><SelectItem value="2">T2</SelectItem><SelectItem value="3">T3</SelectItem><SelectItem value="4">T4</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleGerar} disabled={isGenerating}>
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando...</> : <><Sparkles className="h-4 w-4 mr-2" />Gerar Report</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
