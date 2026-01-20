import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, Calendar, FolderKanban, Route, Plus, ClipboardList, ClipboardCheck } from "lucide-react";
import TasksBusinessManager from "@/components/admin/business/TasksBusinessManager";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { EtapasManager } from "@/components/admin/business/EtapasManager";
import { ContratoBusinessManager } from "@/components/admin/business/ContratoBusinessManager";
import { ReportsBusinessManager } from "@/components/admin/business/ReportsBusinessManager";
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
          <TabsList className="grid w-full grid-cols-6">
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
          </TabsList>

          {/* Aba Contrato */}
          <TabsContent value="contrato" className="space-y-4">
            <ContratoBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>

          {/* Aba Etapas */}
          <TabsContent value="etapas" className="space-y-4">
            <EtapasManager userId={selectedUserId} userName={selectedUser?.nome_completo} />
          </TabsContent>

          {/* Aba Reports */}
          <TabsContent value="reports" className="space-y-4">
            <ReportsBusinessManager 
              userId={selectedUserId} 
              userName={selectedUser?.nome_completo} 
            />
          </TabsContent>

          {/* Aba Sessões */}
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

          {/* Aba Entregas */}
          <TabsContent value="entregas" className="space-y-4">
            {contrato?.id ? (
              <EntregasBusinessManager 
                contratoId={contrato.id}
                userId={selectedUserId}
                userName={selectedUser?.nome_completo}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm">Para gerenciar entregas, é necessário criar o contrato na aba "Contrato"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Tasks */}
          <TabsContent value="tasks" className="space-y-4">
            {contrato?.id ? (
              <TasksBusinessManager 
                contratoId={contrato.id} 
                userId={selectedUserId} 
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Crie um contrato primeiro</p>
                  <p className="text-sm">Para gerenciar tasks de validação, é necessário criar o contrato na aba "Contrato"</p>
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
