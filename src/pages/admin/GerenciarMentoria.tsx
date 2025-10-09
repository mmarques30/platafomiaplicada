import { useState } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useMentoriaRecursos } from "@/hooks/useMentoriaRecursos";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useMentoriaObjetivos } from "@/hooks/useMentoriaObjetivos";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Target, Calendar, BookOpen, FolderKanban, FileText, CheckSquare } from "lucide-react";
import { DiagnosticoAdmin } from "@/components/admin/mentoria/DiagnosticoAdmin";
import { TarefasAdmin } from "@/components/admin/mentoria/TarefasAdmin";
import { GerenciarDuvidas } from "@/components/admin/mentoria/GerenciarDuvidas";
import { Badge } from "@/components/ui/badge";
import SessaoModal from "@/components/admin/mentoria/SessaoModal";
import RecursoModal from "@/components/admin/mentoria/RecursoModal";
import ProjetoModal from "@/components/admin/mentoria/ProjetoModal";
import ObjetivoModal from "@/components/admin/mentoria/ObjetivoModal";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";
import { RecursoMentoria } from "@/hooks/useMentoriaRecursos";
import { ProjetoMentoria } from "@/hooks/useMentoriaProjetos";
import { ObjetivoMentoria } from "@/hooks/useMentoriaObjetivos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarMentoria() {
  const usersQuery = useUsers();
  const users = usersQuery.data || [];
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  const { sessoes, createSessao, updateSessao, isCreating: isCreatingSessao, isUpdating: isUpdatingSessao } = useMentoriaSessoes();
  const { recursos, createRecurso, updateRecurso, deleteRecurso, isCreating: isCreatingRecurso, isUpdating: isUpdatingRecurso } = useMentoriaRecursos();
  const { projetos, createProjeto, updateProjeto, isCreating: isCreatingProjeto, isUpdating: isUpdatingProjeto } = useMentoriaProjetos();
  const { objetivos, createObjetivo, updateObjetivo, deleteObjetivo, isCreating: isCreatingObjetivo, isUpdating: isUpdatingObjetivo } = useMentoriaObjetivos(selectedUserId);

  const [sessaoModalOpen, setSessaoModalOpen] = useState(false);
  const [recursoModalOpen, setRecursoModalOpen] = useState(false);
  const [projetoModalOpen, setProjetoModalOpen] = useState(false);
  const [objetivoModalOpen, setObjetivoModalOpen] = useState(false);

  const [editingSessao, setEditingSessao] = useState<SessaoMentoria | undefined>();
  const [editingRecurso, setEditingRecurso] = useState<RecursoMentoria | undefined>();
  const [editingProjeto, setEditingProjeto] = useState<ProjetoMentoria | undefined>();
  const [editingObjetivo, setEditingObjetivo] = useState<ObjetivoMentoria | undefined>();

  const selectedUser = users.find(u => u.id === selectedUserId);
  
  const userSessoes = sessoes.filter(s => s.user_id === selectedUserId);
  const userRecursos = recursos.filter(r => r.user_id === selectedUserId);
  const userProjetos = projetos.filter(p => p.user_id === selectedUserId);

  const handleCreateSessao = (data: Partial<SessaoMentoria>) => {
    createSessao(data);
  };

  const handleEditSessao = (sessao: SessaoMentoria) => {
    setEditingSessao(sessao);
    setSessaoModalOpen(true);
  };

  const handleUpdateSessao = (data: Partial<SessaoMentoria>) => {
    if (editingSessao) {
      updateSessao({ ...data, id: editingSessao.id });
      setEditingSessao(undefined);
    }
  };

  const handleCreateRecurso = (data: Partial<RecursoMentoria>) => {
    createRecurso(data);
  };

  const handleEditRecurso = (recurso: RecursoMentoria) => {
    setEditingRecurso(recurso);
    setRecursoModalOpen(true);
  };

  const handleUpdateRecurso = (data: Partial<RecursoMentoria>) => {
    if (editingRecurso) {
      updateRecurso({ ...data, id: editingRecurso.id });
      setEditingRecurso(undefined);
    }
  };

  const handleCreateProjeto = (data: Partial<ProjetoMentoria>) => {
    createProjeto(data);
  };

  const handleEditProjeto = (projeto: ProjetoMentoria) => {
    setEditingProjeto(projeto);
    setProjetoModalOpen(true);
  };

  const handleUpdateProjeto = (data: Partial<ProjetoMentoria>) => {
    if (editingProjeto) {
      updateProjeto({ ...data, id: editingProjeto.id });
      setEditingProjeto(undefined);
    }
  };

  const handleCreateObjetivo = (data: Partial<ObjetivoMentoria>) => {
    createObjetivo(data);
  };

  const handleEditObjetivo = (objetivo: ObjetivoMentoria) => {
    setEditingObjetivo(objetivo);
    setObjetivoModalOpen(true);
  };

  const handleUpdateObjetivo = (data: Partial<ObjetivoMentoria>) => {
    if (editingObjetivo) {
      updateObjetivo({ ...data, id: editingObjetivo.id });
      setEditingObjetivo(undefined);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Mentoria</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie objetivos, sessões, recursos e projetos dos mentorados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selecionar Mentorado
            </CardTitle>
            <CardDescription>
              Escolha um mentorado para visualizar e gerenciar suas informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Selecione um mentorado" />
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

        {selectedUserId && (
          <Tabs defaultValue="diagnostico" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="diagnostico">
                <FileText className="h-4 w-4 mr-2" />
                Diagnóstico
              </TabsTrigger>
              <TabsTrigger value="objetivos">
                <Target className="h-4 w-4 mr-2" />
                Objetivos
              </TabsTrigger>
              <TabsTrigger value="tarefas">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tarefas
              </TabsTrigger>
              <TabsTrigger value="duvidas">
                Dúvidas
              </TabsTrigger>
              <TabsTrigger value="sessoes">
                <Calendar className="h-4 w-4 mr-2" />
                Sessões
              </TabsTrigger>
              <TabsTrigger value="recursos">
                <BookOpen className="h-4 w-4 mr-2" />
                Recursos
              </TabsTrigger>
              <TabsTrigger value="projetos">
                <FolderKanban className="h-4 w-4 mr-2" />
                Projetos
              </TabsTrigger>
            </TabsList>

            {/* Diagnóstico Tab */}
            <TabsContent value="diagnostico" className="space-y-4">
              <DiagnosticoAdmin userId={selectedUserId} />
            </TabsContent>

            <TabsContent value="tarefas" className="space-y-4">
              <TarefasAdmin userId={selectedUserId} />
            </TabsContent>

            <TabsContent value="duvidas" className="space-y-4">
              <GerenciarDuvidas userId={selectedUserId} />
            </TabsContent>

            <TabsContent value="objetivos" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Objetivos de {selectedUser?.nome_completo}</h2>
                <Button onClick={() => { setEditingObjetivo(undefined); setObjetivoModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Objetivo
                </Button>
              </div>

              <div className="grid gap-4">
                {objetivos.map((objetivo) => (
                  <Card key={objetivo.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditObjetivo(objetivo)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{objetivo.objetivo}</CardTitle>
                        <Badge variant={objetivo.status === "concluido" ? "default" : objetivo.status === "em_andamento" ? "secondary" : "destructive"}>
                          {objetivo.status === "em_andamento" ? "Em Andamento" : objetivo.status === "concluido" ? "Concluído" : "Cancelado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {objetivo.prazo && <p><strong>Prazo:</strong> {format(new Date(objetivo.prazo), "dd/MM/yyyy", { locale: ptBR })}</p>}
                        {objetivo.progresso !== undefined && <p><strong>Progresso:</strong> {objetivo.progresso}%</p>}
                        {objetivo.observacoes && <p className="text-muted-foreground">{objetivo.observacoes}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {objetivos.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum objetivo cadastrado</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sessoes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sessões de {selectedUser?.nome_completo}</h2>
                <Button onClick={() => { setEditingSessao(undefined); setSessaoModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Sessão
                </Button>
              </div>

              <div className="grid gap-4">
                {userSessoes.map((sessao) => (
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

                {userSessoes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma sessão cadastrada</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recursos" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Recursos de {selectedUser?.nome_completo}</h2>
                <Button onClick={() => { setEditingRecurso(undefined); setRecursoModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Recurso
                </Button>
              </div>

              <div className="grid gap-4">
                {userRecursos.map((recurso) => (
                  <Card key={recurso.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditRecurso(recurso)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{recurso.nome}</CardTitle>
                        <Badge>{recurso.categoria}</Badge>
                      </div>
                      <CardDescription>{recurso.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{recurso.para_que_serve}</p>
                    </CardContent>
                  </Card>
                ))}

                {userRecursos.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum recurso cadastrado</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="projetos" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Projetos de {selectedUser?.nome_completo}</h2>
                <Button onClick={() => { setEditingProjeto(undefined); setProjetoModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </div>

              <div className="grid gap-4">
                {userProjetos.map((projeto) => (
                  <Card key={projeto.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditProjeto(projeto)}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
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
                      </div>
                      <CardDescription>{projeto.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {projeto.data_entrega && <p><strong>Entrega:</strong> {format(new Date(projeto.data_entrega), "dd/MM/yyyy", { locale: ptBR })}</p>}
                        {projeto.avaliacao_mentor && <p><strong>Avaliação Mentor:</strong> {projeto.avaliacao_mentor}/5</p>}
                        {projeto.devolutiva_mentor && <p className="text-muted-foreground line-clamp-2">{projeto.devolutiva_mentor}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {userProjetos.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum projeto cadastrado</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <SessaoModal
        open={sessaoModalOpen}
        onOpenChange={(open) => {
          setSessaoModalOpen(open);
          if (!open) setEditingSessao(undefined);
        }}
        onSubmit={editingSessao ? handleUpdateSessao : handleCreateSessao}
        sessao={editingSessao}
        userId={selectedUserId}
        isLoading={isCreatingSessao || isUpdatingSessao}
      />

      <RecursoModal
        open={recursoModalOpen}
        onOpenChange={(open) => {
          setRecursoModalOpen(open);
          if (!open) setEditingRecurso(undefined);
        }}
        onSubmit={editingRecurso ? handleUpdateRecurso : handleCreateRecurso}
        recurso={editingRecurso}
        userId={selectedUserId}
        isLoading={isCreatingRecurso || isUpdatingRecurso}
      />

      <ProjetoModal
        open={projetoModalOpen}
        onOpenChange={(open) => {
          setProjetoModalOpen(open);
          if (!open) setEditingProjeto(undefined);
        }}
        onSubmit={editingProjeto ? handleUpdateProjeto : handleCreateProjeto}
        projeto={editingProjeto}
        userId={selectedUserId}
        isLoading={isCreatingProjeto || isUpdatingProjeto}
        isAdmin={true}
      />

      <ObjetivoModal
        open={objetivoModalOpen}
        onOpenChange={(open) => {
          setObjetivoModalOpen(open);
          if (!open) setEditingObjetivo(undefined);
        }}
        onSubmit={editingObjetivo ? handleUpdateObjetivo : handleCreateObjetivo}
        objetivo={editingObjetivo}
        userId={selectedUserId}
        isLoading={isCreatingObjetivo || isUpdatingObjetivo}
      />
    </>
  );
}
