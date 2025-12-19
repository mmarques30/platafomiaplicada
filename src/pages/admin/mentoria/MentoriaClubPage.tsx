import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useMentoriaRecursos } from "@/hooks/useMentoriaRecursos";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useMentoriaBonus, BonusMentoria, getArquivoUrls } from "@/hooks/useMentoriaBonus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, CheckSquare, Calendar, BookOpen, FolderKanban, Route, Gift, Plus, RefreshCw, Target, Pencil, Trash2, Lock, CheckCircle, ExternalLink, FileDown } from "lucide-react";
import { DiagnosticoAdmin } from "@/components/admin/mentoria/DiagnosticoAdmin";
import { TarefasAdmin } from "@/components/admin/mentoria/TarefasAdmin";
import { ProcessoRoadmap } from "@/components/admin/mentoria/ProcessoRoadmap";
import { Badge } from "@/components/ui/badge";
import SessaoModal from "@/components/admin/mentoria/SessaoModal";
import RecursoModal from "@/components/admin/mentoria/RecursoModal";
import ProjetoModal from "@/components/admin/mentoria/ProjetoModal";
import BonusModal from "@/components/admin/mentoria/BonusModal";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";
import { RecursoMentoria } from "@/hooks/useMentoriaRecursos";
import { ProjetoMentoria } from "@/hooks/useMentoriaProjetos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { formatProjetoTitulo } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function MentoriaClubPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allUsers = [] } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filtrar usuários Club (inclui club, boost, legacy)
  const users = allUsers.filter(u => ["club", "boost", "legacy"].includes(u.plano_mentoria || ""));
  const selectedUser = users.find(u => u.id === selectedUserId);

  const { sessoes, createSessao, updateSessao } = useMentoriaSessoes(selectedUserId);
  const { recursos, createRecurso, updateRecurso, deleteRecurso } = useMentoriaRecursos(selectedUserId);
  const { projetos, createProjeto, updateProjeto, deleteProjeto } = useMentoriaProjetos(selectedUserId);
  const { bonus, createBonus, updateBonus, deleteBonus } = useMentoriaBonus(selectedUserId);

  const [sessaoModalOpen, setSessaoModalOpen] = useState(false);
  const [recursoModalOpen, setRecursoModalOpen] = useState(false);
  const [projetoModalOpen, setProjetoModalOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);

  const [editingSessao, setEditingSessao] = useState<SessaoMentoria | undefined>();
  const [editingRecurso, setEditingRecurso] = useState<RecursoMentoria | undefined>();
  const [editingProjeto, setEditingProjeto] = useState<ProjetoMentoria | undefined>();
  const [editingBonus, setEditingBonus] = useState<BonusMentoria | undefined>();

  useEffect(() => {
    if (selectedUserId) {
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
    }
  }, [selectedUserId, queryClient]);

  const handleEditSessao = (sessao: SessaoMentoria) => {
    setEditingSessao(sessao);
    setSessaoModalOpen(true);
  };

  const handleEditRecurso = (recurso: RecursoMentoria) => {
    setEditingRecurso(recurso);
    setRecursoModalOpen(true);
  };

  const handleEditProjeto = (projeto: ProjetoMentoria) => {
    setEditingProjeto(projeto);
    setProjetoModalOpen(true);
  };

  const handleEditBonus = (bonusItem: BonusMentoria) => {
    setEditingBonus(bonusItem);
    setBonusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/mentoria")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Mentoria Club</h1>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
              {users.length} mentorados
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Gerenciar mentorados Club, Boost e Legacy - mentoria 1:1 completa
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Mentorado Club
          </CardTitle>
          <CardDescription>
            Escolha um mentorado para visualizar e gerenciar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecione um mentorado Club" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.nome_completo}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {user.plano_mentoria}
                  </Badge>
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
            <p className="text-lg font-medium">Nenhum mentorado Club</p>
            <p className="text-sm text-muted-foreground">
              Não há mentorados com plano Club, Boost ou Legacy cadastrados
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUserId && (
        <Tabs defaultValue="diagnostico" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="diagnostico">
              <FileText className="h-4 w-4 mr-2" />
              Diagnóstico
            </TabsTrigger>
            <TabsTrigger value="roadmap">
              <Route className="h-4 w-4 mr-2" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="projetos">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="tarefas">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="sessoes">
              <Calendar className="h-4 w-4 mr-2" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="recursos">
              <BookOpen className="h-4 w-4 mr-2" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="bonus">
              <Gift className="h-4 w-4 mr-2" />
              Bônus
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico" className="space-y-4">
            <DiagnosticoAdmin userId={selectedUserId} />
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-4">
            <ProcessoRoadmap userId={selectedUserId} />
          </TabsContent>

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

          <TabsContent value="tarefas" className="space-y-4">
            <TarefasAdmin userId={selectedUserId} />
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

          <TabsContent value="recursos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Recursos de {selectedUser?.nome_completo}</h2>
              <Button onClick={() => { setEditingRecurso(undefined); setRecursoModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Recurso
              </Button>
            </div>

            <div className="grid gap-4">
              {recursos.map((recurso) => (
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
              {recursos.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum recurso cadastrado</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bonus" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bônus de {selectedUser?.nome_completo}</h2>
              <Button onClick={() => { setEditingBonus(undefined); setBonusModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Bônus
              </Button>
            </div>

            <div className="grid gap-4">
              {bonus.filter(b => b.user_id === selectedUserId).map((bonusItem) => {
                const arquivos = getArquivoUrls(bonusItem.arquivo_url);
                return (
                  <Card key={bonusItem.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {bonusItem.liberado ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <CardTitle className="text-lg">{bonusItem.nome}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditBonus(bonusItem)}>
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
                                <AlertDialogTitle>Excluir Bônus</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este bônus? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBonus(bonusItem.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <CardDescription>{bonusItem.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <Badge variant={bonusItem.liberado ? "default" : "secondary"}>
                          {bonusItem.liberado ? "Liberado" : "Bloqueado"}
                        </Badge>
                        {bonusItem.link && (
                          <a href={bonusItem.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> Acessar link
                          </a>
                        )}
                        {arquivos.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {arquivos.map((url, idx) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
                                <FileDown className="h-3 w-3" /> Arquivo {idx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {bonus.filter(b => b.user_id === selectedUserId).length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum bônus cadastrado</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Modals */}
      <SessaoModal
        open={sessaoModalOpen}
        onOpenChange={setSessaoModalOpen}
        sessao={editingSessao}
        userId={selectedUserId}
        onSubmit={(data) => {
          if (editingSessao) {
            updateSessao({ ...data, id: editingSessao.id });
          } else {
            createSessao(data);
          }
          setEditingSessao(undefined);
        }}
      />

      <RecursoModal
        open={recursoModalOpen}
        onOpenChange={setRecursoModalOpen}
        recurso={editingRecurso}
        onSubmit={(data) => {
          if (editingRecurso) {
            updateRecurso({ ...data, id: editingRecurso.id });
          } else {
            createRecurso(data);
          }
          setEditingRecurso(undefined);
        }}
      />

      <ProjetoModal
        open={projetoModalOpen}
        onOpenChange={setProjetoModalOpen}
        projeto={editingProjeto}
        onSubmit={(data) => {
          if (editingProjeto) {
            updateProjeto({ ...data, id: editingProjeto.id });
          } else {
            createProjeto(data);
          }
          setEditingProjeto(undefined);
        }}
      />

      <BonusModal
        open={bonusModalOpen}
        onOpenChange={setBonusModalOpen}
        bonus={editingBonus}
        userId={selectedUserId}
        onSubmit={(data) => {
          if (editingBonus) {
            updateBonus({ ...data, id: editingBonus.id });
          } else {
            createBonus(data);
          }
          setEditingBonus(undefined);
        }}
      />
    </div>
  );
}
