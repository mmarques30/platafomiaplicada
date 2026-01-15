import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Briefcase, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "@/components/shared/PageTitle";
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
      <div className="min-h-screen bg-background">
        {/* Header - Limpo igual Academy */}
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
            
            {/* Título seguindo padrão PageTitle */}
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-aplicada-green-700/10 border border-aplicada-green-700/20">
                <Crown className="h-6 w-6 text-aplicada-green-700" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <PageTitle primary="Painel de" secondary="Diagnóstico" />
                  <Badge className="bg-aplicada-green-700 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Business
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {diagnostico.nome_completo || profile?.nome_completo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar - Igual Academy */}
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
