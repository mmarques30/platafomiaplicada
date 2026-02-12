import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useReportsSkills, ReportSkills } from "@/hooks/admin/useReportsSkills";
import { GerarReportSkillsModal } from "./GerarReportSkillsModal";
import { Plus, FileText, Pencil, Trash2, Calendar, ExternalLink, Loader2, FileWarning, Sparkles, Eye, TrendingUp, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import SkillsTabActions from "./SkillsTabActions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props { equipeId: string; equipeName?: string }

export default function ReportsSkillsManager({ equipeId, equipeName }: Props) {
  const { reports, isLoading, createReport, updateReport, deleteReport } = useReportsSkills(equipeId);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [gerarIAOpen, setGerarIAOpen] = useState(false);
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<ReportSkills | null>(null);
  const [formData, setFormData] = useState({ titulo: "", descricao: "", arquivo_url: "", periodo_referencia: "", trimestre: "1", data_envio: format(new Date(), "yyyy-MM-dd") });

  const openModal = (report?: ReportSkills) => {
    if (report) {
      setEditingReport(report);
      setFormData({ titulo: report.titulo, descricao: report.descricao || "", arquivo_url: report.arquivo_url || "", periodo_referencia: report.periodo_referencia || "", trimestre: report.trimestre?.toString() || "1", data_envio: report.data_envio ? format(new Date(report.data_envio), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd") });
    } else {
      setEditingReport(null);
      setFormData({ titulo: "", descricao: "", arquivo_url: "", periodo_referencia: "", trimestre: "1", data_envio: format(new Date(), "yyyy-MM-dd") });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    const data: any = { equipe_id: equipeId, titulo: formData.titulo, descricao: formData.descricao || null, arquivo_url: formData.arquivo_url || null, periodo_referencia: formData.periodo_referencia || null, trimestre: Number(formData.trimestre), data_envio: formData.data_envio };
    if (editingReport) updateReport.mutate({ id: editingReport.id, data }, { onSuccess: () => setModalOpen(false) });
    else createReport.mutate(data, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Reports Trimestrais</CardTitle><CardDescription className="text-sm">Reports executivos da equipe {equipeName || ""}</CardDescription></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setGerarIAOpen(true)}><Sparkles className="h-4 w-4 mr-2" />Gerar via IA</Button>
              <Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-2" />Novo Report</Button>
              <SkillsTabActions
                onClear={async () => {
                  const { error } = await supabase.from("reports_skills").delete().eq("equipe_id", equipeId);
                  if (error) throw error;
                  queryClient.invalidateQueries({ queryKey: ["reports-skills", equipeId] });
                }}
                hasData={reports.length > 0}
                clearDescription="Todos os reports desta equipe serão removidos."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum report cadastrado</p></div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id} className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${report.gerado_por_ia ? 'bg-primary/10' : 'bg-muted'}`}>
                      {report.gerado_por_ia ? <Sparkles className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">{report.titulo}</h4>
                        {report.gerado_por_ia && <Badge variant="secondary" className="text-[10px] gap-1"><Sparkles className="h-2.5 w-2.5" />IA</Badge>}
                        {report.trimestre && <Badge variant="outline" className="text-[10px]">T{report.trimestre}</Badge>}
                      </div>
                      {report.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.descricao}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(report.data_envio), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {report.periodo_referencia && <span>Período: {report.periodo_referencia}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {report.conteudo_html && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedHtml(report.conteudo_html!); setHtmlPreviewOpen(true); }}><Eye className="h-4 w-4" /></Button>}
                    {report.arquivo_url && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(report.arquivo_url!, "_blank")}><ExternalLink className="h-4 w-4" /></Button>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(report)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir Report</AlertDialogTitle><AlertDialogDescription>Tem certeza? Ação irreversível.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteReport.mutate(report.id)}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GerarReportSkillsModal open={gerarIAOpen} onOpenChange={setGerarIAOpen} equipeId={equipeId} />

      <Dialog open={htmlPreviewOpen} onOpenChange={setHtmlPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]"><DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>
          <div className="border rounded-lg overflow-auto max-h-[70vh] bg-white">{selectedHtml && <iframe srcDoc={selectedHtml} className="w-full h-[65vh] border-0" title="Report Preview" />}</div>
          <DialogFooter><Button variant="outline" onClick={() => setHtmlPreviewOpen(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingReport ? "Editar Report" : "Novo Report"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={formData.titulo} onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.descricao} onChange={e => setFormData(p => ({ ...p, descricao: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Trimestre</Label><Input type="number" min="1" max="4" value={formData.trimestre} onChange={e => setFormData(p => ({ ...p, trimestre: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Período</Label><Input value={formData.periodo_referencia} onChange={e => setFormData(p => ({ ...p, periodo_referencia: e.target.value }))} placeholder="T1 2026" /></div>
              <div className="space-y-2"><Label>Data Envio</Label><Input type="date" value={formData.data_envio} onChange={e => setFormData(p => ({ ...p, data_envio: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>URL do Arquivo</Label><Input value={formData.arquivo_url} onChange={e => setFormData(p => ({ ...p, arquivo_url: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.titulo || createReport.isPending || updateReport.isPending}>{(createReport.isPending || updateReport.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingReport ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
