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
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useObjetivos } from "@/hooks/useObjetivos";
import { useNavigate } from "react-router-dom";

interface DiagnosticoAdminProps {
  userId?: string;
  allowManualInput?: boolean;
}

export function DiagnosticoAdmin({ userId, allowManualInput = true }: DiagnosticoAdminProps) {
  const navigate = useNavigate();
  const {
    diagnostico,
    isLoading,
    deletarArquivo,
    forcarFinalizacao,
    isForcingFinalize,
    regenerarInsight,
    isRegeneratingInsight,
  } = useDiagnosticoAdmin(userId);
  const { objetivos } = useObjetivos(userId);
  const { tarefas } = useMentoriaTarefas(userId);
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

  // Verificar se diagnóstico foi realmente completado pelo mentorado
  const diagnosticoCompleto = diagnostico?.completado === true;

  // ANTES: o admin só via o conteúdo quando completado=true. Mesmo quando o
  // mentorado preenchia respostas parciais OU quando o insight_ia já tinha
  // sido gerado, a tela mostrava "Diagnóstico pendente" e bloqueava tudo.
  // Mari não conseguia avaliar, dar feedback nem ver o que a pessoa recebeu.
  // Agora: bloqueia SÓ quando não há registro nenhum. Se tem registro
  // (incompleto ou completo) + qualquer dado preenchido, renderiza a view.
  const temInsight = !!diagnostico?.insight_ia;
  const temAlgumDado = !!diagnostico && (
    !!diagnostico.profissao || !!diagnostico.area_atuacao ||
    !!diagnostico.objetivo_principal || temInsight
  );

  if (!diagnostico || (!diagnosticoCompleto && !temAlgumDado)) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {diagnostico ? 'Diagnóstico pendente' : 'Diagnóstico não realizado'}
            </CardTitle>
            <CardDescription>
              {diagnostico 
                ? 'O mentorado ainda não preencheu o diagnóstico de IA.'
                : 'Este mentorado ainda não possui diagnóstico. Escolha como adicionar:'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Removido o aviso de "Feedback Mentora" — esse fluxo não existe mais. */}
            <div className="flex gap-2">
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
            </div>
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
      {!diagnosticoCompleto && (
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Diagnóstico incompleto — preview parcial</AlertTitle>
          <AlertDescription className="text-amber-900/80">
            <p>
              O mentorado ainda não finalizou o formulário. Você está vendo
              apenas os campos que ele já preencheu e, se houver, o insight da
              IA gerado a partir desses dados parciais.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                disabled={isForcingFinalize}
                onClick={() => {
                  if (
                    confirm(
                      "Marcar o diagnóstico como finalizado mesmo com dados parciais? Isso vai destravar o mentorado e gerar o insight com o que ele já respondeu."
                    )
                  ) {
                    forcarFinalizacao(userId);
                  }
                }}
                className="border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200"
              >
                {isForcingFinalize ? "Finalizando..." : "Forçar finalização"}
              </Button>
              <span className="text-xs text-amber-900/70">
                (marca como concluído + gera o insight com os dados parciais)
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {diagnosticoCompleto ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                {diagnosticoCompleto ? "Diagnóstico completo" : "Diagnóstico em andamento"}
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
            <Alert className="border-primary/30 bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Plano de mentoria criado</AlertTitle>
              <AlertDescription className="text-foreground/80">
                <div className="mt-2 space-y-1">
                  <p>
                    ✱ Plano gerado em {diagnostico.plano_gerado_em && format(new Date(diagnostico.plano_gerado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-semibold">{objetivos?.length || 0}</span> objetivos estratégicos
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

          {/* Status do insight da IA. O preview visual do que o mentorado vê
              fica fora deste componente (DiagnosticoAcademyPanel / BusinessDashboard
              embaixo). Aqui mostramos só o status + data, sem dump de JSON. */}
          {diagnostico.insight_ia ? (
            <Alert className="border-brand-strong/30 bg-brand-cream-soft">
              <CheckCircle className="h-4 w-4 text-brand-strong" />
              <AlertTitle className="text-brand-strong">Insight da IA gerado</AlertTitle>
              <AlertDescription className="text-foreground/80">
                <p>
                  {diagnostico.insight_gerado_em
                    ? `Gerado em ${format(new Date(diagnostico.insight_gerado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}. `
                    : ""}
                  Veja o preview exato logo abaixo (visão do aluno) ou abra o painel completo.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  disabled={isRegeneratingInsight}
                  onClick={() => {
                    if (confirm("Regerar o insight do zero a partir das respostas atuais? O conteúdo anterior será substituído.")) {
                      regenerarInsight(diagnostico.id);
                    }
                  }}
                >
                  {isRegeneratingInsight ? "Regenerando..." : "Regenerar insight"}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Insight ainda não gerado</AlertTitle>
              <AlertDescription className="text-blue-900/80">
                <p>
                  A IA ainda não gerou o insight pra este diagnóstico. Pode ter
                  falhado silenciosamente na finalização. Clique abaixo pra
                  forçar a geração agora — o toast vai mostrar o motivo real
                  se falhar de novo.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isRegeneratingInsight}
                  onClick={() => regenerarInsight(diagnostico.id)}
                >
                  {isRegeneratingInsight ? "Gerando..." : "Gerar insight agora"}
                </Button>
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
            <ResumoDiagnostico formulario={diagnostico} />
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
