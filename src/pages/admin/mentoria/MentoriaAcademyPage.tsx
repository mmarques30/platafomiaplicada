import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "@/hooks/admin/useUsers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, FileText, Lightbulb, Video } from "lucide-react";
import { DiagnosticoAdmin } from "@/components/admin/mentoria/DiagnosticoAdmin";
import { ProjetosIAAdmin } from "@/components/admin/mentoria/ProjetosIAAdmin";
import { FeedbackMentoraAdmin } from "@/components/admin/mentoria/FeedbackMentoraAdmin";
import { Badge } from "@/components/ui/badge";
import { adminTheme } from "@/components/admin/adminTheme";

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
    <div className={adminTheme.page}>
      {/* Header compacto igual ao Business */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => navigate("/admin/mentoria")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className={adminTheme.pageTitle}>Mentoria Academy</h1>
          <p className={adminTheme.pageSubtitle}>Gerenciar mentorados do plano Academy</p>
        </div>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-xs">
          {users.length} mentorados
        </Badge>
      </div>

      {/* Card de seleção compacto */}
      <Card className={adminTheme.card}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className={adminTheme.select}>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {users.length === 0 && (
        <div className={adminTheme.emptyState}>
          <Users className={adminTheme.emptyIcon} />
          <p className={adminTheme.emptyTitle}>Nenhum mentorado Academy</p>
          <p className={adminTheme.emptyDescription}>
            Não há mentorados com plano Academy cadastrados
          </p>
        </div>
      )}

      {selectedUserId && (
        <Tabs defaultValue="diagnostico-ia" className="space-y-4">
          <TabsList className={adminTheme.tabsList}>
            <TabsTrigger value="diagnostico-ia" className={adminTheme.tabsTrigger}>
              <FileText className={adminTheme.tabsIcon} />
              Diagnóstico IA
            </TabsTrigger>
            <TabsTrigger value="feedback-mentora" className={adminTheme.tabsTrigger}>
              <Video className={adminTheme.tabsIcon} />
              Feedback Mentora
            </TabsTrigger>
            <TabsTrigger value="projetos-ia" className={adminTheme.tabsTrigger}>
              <Lightbulb className={adminTheme.tabsIcon} />
              Projetos IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico-ia" className={adminTheme.tabsContent}>
            <DiagnosticoAdmin userId={selectedUserId} allowManualInput={false} />
          </TabsContent>

          <TabsContent value="feedback-mentora" className={adminTheme.tabsContent}>
            <FeedbackMentoraAdmin userId={selectedUserId} />
          </TabsContent>

          <TabsContent value="projetos-ia" className={adminTheme.tabsContent}>
            <ProjetosIAAdmin userId={selectedUserId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
