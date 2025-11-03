import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface NavOption {
  title: string;
  description: string;
  path: string;
}

export function NavegacaoRapida() {
  const navigate = useNavigate();

  const navOptions: NavOption[] = [
    {
      title: "Diagnóstico",
      description: "Seu perfil e análise",
      path: "/mentoria/diagnostico"
    },
    {
      title: "Objetivos",
      description: "Seus objetivos estratégicos",
      path: "/mentoria/objetivos"
    },
    {
      title: "Projetos",
      description: "Seus projetos práticos",
      path: "/mentoria/projetos"
    },
    {
      title: "Sessões",
      description: "Calendário de sessões",
      path: "/mentoria/sessoes"
    },
    {
      title: "Tarefas",
      description: "Lista de afazeres",
      path: "/mentoria/tarefas"
    },
    {
      title: "Materiais",
      description: "Recursos disponíveis",
      path: "/mentoria/recursos"
    },
    {
      title: "Gravações",
      description: "Sessões gravadas",
      path: "/mentoria/sessoes?filter=gravacoes"
    },
    {
      title: "Dúvidas",
      description: "Tire suas dúvidas",
      path: "/mentoria/duvidas"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Navegação Rápida</h2>
      <div className="flex flex-col gap-3">
        {navOptions.map((option) => {
          return (
            <Card
              key={option.path}
              className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50 h-20"
              onClick={() => navigate(option.path)}
            >
              <CardContent className="p-4 flex items-center justify-between h-full">
                <h3 className="font-semibold text-base">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
