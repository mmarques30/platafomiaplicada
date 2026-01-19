import { NavLink } from "react-router-dom";
import { FolderKanban, Settings, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/PageTitle";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface EnvironmentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  disabled?: boolean;
  variant?: "default" | "admin";
}

function EnvironmentCard({ title, description, icon, to, disabled, variant = "default" }: EnvironmentCardProps) {
  if (disabled) {
    return (
      <Card 
        className={cn(
          "opacity-50 cursor-not-allowed",
          variant === "admin" && "border-primary/30 bg-primary/5"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              variant === "admin" 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
            <ArrowRight className={cn(
              "h-5 w-5",
              variant === "admin" ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <CardTitle className="mt-4 text-lg">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xs font-medium uppercase tracking-wider",
            variant === "admin" ? "text-primary" : "text-muted-foreground"
          )}>
            Clique para acessar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <NavLink to={to} className="block">
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg group h-full",
          variant === "admin" && "border-primary/30 bg-primary/5"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              variant === "admin" 
                ? "bg-primary/10 text-primary group-hover:bg-primary/20" 
                : "bg-muted text-muted-foreground group-hover:bg-muted/80"
            )}>
              {icon}
            </div>
            <ArrowRight className={cn(
              "h-5 w-5 transition-transform group-hover:translate-x-1",
              variant === "admin" ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <CardTitle className="mt-4 text-lg">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-xs font-medium uppercase tracking-wider",
            variant === "admin" ? "text-primary" : "text-muted-foreground"
          )}>
            Clique para acessar
          </div>
        </CardContent>
      </Card>
    </NavLink>
  );
}

export default function AdminEnvironmentSelector() {
  const { isAdmin } = useUserRole();

  return (
    <div className="space-y-8">
      <div>
        <PageTitle primary="Painel" secondary="Administrativo" />
        <p className="text-muted-foreground mt-2">
          Selecione o ambiente que deseja acessar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <EnvironmentCard
          title="Projetos"
          description="Gerencie projetos, tarefas e acompanhe o progresso das equipes"
          icon={<FolderKanban className="h-6 w-6" />}
          to="/admin/projetos"
        />

        {isAdmin && (
          <EnvironmentCard
            title="Gestão"
            description="Usuários, conteúdo, configurações e ferramentas administrativas"
            icon={<Settings className="h-6 w-6" />}
            to="/admin/gestao"
            variant="admin"
          />
        )}
      </div>
    </div>
  );
}
