import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, Lightbulb, Video } from "lucide-react";
import { DiagnosticoAdmin } from "@/components/admin/mentoria/DiagnosticoAdmin";
import { ProjetosIAAdmin } from "@/components/admin/mentoria/ProjetosIAAdmin";
import { FeedbackMentoraAdmin } from "@/components/admin/mentoria/FeedbackMentoraAdmin";
import { Badge } from "@/components/ui/badge";

export default function MentoriaAcademyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allUsers = [] } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filtrar apenas usuários Academy
  const users = allUsers.filter(u => u.plano_mentoria === "academy");
  const selectedUser = users.find(u => u.id === selectedUserId);

  useEffect(() => {
    if (selectedUserId) {
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria", selectedUserId] });
    }
  }, [selectedUserId, queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/gestao")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Mentoria Academy</h1>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              {users.length} mentorados
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Gerenciar mentorados do plano Academy - acesso a trilhas e conteúdos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Mentorado Academy
          </CardTitle>
          <CardDescription>
            Escolha um mentorado para visualizar e gerenciar suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecione um mentorado Academy" />
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
            <p className="text-lg font-medium">Nenhum mentorado Academy</p>
            <p className="text-sm text-muted-foreground">
              Não há mentorados com plano Academy cadastrados
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUserId && (
        <Tabs defaultValue="diagnostico-ia" className="space-y-4">
          <TabsList>
            <TabsTrigger value="diagnostico-ia">
              <FileText className="h-4 w-4 mr-2" />
              Diagnóstico IA
            </TabsTrigger>
            <TabsTrigger value="feedback-mentora">
              <Video className="h-4 w-4 mr-2" />
              Feedback Mentora
            </TabsTrigger>
            <TabsTrigger value="projetos-ia">
              <Lightbulb className="h-4 w-4 mr-2" />
              Projetos IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico-ia" className="space-y-4">
            <DiagnosticoAdmin userId={selectedUserId} allowManualInput={false} />
          </TabsContent>

          <TabsContent value="feedback-mentora" className="space-y-4">
            <FeedbackMentoraAdmin userId={selectedUserId} />
          </TabsContent>

          <TabsContent value="projetos-ia" className="space-y-4">
            <ProjetosIAAdmin userId={selectedUserId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
