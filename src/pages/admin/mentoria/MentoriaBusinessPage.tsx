import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, CheckSquare, Calendar, FolderKanban, Route, Plus, RefreshCw, Target, Pencil, Trash2, ClipboardList, ClipboardCheck } from "lucide-react";
import TasksBusinessManager from "@/components/admin/business/TasksBusinessManager";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { TarefasAdmin } from "@/components/admin/mentoria/TarefasAdmin";
import { EtapasManager } from "@/components/admin/business/EtapasManager";
import { ContratoBusinessManager } from "@/components/admin/business/ContratoBusinessManager";
import { ReportsBusinessManager } from "@/components/admin/business/ReportsBusinessManager";
import { Badge } from "@/components/ui/badge";
import SessaoModal from "@/components/admin/mentoria/SessaoModal";
import ProjetoModal from "@/components/admin/mentoria/ProjetoModal";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";
import { ProjetoMentoria } from "@/hooks/useMentoriaProjetos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { formatProjetoTitulo } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function MentoriaBusinessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allUsers = [] } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filtrar usuários Business
  const users = allUsers.filter(u => u.plano_mentoria === "business");
  const selectedUser = users.find(u => u.id === selectedUserId);

  const { sessoes, createSessao, updateSessao } = useMentoriaSessoes(selectedUserId);
  const { projetos, createProjeto, updateProjeto, deleteProjeto } = useMentoriaProjetos(selectedUserId);

  const [sessaoModalOpen, setSessaoModalOpen] = useState(false);
  const [projetoModalOpen, setProjetoModalOpen] = useState(false);

  const [editingSessao, setEditingSessao] = useState<SessaoMentoria | undefined>();
  const [editingProjeto, setEditingProjeto] = useState<ProjetoMentoria | undefined>();

  useEffect(() => {
    if (selectedUserId) {
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
    }
  }, [selectedUserId, queryClient]);

  const handleEditSessao = (sessao: SessaoMentoria) => {
    setEditingSessao(sessao);
    setSessaoModalOpen(true);
  };

  const handleEditProjeto = (projeto: ProjetoMentoria) => {
    setEditingProjeto(projeto);
    setProjetoModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/mentoria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Mentoria Business</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {users.length} mentorados
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Gerenciar mentorados Business - consultoria e implementação personalizada
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Mentorado Business
          </CardTitle>
          <CardDescription>
            Escolha um mentorado para visualizar e gerenciar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecione um mentorado Business" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {users.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum mentorado Business</p>
            <p className="text-sm text-muted-foreground">
              Não há mentorados com plano Business cadastrados
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUserId && (
        <Tabs defaultValue="contrato" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="contrato">
              <ClipboardList className="h-4 w-4 mr-2" />
              Contrato
            </TabsTrigger>
            <TabsTrigger value="etapas">
              <Route className="h-4 w-4 mr-2" />
              Etapas
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="sessoes">
              <Calendar className="h-4 w-4 mr-2" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="entregas">
              <FolderKanban className="h-4 w-4 mr-2" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="tarefas">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tarefas
            </TabsTrigger>
          </TabsList>

          {/* Aba Contrato - NOVA */}
          <TabsContent value="contrato" className="space-y-4">
            <ContratoBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>

          {/* Aba Etapas - EXISTENTE */}
          <TabsContent value="etapas" className="space-y-4">
            <EtapasManager userId={selectedUserId} userName={selectedUser?.nome_completo} />
          </TabsContent>

          {/* Aba Reports - NOVA */}
          <TabsContent value="reports" className="space-y-4">
            <ReportsBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>

          {/* Aba Sessões - EXISTENTE */}
          <TabsContent value="sessoes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sessões de {selectedUser?.nome_completo}</h2>
              <Button onClick={() => { setEditingSessao(undefined); setSessaoModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Sessão
              </Button>
            </div>

            <div className="grid gap-4">
              {sessoes.map((sessao) => (
                <Card key={sessao.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditSessao(sessao)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{sessao.titulo}</CardTitle>
                      <Badge variant={sessao.status === "realizada" ? "default" : sessao.status === "agendada" ? "secondary" : "destructive"}>
                        {sessao.status === "agendada" ? "Agendada" : sessao.status === "realizada" ? "Realizada" : "Cancelada"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p><strong>Data:</strong> {format(new Date(sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                      {sessao.duracao && <p><strong>Duração:</strong> {sessao.duracao} minutos</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {sessoes.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma sessão cadastrada</p>
              )}
            </div>
          </TabsContent>

          {/* Aba Projetos - EXISTENTE */}
          <TabsContent value="projetos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projetos de {selectedUser?.nome_completo}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["projetos-mentoria"] });
                    queryClient.invalidateQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
                    queryClient.refetchQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
                    toast({ title: "Cache limpo!", description: "Dados recarregados do servidor" });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={() => { setEditingProjeto(undefined); setProjetoModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {projetos.map((projeto) => (
                <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{formatProjetoTitulo(projeto.titulo)}</CardTitle>
                          {projeto.tipo === "estrategico" && (
                            <Badge variant="default" className="bg-primary flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5" />
                              Estratégico
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          projeto.status === "concluido" ? "default" : 
                          projeto.status === "em_andamento" ? "secondary" : 
                          projeto.status === "planejamento" ? "outline" : 
                          "destructive"
                        }>
                          {projeto.status === "planejamento" ? "Planejamento" : 
                           projeto.status === "em_andamento" ? "Em Andamento" : 
                           projeto.status === "concluido" ? "Concluído" : "Cancelado"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProjeto(projeto)}>
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
                              <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o projeto "{formatProjetoTitulo(projeto.titulo)}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProjeto(projeto.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <CardDescription>{projeto.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {projeto.data_entrega && <p><strong>Entrega:</strong> {format(new Date(projeto.data_entrega), "dd/MM/yyyy", { locale: ptBR })}</p>}
                      {projeto.avaliacao_mentor && <p><strong>Avaliação Mentor:</strong> {projeto.avaliacao_mentor}/5</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projetos.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum projeto cadastrado</p>
              )}
            </div>
          </TabsContent>

          {/* Aba Tarefas - EXISTENTE */}
          <TabsContent value="tarefas" className="space-y-4">
            <TarefasAdmin userId={selectedUserId} />
          </TabsContent>
        </Tabs>
      )}

      {/* Modais */}
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
      />

      <ProjetoModal
        open={projetoModalOpen}
        onOpenChange={setProjetoModalOpen}
        projeto={editingProjeto}
        userId={selectedUserId}
        onSubmit={(data) => {
          if (editingProjeto) {
            updateProjeto({ ...editingProjeto, ...data });
          } else {
            createProjeto(data);
          }
          setProjetoModalOpen(false);
        }}
      />
    </div>
  );
}
