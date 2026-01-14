import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Briefcase, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPainelTheme } from "./painelTheme";

interface PainelDiagnosticoShellProps {
  children: ReactNode;
  isBusiness: boolean;
  diagnostico: any;
  profile?: any;
  voltarUrl: string;
  voltarLabel: string;
  isAcademyRoute: boolean;
}

export const PainelDiagnosticoShell = ({
  children,
  isBusiness,
  diagnostico,
  profile,
  voltarUrl,
  voltarLabel,
  isAcademyRoute,
}: PainelDiagnosticoShellProps) => {
  const navigate = useNavigate();
  const theme = getPainelTheme(isBusiness);

  if (isBusiness) {
    return (
      <div className={cn("min-h-screen relative", theme.pageBg)}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Header Premium */}
        <div className="relative border-b border-white/10">
          <div className="container mx-auto py-8 px-4 max-w-7xl">
            <Button
              variant="ghost"
              onClick={() => navigate(voltarUrl)}
              className={cn("mb-6", theme.buttonOutline)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {voltarLabel}
            </Button>
            
            <div className="flex items-center gap-4 mb-3">
              <h1 className={cn(
                "text-4xl md:text-5xl font-bold tracking-tight",
                theme.textPrimary
              )}>
                Painel de Diagnóstico
              </h1>
              <Badge className={cn(
                "px-3 py-1 text-sm font-semibold flex items-center gap-1.5",
                theme.badgeBg,
                theme.badgeText
              )}>
                <Crown className="w-3.5 h-3.5" />
                Business
              </Badge>
            </div>
            <p className={cn("text-lg", theme.textSecondary)}>
              {diagnostico.nome_completo || profile?.nome_completo}
            </p>
          </div>
        </div>

        {/* Quick Actions Bar - Glass Style */}
        <div className="container mx-auto px-4 max-w-7xl -mt-4 mb-8 relative z-10">
          <div className={cn(
            "rounded-xl border p-4 backdrop-blur-md",
            theme.cardBg,
            theme.cardBorder,
            "shadow-lg"
          )}>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(isAcademyRoute ? "/diagnostico/formulario" : "/mentoria/diagnostico")}
                className={cn("gap-2", theme.buttonOutline)}
              >
                <FileText className="w-4 h-4" />
                Ver Diagnóstico Completo
              </Button>
              
              {!isAcademyRoute && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/mentoria/projetos")}
                  className={cn("gap-2", theme.buttonOutline)}
                >
                  <Briefcase className="w-4 h-4" />
                  Ver Todos Projetos
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-8 px-4 max-w-7xl relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // Default Academy Layout
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate(voltarUrl)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {voltarLabel}
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Painel de Diagnóstico
          </h1>
          <p className="text-lg text-muted-foreground">
            {diagnostico.nome_completo || profile?.nome_completo}
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="container mx-auto px-4 max-w-7xl -mt-4 mb-8">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(isAcademyRoute ? "/diagnostico/formulario" : "/mentoria/diagnostico")}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver Diagnóstico Completo
            </Button>
            
            {!isAcademyRoute && (
              <Button
                variant="outline"
                onClick={() => navigate("/mentoria/projetos")}
                className="gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Ver Todos Projetos
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {children}
      </div>
    </div>
  );
};
