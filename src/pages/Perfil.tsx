import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Briefcase, Calendar, Linkedin, Edit2, Save, X } from "lucide-react";

export default function Perfil() {
  const { user } = useAuth();
  const { roles } = useUserRole();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data: progressData, error: progressError } = await supabase
        .from("progresso_videos")
        .select("*")
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      const videosAssistidos = progressData?.filter(p => p.completado).length || 0;
      const totalVideos = progressData?.length || 0;

      return {
        videosAssistidos,
        totalVideos,
        horasAssistidas: Math.floor((progressData?.reduce((acc, p) => acc + (p.tempo_assistido || 0), 0) || 0) / 3600),
      };
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    nome_completo: "",
    profissao: "",
    idade: "",
    linkedin: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          nome_completo: data.nome_completo,
          profissao: data.profissao,
          idade: data.idade ? parseInt(data.idade) : null,
          linkedin: data.linkedin,
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const handleEdit = () => {
    if (profile) {
      setFormData({
        nome_completo: profile.nome_completo || "",
        profissao: profile.profissao || "",
        idade: profile.idade?.toString() || "",
        linkedin: profile.linkedin || "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meu Perfil</h1>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Seus dados cadastrais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input
                    id="idade"
                    type="number"
                    value={formData.idade}
                    onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{profile?.nome_completo || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Profissão</p>
                    <p className="font-medium">{profile?.profissao || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Idade</p>
                    <p className="font-medium">{profile?.idade || "Não informado"}</p>
                  </div>
                </div>
                {profile?.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a 
                        href={profile.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Ver perfil
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Permissões</p>
              <div className="flex gap-2 flex-wrap">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role === "admin" ? "Administrador" : 
                       role === "mentorado" ? "Mentorado" : 
                       "Aluno"}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">Nenhuma permissão</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Suas Estatísticas</CardTitle>
            <CardDescription>Acompanhe seu progresso na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{stats?.videosAssistidos || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">Vídeos Completados</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{stats?.totalVideos || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">Total de Vídeos</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{stats?.horasAssistidas || 0}h</div>
                <p className="text-sm text-muted-foreground mt-2">Horas Assistidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
