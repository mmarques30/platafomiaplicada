import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useContratosBusiness, ReportBusiness } from "@/hooks/useContratosBusiness";
import { useReportsBusinessMutations } from "@/hooks/useReportsBusinessMutations";
import { GerarReportIAModal } from "./GerarReportIAModal";
import { Plus, FileText, Pencil, Trash2, Calendar, ExternalLink, Loader2, FileWarning, Sparkles, Eye, TrendingUp, ListChecks, Video, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportsBusinessManagerProps {
  userId: string;
  userName?: string;
}

export function ReportsBusinessManager({ userId, userName }: ReportsBusinessManagerProps) {
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(userId);
  const { reports, isLoading: isLoadingReports, createReport, updateReport, deleteReport } = useReportsBusinessMutations(contrato?.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [gerarIAModalOpen, setGerarIAModalOpen] = useState(false);
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<ReportBusiness | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    arquivo_url: "",
    periodo_referencia: "",
    data_envio: format(new Date(), "yyyy-MM-dd"),
  });

  const handleOpenModal = (report?: ReportBusiness) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        titulo: report.titulo,
        descricao: report.descricao || "",
        arquivo_url: report.arquivo_url || "",
        periodo_referencia: report.periodo_referencia || "",
        data_envio: report.data_envio ? format(new Date(report.data_envio), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      });
    } else {
      setEditingReport(null);
      setFormData({
        titulo: "",
        descricao: "",
        arquivo_url: "",
        periodo_referencia: "",
        data_envio: format(new Date(), "yyyy-MM-dd"),
      });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!contrato) return;

    const data = {
      contrato_id: contrato.id,
      titulo: formData.titulo,
      descricao: formData.descricao || null,
      arquivo_url: formData.arquivo_url || null,
      periodo_referencia: formData.periodo_referencia || null,
      data_envio: formData.data_envio,
    };

    if (editingReport) {
      updateReport.mutate({ id: editingReport.id, data }, {
        onSuccess: () => setModalOpen(false),
      });
    } else {
      createReport.mutate(data, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteReport.mutate(id);
  };

  const handleViewHtml = (html: string) => {
    setSelectedHtml(html);
    setHtmlPreviewOpen(true);
  };

  if (isLoadingContrato) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!contrato) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum contrato encontrado</p>
          <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
            É necessário criar um contrato na aba "Contrato" antes de adicionar documentos de suporte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Reports e Documentos
              </CardTitle>
              <CardDescription className="text-sm">
                Reports executivos e documentos de suporte para {userName || "mentorado"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setGerarIAModalOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar via IA
              </Button>
              <Button size="sm" onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento cadastrado</p>
              <p className="text-sm">Use "Gerar via IA" para criar um report automático ou adicione manualmente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${report.gerado_por_ia ? 'bg-primary/10' : 'bg-muted'}`}>
                      {report.gerado_por_ia ? (
                        <Sparkles className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">{report.titulo}</h4>
                        {report.gerado_por_ia && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            IA
                          </Badge>
                        )}
                      </div>
                      
                      {report.descricao && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.descricao}</p>
                      )}
                      
                      {/* Métricas inline para reports gerados por IA */}
                      {report.gerado_por_ia && report.metricas && (
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            Etapas: {(report.metricas as any)?.etapas?.percentual || 0}%
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle className="h-3 w-3" />
                            Entregas: {(report.metricas as any)?.entregas?.concluidas || 0}/{(report.metricas as any)?.entregas?.total || 0}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <ListChecks className="h-3 w-3" />
                            Tarefas: {(report.metricas as any)?.tarefas?.concluidas || 0}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Video className="h-3 w-3" />
                            Vídeos: {(report.metricas as any)?.videos_assistidos || 0}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(report.data_envio), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {report.periodo_referencia && (
                          <span>Período: {report.periodo_referencia}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {report.conteudo_html && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewHtml(report.conteudo_html!)}
                        title="Visualizar HTML"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {report.arquivo_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(report.arquivo_url!, "_blank")}
                        title="Abrir arquivo"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenModal(report)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{report.titulo}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(report.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Geração via IA */}
      <GerarReportIAModal
        open={gerarIAModalOpen}
        onOpenChange={setGerarIAModalOpen}
        contratoId={contrato.id}
        userId={userId}
        onSuccess={() => {}}
      />

      {/* Modal de Preview HTML */}
      <Dialog open={htmlPreviewOpen} onOpenChange={setHtmlPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview do Report</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-auto max-h-[70vh] bg-white">
            {selectedHtml && (
              <iframe
                srcDoc={selectedHtml}
                className="w-full h-[65vh] border-0"
                title="Report Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHtmlPreviewOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação/Edição */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Editar Documento" : "Novo Documento"}
            </DialogTitle>
            <DialogDescription>
              {editingReport
                ? "Atualize as informações do documento"
                : "Adicione um novo documento de suporte"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Relatório Semanal - Semana 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do documento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodo">Período de Referência</Label>
                <Input
                  id="periodo"
                  value={formData.periodo_referencia}
                  onChange={(e) => setFormData({ ...formData, periodo_referencia: e.target.value })}
                  placeholder="Ex: Jan/2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_envio">Data de Envio</Label>
                <Input
                  id="data_envio"
                  type="date"
                  value={formData.data_envio}
                  onChange={(e) => setFormData({ ...formData, data_envio: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arquivo_url">URL do Arquivo</Label>
              <Input
                id="arquivo_url"
                value={formData.arquivo_url}
                onChange={(e) => setFormData({ ...formData, arquivo_url: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Link para o documento (Google Drive, Notion, etc.)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.titulo || createReport.isPending || updateReport.isPending}
            >
              {(createReport.isPending || updateReport.isPending) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingReport ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}