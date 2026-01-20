import { useManageAdminPermissions } from "@/hooks/useAdminPermissions";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield, Users } from "lucide-react";
import { adminTheme } from "@/components/admin/adminTheme";

export default function GerenciarPermissoesEquipe() {
  const { allPermissions, isLoading, togglePermission } = useManageAdminPermissions();

  const handleToggle = async (permissionId: string, currentValue: boolean) => {
    try {
      await togglePermission(permissionId, !currentValue);
      toast.success("Permissão atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      toast.error("Erro ao atualizar permissão");
    }
  };

  if (isLoading) {
    return (
      <div className={adminTheme.page}>
        <div className={adminTheme.pageTitleWrapper}>
          <Shield className={adminTheme.pageIcon} />
          <h1 className={adminTheme.pageTitle}>Permissões da Equipe</h1>
        </div>
        <Card className={adminTheme.card}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Agrupa permissões por categoria baseado no path
  const groupedPermissions = allPermissions?.reduce((acc, perm) => {
    let category = "Geral";
    
    if (perm.admin_path.includes("/mentoria")) {
      category = "Mentoria";
    } else if (perm.admin_path.includes("/usuarios") || perm.admin_path.includes("/visitantes") || perm.admin_path.includes("/candidaturas")) {
      category = "Usuários";
    } else if (perm.admin_path.includes("/conteudo") || perm.admin_path.includes("/bibliotecas") || perm.admin_path.includes("/materiais")) {
      category = "Conteúdo";
    } else if (perm.admin_path.includes("/avisos") || perm.admin_path.includes("/comunidade") || perm.admin_path.includes("/pesquisas")) {
      category = "Comunicação";
    } else if (perm.admin_path.includes("/produtos") || perm.admin_path.includes("/tarefas")) {
      category = "Gestão";
    } else if (perm.admin_path.includes("/menus") || perm.admin_path.includes("/auditoria") || perm.admin_path.includes("/conhecimento")) {
      category = "Sistema";
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  const categoryOrder = ["Geral", "Usuários", "Conteúdo", "Mentoria", "Comunicação", "Gestão", "Sistema"];

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <Shield className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Permissões da Equipe</h1>
      </div>

      <Card className={adminTheme.card}>
        <CardHeader className={adminTheme.cardHeader}>
          <CardTitle className={`${adminTheme.cardTitle} flex items-center gap-2`}>
            <Users className="h-4 w-4" />
            Páginas do Painel Administrativo
          </CardTitle>
          <CardDescription className="text-sm">
            Ative ou desative o acesso a cada página para usuários da equipe. 
            Administradores sempre têm acesso total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryOrder.map((category) => {
              const permissions = groupedPermissions?.[category];
              if (!permissions?.length) return null;

              return (
                <div key={category}>
                  <h3 className="font-semibold text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{permission.admin_label}</p>
                          <p className="text-xs text-muted-foreground">{permission.admin_path}</p>
                        </div>
                        <Switch
                          checked={permission.can_access}
                          onCheckedChange={() => handleToggle(permission.id, permission.can_access)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
