import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Route, 
  ClipboardCheck, 
  FolderKanban, 
  Calendar, 
  ListTodo, 
  BookOpen, 
  HelpCircle,
  ChevronRight 
} from "lucide-react";

interface NavOption {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
}

export function NavegacaoRapida() {
  const navigate = useNavigate();

  const navOptions: NavOption[] = [
    {
      title: "Meu Processo",
      description: "Roadmap de fases",
      path: "/mentoria/processo",
      icon: Route,
    },
    {
      title: "Diagnóstico",
      description: "Seu perfil e análise",
      path: "/mentoria/diagnostico",
      icon: ClipboardCheck,
    },
    {
      title: "Projetos",
      description: "Suas entregas",
      path: "/mentoria/projetos",
      icon: FolderKanban,
    },
    {
      title: "Sessões",
      description: "Calendário",
      path: "/mentoria/sessoes",
      icon: Calendar,
    },
    {
      title: "Tarefas",
      description: "Afazeres",
      path: "/mentoria/tarefas",
      icon: ListTodo,
    },
    {
      title: "Materiais",
      description: "Recursos",
      path: "/mentoria/recursos",
      icon: BookOpen,
    },
    {
      title: "Dúvidas",
      description: "Tire dúvidas",
      path: "/mentoria/duvidas",
      icon: HelpCircle,
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Acesso Rápido</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: Lista vertical */}
        <div className="flex flex-col gap-1 sm:hidden">
          {navOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.path}
                onClick={() => navigate(option.path)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-all group"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{option.title}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Desktop/Tablet: Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {navOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.path}
                onClick={() => navigate(option.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground leading-tight">
                    {option.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
