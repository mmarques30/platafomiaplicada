import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, Calendar, FolderKanban, Route, Plus, ClipboardList, ClipboardCheck, ListChecks, Sparkles, FolderOpen, Trash2, Monitor, Video } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import TasksBusinessManager from "@/components/admin/business/TasksBusinessManager";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { EtapasManager } from "@/components/admin/business/EtapasManager";
import { ContratoBusinessManager } from "@/components/admin/business/ContratoBusinessManager";
import { ReportsBusinessManager } from "@/components/admin/business/ReportsBusinessManager";
import { InstrucoesBusinessManager } from "@/components/admin/business/InstrucoesBusinessManager";
import { DocumentosBusinessManager } from "@/components/admin/business/DocumentosBusinessManager";
import { Badge } from "@/components/ui/badge";
import SessaoModal from "@/components/admin/mentoria/SessaoModal";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EntregasBusinessManager } from "@/components/admin/business/EntregasBusinessManager";
import { ProcessosMapeadosManager } from "@/components/admin/business/ProcessosMapeadosManager";
import { TelasSistemaManager } from "@/components/admin/business/TelasSistemaManager";
import { VideosInstrucaoManager } from "@/components/admin/business/VideosInstrucaoManager";

export default function MentoriaBusinessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allUsers = [] } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filtrar usuários Business + Parceiros
  const users = allUsers.filter(u => u.plano_mentoria === "business_parceria" || u.plano_mentoria === "business" || u.roles.includes("parceiros"));
  const selectedUser = users.find(u => u.id === selectedUserId);

  // Buscar contrato do usuário selecionado
  const { contrato } = useContratosBusiness(selectedUserId);

  const { sessoes, createSessao, updateSessao, deleteSessao, bulkCreateSessoes, bulkDeleteSessoes } = useMentoriaSessoes(selectedUserId);
  const { data: etapas = [] } = useEtapasBusiness(contrato?.id);

  // Calcular número de reuniões baseado no contrato
  const totalReunioes = contrato 
    ? (contrato.tempo_consultoria_meses || 0) * (contrato.reunioes_mensais || 1) 
    : 0;
  const sessoesFaltantes = Math.max(0, totalReunioes - sessoes.length);

  const handleSincronizarSessoes = async () => {
    if (sessoesFaltantes <= 0 || !selectedUserId || !contrato) return;
    
    const dataInicio = contrato.data_inicio 
      ? new Date(contrato.data_inicio) 
      : new Date();
    
    const sessoesParaCriar = [];
    const reunioesPorMes = contrato.reunioes_mensais || 1;
    const totalMeses = contrato.tempo_consultoria_meses || 0;
    
    let sessaoNumero = sessoes.length + 1;
    
    for (let mes = 0; mes < totalMeses; mes++) {
      for (let reuniao = 0; reuniao < reunioesPorMes; reuniao++) {
        if (sessaoNumero > totalReunioes) break;
        
        // Calcular data da sessão (distribuir reuniões no mês)
        const dataSessao = new Date(dataInicio);
        dataSessao.setMonth(dataSessao.getMonth() + mes);
        if (reunioesPorMes > 1) {
          dataSessao.setDate(dataSessao.getDate() + (reuniao * Math.floor(30 / reunioesPorMes)));
        }
        dataSessao.setHours(10, 0, 0, 0);
        
        sessoesParaCriar.push({
          user_id: selectedUserId,
          titulo: `Reunião ${sessaoNumero}`,
          data_sessao: dataSessao.toISOString(),
          status: 'agendada' as const,
          notas: `Mês ${mes + 1} - Encontro ${reuniao + 1}`,
          etapa_id: null,
        });
        
        sessaoNumero++;
      }
    }

    try {
      await bulkCreateSessoes(sessoesParaCriar);
      toast.success(`${sessoesParaCriar.length} sessões criadas com sucesso!`);
    } catch (error: any) {
      toast.error("Erro ao criar sessões: " + error.message);
    }
  };

  const [sessaoModalOpen, setSessaoModalOpen] = useState(false);
  const [editingSessao, setEditingSessao] = useState<SessaoMentoria | undefined>();

  useEffect(() => {
    if (selectedUserId) {
      queryClient.invalidateQueries({ queryKey: ["contrato-business", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["entregas-business"] });
    }
  }, [selectedUserId, queryClient]);

  const handleEditSessao = (sessao: SessaoMentoria) => {
    setEditingSessao(sessao);
    setSessaoModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/mentoria")} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Mentoria Business</h1>
          <p className="text-sm text-muted-foreground">
            Consultoria e implementação personalizada
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {users.length} mentorados
        </Badge>
      </div>

      {/* Card de seleção compacto */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione um mentorado Business" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nome_completo}
                      {user.roles.includes("parceiros") ? " (Parceiro)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {users.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum mentorado Business</p>
            <p className="text-sm text-muted-foreground">
              Não há mentorados com plano Business cadastrados
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUserId && (
        <Tabs defaultValue="contrato" className="space-y-4">
          <TabsList className="bg-muted/40 border-0 rounded-lg p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="contrato" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ClipboardList className="h-3.5 w-3.5" />
              Contrato
            </TabsTrigger>
            <TabsTrigger value="etapas" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Route className="h-3.5 w-3.5" />
              Etapas
            </TabsTrigger>
            <TabsTrigger value="sessoes" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="entregas" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderKanban className="h-3.5 w-3.5" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="processos" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-3.5 w-3.5" />
              Processos
            </TabsTrigger>
            <TabsTrigger value="telas" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Monitor className="h-3.5 w-3.5" />
              Telas
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Video className="h-3.5 w-3.5" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="instrucoes" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ListChecks className="h-3.5 w-3.5" />
              Instruções
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderOpen className="h-3.5 w-3.5" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-3.5 w-3.5" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Aba Contrato */}
          <TabsContent value="contrato" className="space-y-4 mt-4">
            <ContratoBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>

          {/* Aba Etapas */}
          <TabsContent value="etapas" className="space-y-4 mt-4">
            <EtapasManager userId={selectedUserId} userName={selectedUser?.nome_completo} />
          </TabsContent>

          {/* Aba Sessões */}
          <TabsContent value="sessoes" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Sessões</h2>
                <Badge variant="secondary" className="text-xs">{sessoes.length}/{totalReunioes}</Badge>
                {contrato && (
                  <span className="text-xs text-muted-foreground">
                    ({contrato.tempo_consultoria_meses}m × {contrato.reunioes_mensais} reunião/mês)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {sessoes.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpar Tudo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar todas as sessões?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá excluir permanentemente todas as {sessoes.length} sessões. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await bulkDeleteSessoes();
                            } catch (error: any) {
                              toast.error("Erro ao limpar sessões: " + error.message);
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir Tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {sessoesFaltantes > 0 && contrato && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSincronizarSessoes}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Gerar {sessoesFaltantes} Sessões
                  </Button>
                )}
                <Button size="sm" onClick={() => { setEditingSessao(undefined); setSessaoModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Sessão
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {sessoes.map((sessao) => (
                <div 
                  key={sessao.id} 
                  className="p-3 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleEditSessao(sessao)}
                    >
                      <h4 className="font-medium text-sm truncate">{sessao.titulo}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        {sessao.duracao && <span>{sessao.duracao} min</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge 
                        variant={sessao.status === "realizada" ? "default" : sessao.status === "agendada" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {sessao.status === "agendada" ? "Agendada" : sessao.status === "realizada" ? "Realizada" : "Cancelada"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSessao(sessao.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {sessoes.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Nenhuma sessão cadastrada</p>
              )}
            </div>
          </TabsContent>

          {/* Aba Entregas */}
          <TabsContent value="entregas" className="space-y-4 mt-4">
            {contrato?.id ? (
              <EntregasBusinessManager 
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <FolderKanban className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para gerenciar entregas, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Processos */}
          <TabsContent value="processos" className="space-y-4 mt-4">
            {contrato?.id ? (
              <ProcessosMapeadosManager
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para gerenciar processos, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Telas */}
          <TabsContent value="telas" className="space-y-4 mt-4">
            {contrato?.id ? (
              <TelasSistemaManager
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <Monitor className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para gerenciar telas, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Vídeos */}
          <TabsContent value="videos" className="space-y-4 mt-4">
            {contrato?.id ? (
              <VideosInstrucaoManager
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <Video className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para gerenciar vídeos, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="instrucoes" className="space-y-4 mt-4">
            {contrato?.id ? (
              <InstrucoesBusinessManager 
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <ListChecks className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para ver as instruções, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Tasks */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            {contrato?.id ? (
              <TasksBusinessManager 
                contratoId={contrato.id} 
                userId={selectedUserId} 
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <ClipboardCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para gerenciar tasks, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Documentos */}
          <TabsContent value="documentos" className="space-y-4 mt-4">
            {contrato?.id ? (
              <DocumentosBusinessManager 
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-10 text-center">
                  <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm text-muted-foreground">Para gerenciar documentos, crie o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Reports */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <ReportsBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Modal Sessão */}
      <SessaoModal
        open={sessaoModalOpen}
        onOpenChange={setSessaoModalOpen}
        sessao={editingSessao}
        userId={selectedUserId}
        onSubmit={(data) => {
          if (editingSessao) {
            updateSessao({ ...editingSessao, ...data });
          } else {
            createSessao(data);
          }
          setSessaoModalOpen(false);
        }}
        onDelete={(id) => {
          deleteSessao(id);
          setSessaoModalOpen(false);
        }}
      />
    </div>
  );
}
