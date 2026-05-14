import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shared/PageContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Briefcase, Calendar, Linkedin, Edit2, Save, X, Camera } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";

export default function Perfil() {
  const { user } = useAuth();
  const { roles } = useUserRole();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      setUploading(true);

      // Deletar avatar antigo se existir
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload novo avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Atualizar profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Avatar atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao atualizar avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    await uploadAvatar(file);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <PageTitle primary="Meu" secondary="Perfil" />
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline" className="w-full sm:w-auto">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      {/* Avatar Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.nome_completo} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.nome_completo ? getInitials(profile.nome_completo) : "?"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{profile?.nome_completo}</h3>
              <p className="text-sm text-muted-foreground">{profile?.profissao || "Sem profissão"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique no ícone da câmera para alterar sua foto
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription className="text-card-foreground/70">Seus dados cadastrais</CardDescription>
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
                    <p className="text-sm text-card-foreground/70">Nome</p>
                    <p className="font-medium text-card-foreground">{profile?.nome_completo || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-card-foreground/70">Profissão</p>
                    <p className="font-medium text-card-foreground">{profile?.profissao || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-card-foreground/70">Idade</p>
                    <p className="font-medium text-card-foreground">{profile?.idade || "Não informado"}</p>
                  </div>
                </div>
                {profile?.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-card-foreground/70">LinkedIn</p>
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
            <CardDescription className="text-card-foreground/70">Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-card-foreground/70">Email</p>
              <p className="font-medium text-card-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-card-foreground/70 mb-2">Permissões</p>
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
            <CardDescription className="text-card-foreground/70">Acompanhe seu progresso na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-primary">{stats?.videosAssistidos || 0}</div>
                <p className="text-xs md:text-sm text-card-foreground/70 mt-1 md:mt-2">Vídeos Completados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-primary">{stats?.totalVideos || 0}</div>
                <p className="text-xs md:text-sm text-card-foreground/70 mt-1 md:mt-2">Total de Vídeos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-primary">{stats?.horasAssistidas || 0}h</div>
                <p className="text-xs md:text-sm text-card-foreground/70 mt-1 md:mt-2">Horas Assistidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
