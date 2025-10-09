import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { FileText, Upload, AlertCircle, CheckCircle, Download, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { DiagnosticoUploadModal } from "./DiagnosticoUploadModal";
import { DiagnosticoFormModal } from "./DiagnosticoFormModal";
import { ResumoDiagnostico } from "@/components/mentoria/ResumoDiagnostico";

interface DiagnosticoAdminProps {
  userId?: string;
}

export function DiagnosticoAdmin({ userId }: DiagnosticoAdminProps) {
  const { diagnostico, isLoading, deletarArquivo } = useDiagnosticoAdmin(userId);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  if (!userId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum mentorado selecionado</AlertTitle>
        <AlertDescription>
          Selecione um mentorado para visualizar ou gerenciar o diagnóstico.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const handleDownload = () => {
    if (diagnostico?.arquivo_diagnostico_url) {
      window.open(diagnostico.arquivo_diagnostico_url, '_blank');
    }
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja remover o arquivo do diagnóstico?')) {
      deletarArquivo(userId);
    }
  };

  if (!diagnostico) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Diagnóstico não realizado
            </CardTitle>
            <CardDescription>
              Este mentorado ainda não possui diagnóstico. Escolha como adicionar:
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload de Arquivo
            </Button>
            <Button variant="outline" onClick={() => setFormModalOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Preencher Manualmente
            </Button>
          </CardContent>
        </Card>

        <DiagnosticoUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          userId={userId}
        />
        <DiagnosticoFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          userId={userId}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Diagnóstico completo
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge variant={diagnostico.preenchido_por === 'admin' ? 'default' : 'secondary'}>
                  {diagnostico.preenchido_por === 'admin' ? 'Enviado pelo admin' : 'Preenchido pelo mentorado'}
                </Badge>
                {diagnostico.created_at && (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(diagnostico.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnostico.arquivo_diagnostico_url && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Arquivo anexado</AlertTitle>
              <AlertDescription className="flex items-center justify-between mt-2">
                <span>Documento do diagnóstico disponível</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {diagnostico.observacoes_admin && (
            <Alert>
              <AlertTitle>Observações do admin</AlertTitle>
              <AlertDescription className="mt-2">
                {diagnostico.observacoes_admin}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewModalOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button variant="outline" onClick={() => setFormModalOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Editar
            </Button>
            {!diagnostico.arquivo_diagnostico_url && (
              <Button variant="outline" onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Arquivo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DiagnosticoUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        userId={userId}
      />
      <DiagnosticoFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        userId={userId}
        diagnostico={diagnostico}
      />
      {viewModalOpen && diagnostico && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Visualizar Diagnóstico</h2>
              <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)}>
                ✕
              </Button>
            </div>
            <ResumoDiagnostico 
              formulario={diagnostico} 
              onEditar={() => {
                setViewModalOpen(false);
                setFormModalOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
