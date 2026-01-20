import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useContratosBusiness, ReportBusiness } from "@/hooks/useContratosBusiness";
import { useReportsBusinessMutations } from "@/hooks/useReportsBusinessMutations";
import { Plus, FileText, Pencil, Trash2, Calendar, ExternalLink, Loader2, FileWarning } from "lucide-react";
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos de Suporte
              </CardTitle>
              <CardDescription>
                Gerencie os documentos e relatórios de {userName || "mentorado"}
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
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
              <p className="text-sm">Clique em "Novo Documento" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{report.titulo}</h4>
                      {report.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{report.descricao}</p>
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
                  <div className="flex items-center gap-2">
                    {report.arquivo_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(report.arquivo_url!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(report)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
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
