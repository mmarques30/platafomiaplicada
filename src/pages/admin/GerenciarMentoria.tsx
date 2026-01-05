import { useState, useEffect } from "react";
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
import { Plus, Users, Target, Calendar, BookOpen, FolderKanban, FileText, CheckSquare, RefreshCw, Route, Gift, Lock, CheckCircle, Pencil, Trash2, ExternalLink, FileDown } from "lucide-react";
import { DiagnosticoAdmin } from "@/components/admin/mentoria/DiagnosticoAdmin";
import { TarefasAdmin } from "@/components/admin/mentoria/TarefasAdmin";
import { ProcessoRoadmap } from "@/components/admin/mentoria/ProcessoRoadmap";
import BonusGlobaisTab from "@/components/admin/mentoria/BonusGlobaisTab";
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
import { PageTitle } from "@/components/shared/PageTitle";

export default function GerenciarMentoria() {
  const queryClient = useQueryClient();
  const usersQuery = useUsers();
  const users = usersQuery.data || [];
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  const { sessoes, createSessao, updateSessao, isCreating: isCreatingSessao, isUpdating: isUpdatingSessao } = useMentoriaSessoes(selectedUserId);
  const { recursos, createRecurso, updateRecurso, deleteRecurso, isCreating: isCreatingRecurso, isUpdating: isUpdatingRecurso } = useMentoriaRecursos(selectedUserId);
  const { projetos, createProjeto, updateProjeto, isCreating: isCreatingProjeto, isUpdating: isUpdatingProjeto } = useMentoriaProjetos(selectedUserId);
  const { bonus, createBonus, updateBonus, deleteBonus, isCreating: isCreatingBonus, isUpdating: isUpdatingBonus, isDeleting: isDeletingBonus } = useMentoriaBonus(selectedUserId);

  const [sessaoModalOpen, setSessaoModalOpen] = useState(false);
  const [recursoModalOpen, setRecursoModalOpen] = useState(false);
  const [projetoModalOpen, setProjetoModalOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);

  const [editingSessao, setEditingSessao] = useState<SessaoMentoria | undefined>();
  const [editingRecurso, setEditingRecurso] = useState<RecursoMentoria | undefined>();
  const [editingProjeto, setEditingProjeto] = useState<ProjetoMentoria | undefined>();
  const [editingBonus, setEditingBonus] = useState<BonusMentoria | undefined>();

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Auto-refresh ao trocar de usuário
  useEffect(() => {
    if (selectedUserId) {
      console.log("🔄 Trocando usuário, invalidando cache de projetos...");
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
    }
  }, [selectedUserId, queryClient]);

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

  const handleCreateBonus = (data: Partial<BonusMentoria>) => {
    createBonus(data);
  };

  const handleEditBonus = (bonusItem: BonusMentoria) => {
    setEditingBonus(bonusItem);
    setBonusModalOpen(true);
  };

  const handleUpdateBonus = (data: Partial<BonusMentoria>) => {
    if (editingBonus) {
      updateBonus({ ...data, id: editingBonus.id });
      setEditingBonus(undefined);
    }
  };

  const handleDeleteBonus = (id: string) => {
    deleteBonus(id);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <PageTitle primary="Gerenciar" secondary="Mentoria" />
          <p className="text-muted-foreground mt-2">
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

        <Tabs defaultValue="bonus-globais" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="bonus-globais">
              <Gift className="h-4 w-4 mr-2" />
              Bônus Globais
            </TabsTrigger>
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
          </TabsList>

          {/* Bônus Globais - não requer seleção de usuário */}
          <TabsContent value="bonus-globais" className="space-y-4">
            <BonusGlobaisTab />
          </TabsContent>

            {selectedUserId && (
              <>
                {/* Diagnóstico Tab */}
                <TabsContent value="diagnostico" className="space-y-4">
              <DiagnosticoAdmin userId={selectedUserId} />
            </TabsContent>

            {/* Roadmap Tab */}
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
                      // Invalidar TODAS as queries de projetos
                      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria"] });
                      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
                      
                      // Forçar refetch imediato
                      queryClient.refetchQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
                      
                      toast({ 
                        title: "Cache limpo!", 
                        description: "Dados recarregados do servidor"
                      });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Cache
                  </Button>
                  <Button onClick={() => { setEditingProjeto(undefined); setProjetoModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {projetos.map((projeto) => (
                  <Card key={projeto.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditProjeto(projeto)}>
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
                        
                        {/* Resumo de Módulos Associados */}
                        {((projeto.trilhas_recomendadas as any[])?.length > 0 || (projeto.modulos_obrigatorios as any[])?.length > 0) && (
                          <div className="pt-2 mt-2 border-t space-y-1">
                            {(projeto.trilhas_recomendadas as any[])?.length > 0 && (
                              <p className="text-xs">
                                <strong>Trilhas Recomendadas:</strong> {(projeto.trilhas_recomendadas as any[]).length}
                              </p>
                            )}
                            {(projeto.modulos_obrigatorios as any[])?.length > 0 && (
                              <p className="text-xs">
                                <strong>Módulos Associados:</strong> {(projeto.modulos_obrigatorios as any[]).length}
                              </p>
                            )}
                          </div>
                        )}
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

            <TabsContent value="recursos" className="space-y-6">
              {/* Recursos Section */}
              <div className="space-y-4">
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
              </div>

              {/* Bônus Condicionados Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Bônus Condicionados</h2>
                  </div>
                  <Button onClick={() => { setEditingBonus(undefined); setBonusModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Bônus
                  </Button>
                </div>

                <div className="grid gap-4">
                  {bonus.map((bonusItem) => (
                    <Card key={bonusItem.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${bonusItem.liberado ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                              {bonusItem.liberado ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{bonusItem.nome}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={bonusItem.condicao_tipo === 'sorteio' ? 'secondary' : 'outline'}>
                                  {bonusItem.condicao_tipo === 'sorteio' ? 'Sorteio' : 'Preenchimento'}
                                </Badge>
                                <Badge variant={bonusItem.liberado ? 'default' : 'destructive'}>
                                  {bonusItem.liberado ? 'Liberado' : 'Bloqueado'}
                                </Badge>
                              </div>
                            </div>
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
                                  <AlertDialogTitle>Excluir bônus?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "{bonusItem.nome}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteBonus(bonusItem.id)}>
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
                        <div className="space-y-3 text-sm">
                          {bonusItem.condicao_descricao && (
                            <p><strong>Condição:</strong> {bonusItem.condicao_descricao}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {bonusItem.link && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={bonusItem.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Link
                                </a>
                              </Button>
                            )}
                            {getArquivoUrls(bonusItem.arquivo_url).map((url, idx) => (
                              <Button key={idx} variant="outline" size="sm" asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  <FileDown className="h-3 w-3 mr-1" />
                                  {getArquivoUrls(bonusItem.arquivo_url).length > 1 ? `Doc ${idx + 1}` : 'Documento'}
                                </a>
                              </Button>
                            ))}
                          </div>

                          {bonusItem.comando_uso && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Comando de uso:</p>
                              <p className="text-sm whitespace-pre-wrap line-clamp-3">{bonusItem.comando_uso}</p>
                            </div>
                          )}

                          {bonusItem.liberado && bonusItem.data_liberacao && (
                            <p className="text-xs text-muted-foreground">
                              Liberado em {format(new Date(bonusItem.data_liberacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {bonus.length === 0 && (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum bônus cadastrado</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Adicione bônus condicionados a preenchimento ou sorteio
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
              </>
            )}
          </Tabs>
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

      <BonusModal
        open={bonusModalOpen}
        onOpenChange={(open) => {
          setBonusModalOpen(open);
          if (!open) setEditingBonus(undefined);
        }}
        onSubmit={editingBonus ? handleUpdateBonus : handleCreateBonus}
        bonus={editingBonus}
        userId={selectedUserId}
        isLoading={isCreatingBonus || isUpdatingBonus}
      />
    </>
  );
}
