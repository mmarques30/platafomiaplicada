import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { Upload, AlertCircle, CheckCircle, Download, Trash2, Eye, Target, Calendar, Video, PanelLeftOpen, FileText, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { DiagnosticoUploadModal } from "./DiagnosticoUploadModal";
import { DiagnosticoFormModal } from "./DiagnosticoFormModal";
import { ResumoDiagnostico } from "@/components/mentoria/ResumoDiagnostico";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useNavigate } from "react-router-dom";

interface DiagnosticoAdminProps {
  userId?: string;
  allowManualInput?: boolean;
}

export function DiagnosticoAdmin({ userId, allowManualInput = true }: DiagnosticoAdminProps) {
  const navigate = useNavigate();
  const { diagnostico, isLoading, deletarArquivo } = useDiagnosticoAdmin(userId);
  const { projetos } = useMentoriaProjetos(userId);
  const { tarefas } = useMentoriaTarefas(userId);
  
  const objetivosEstrategicos = projetos.filter(p => p.tipo === "estrategico");
  const { sessoes } = useMentoriaSessoes();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTranscricao, setViewTranscricao] = useState<any>(null);

  const userSessoes = sessoes.filter(s => s.user_id === userId);

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
          <CardContent className="flex gap-2">
            {allowManualInput && (
              <Button variant="outline" onClick={() => setFormModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Preencher Manualmente
              </Button>
            )}
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload de Arquivo
            </Button>
          </CardContent>
        </Card>

        {allowManualInput && (
          <DiagnosticoFormModal
            open={formModalOpen}
            onOpenChange={setFormModalOpen}
            userId={userId}
          />
        )}

        <DiagnosticoUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
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

          {diagnostico.plano_gerado && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Plano de mentoria criado</AlertTitle>
              <AlertDescription className="text-green-800">
                <div className="mt-2 space-y-1">
                  <p>
                    ✱ Plano gerado em {diagnostico.plano_gerado_em && format(new Date(diagnostico.plano_gerado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-semibold">{objetivosEstrategicos.length}</span> objetivos estratégicos
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-semibold">{tarefas.length}</span> tarefas criadas
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Seção de Sessões de Mentoria */}
          {userSessoes.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Sessões de Mentoria ({userSessoes.length})
                </CardTitle>
                <CardDescription>
                  Gravações e transcrições das sessões realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userSessoes.map((sessao) => (
                    <div 
                      key={sessao.id} 
                      className="border-l-2 border-primary pl-4 py-2 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{sessao.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            {sessao.duracao && ` • ${sessao.duracao} min`}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            sessao.status === 'realizada' ? 'default' : 
                            sessao.status === 'agendada' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {sessao.status}
                        </Badge>
                      </div>

                      {sessao.notas && (
                        <p className="text-sm text-muted-foreground">
                          {sessao.notas}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {sessao.video_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                          >
                            <a 
                              href={sessao.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Ver gravação
                            </a>
                          </Button>
                        )}

                        {sessao.transcricao_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                          >
                            <a 
                              href={sessao.transcricao_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Ver transcrição
                            </a>
                          </Button>
                        )}

                        {sessao.transcricao && !sessao.transcricao_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewTranscricao(sessao)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Ver transcrição
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => navigate(`/mentoria/painel-diagnostico/${userId}`)}>
              <PanelLeftOpen className="h-4 w-4 mr-2" />
              Ver Painel Completo
            </Button>
            <Button variant="outline" onClick={() => setViewModalOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
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

      {allowManualInput && (
        <DiagnosticoFormModal
          open={formModalOpen}
          onOpenChange={setFormModalOpen}
          userId={userId}
          diagnostico={diagnostico}
        />
      )}

      <DiagnosticoUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        userId={userId}
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
              onEditar={allowManualInput ? () => { setViewModalOpen(false); setFormModalOpen(true); } : undefined}
            />
          </div>
        </div>
      )}

      {/* Modal para visualizar transcrição */}
      <Dialog open={!!viewTranscricao} onOpenChange={() => setViewTranscricao(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Transcrição - {viewTranscricao?.titulo}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="whitespace-pre-wrap text-sm">
              {viewTranscricao?.transcricao}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
