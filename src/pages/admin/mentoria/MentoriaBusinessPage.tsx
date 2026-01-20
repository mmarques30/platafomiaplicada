import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, Calendar, FolderKanban, Route, Plus, ClipboardList, ClipboardCheck, ListChecks } from "lucide-react";
import TasksBusinessManager from "@/components/admin/business/TasksBusinessManager";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { EtapasManager } from "@/components/admin/business/EtapasManager";
import { ContratoBusinessManager } from "@/components/admin/business/ContratoBusinessManager";
import { ReportsBusinessManager } from "@/components/admin/business/ReportsBusinessManager";
import { InstrucoesBusinessManager } from "@/components/admin/business/InstrucoesBusinessManager";
import { Badge } from "@/components/ui/badge";
import SessaoModal from "@/components/admin/mentoria/SessaoModal";
import { SessaoMentoria } from "@/hooks/useMentoriaSessoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EntregasBusinessManager } from "@/components/admin/business/EntregasBusinessManager";

export default function MentoriaBusinessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allUsers = [] } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filtrar usuários Business
  const users = allUsers.filter(u => u.plano_mentoria === "business");
  const selectedUser = users.find(u => u.id === selectedUserId);

  // Buscar contrato do usuário selecionado
  const { contrato } = useContratosBusiness(selectedUserId);

  const { sessoes, createSessao, updateSessao } = useMentoriaSessoes(selectedUserId);

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
            <TabsTrigger value="sessoes" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="etapas" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Route className="h-3.5 w-3.5" />
              Etapas
            </TabsTrigger>
            <TabsTrigger value="instrucoes" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ListChecks className="h-3.5 w-3.5" />
              Instruções
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="entregas" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderKanban className="h-3.5 w-3.5" />
              Entregas
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

          {/* Aba Reports */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <ReportsBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>

          {/* Aba Sessões */}
          <TabsContent value="sessoes" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Sessões</h2>
                <Badge variant="secondary" className="text-xs">{sessoes.length}</Badge>
              </div>
              <Button size="sm" onClick={() => { setEditingSessao(undefined); setSessaoModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Nova Sessão
              </Button>
            </div>

            <div className="grid gap-3">
              {sessoes.map((sessao) => (
                <div 
                  key={sessao.id} 
                  className="p-3 rounded-xl border border-border/50 bg-card hover:shadow-sm cursor-pointer transition-all"
                  onClick={() => handleEditSessao(sessao)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{sessao.titulo}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        {sessao.duracao && <span>{sessao.duracao} min</span>}
                      </div>
                    </div>
                    <Badge 
                      variant={sessao.status === "realizada" ? "default" : sessao.status === "agendada" ? "secondary" : "destructive"}
                      className="text-xs shrink-0"
                    >
                      {sessao.status === "agendada" ? "Agendada" : sessao.status === "realizada" ? "Realizada" : "Cancelada"}
                    </Badge>
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

          {/* Aba Instruções */}
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
      />
    </div>
  );
}
