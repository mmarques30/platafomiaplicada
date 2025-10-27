import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Brain,
  FolderKanban, 
  Calendar, 
  ListTodo, 
  BookOpen, 
  Video,
  MessageCircle
} from "lucide-react";

interface NavOption {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

export function NavegacaoRapida() {
  const navigate = useNavigate();

  const navOptions: NavOption[] = [
    {
      title: "Diagnóstico",
      description: "Seu perfil e análise",
      icon: Brain,
      path: "/mentoria/diagnostico",
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200"
    },
    {
      title: "Projetos",
      description: "Seus 6 projetos",
      icon: FolderKanban,
      path: "/mentoria/projetos",
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200"
    },
    {
      title: "Sessões",
      description: "Calendário de sessões",
      icon: Calendar,
      path: "/mentoria/sessoes",
      color: "bg-green-100 text-green-600 hover:bg-green-200"
    },
    {
      title: "Tarefas",
      description: "Lista de afazeres",
      icon: ListTodo,
      path: "/mentoria/tarefas",
      color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
    },
    {
      title: "Materiais",
      description: "Recursos disponíveis",
      icon: BookOpen,
      path: "/mentoria/recursos",
      color: "bg-orange-100 text-orange-600 hover:bg-orange-200"
    },
    {
      title: "Gravações",
      description: "Sessões gravadas",
      icon: Video,
      path: "/mentoria/sessoes?filter=gravacoes",
      color: "bg-red-100 text-red-600 hover:bg-red-200"
    },
    {
      title: "Dúvidas",
      description: "Tire suas dúvidas",
      icon: MessageCircle,
      path: "/mentoria/duvidas",
      color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Navegação Rápida</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {navOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.path}
              className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => navigate(option.path)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${option.color} transition-colors`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{option.title}</h3>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
