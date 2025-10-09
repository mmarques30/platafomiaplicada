import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Calendar, FileText, BookOpen, ArrowRight, Loader2, ListTodo, MessageCircle } from "lucide-react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { ResumoProgresso } from "@/components/mentoria/ResumoProgresso";
import { PendenciasUrgentes } from "@/components/mentoria/PendenciasUrgentes";


export default function Mentoria() {
  const navigate = useNavigate();
  const { formulario, isLoading } = useMentoriaForm();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const menuOptions = [
    {
      title: "Diagnóstico IA",
      description: formulario?.completado 
        ? "Visualizar ou atualizar seu diagnóstico personalizado" 
        : "Inicie seu diagnóstico personalizado com IA",
      icon: Brain,
      path: "/mentoria/diagnostico",
      status: formulario?.completado ? "Completado" : "Pendente",
      statusColor: formulario?.completado ? "text-green-600" : "text-yellow-600"
    },
    {
      title: "Meus Objetivos",
      description: "Gerencie seus objetivos de aprendizagem e desenvolvimento",
      icon: Target,
      path: "/mentoria/objetivos",
      status: "Disponível",
      statusColor: "text-blue-600"
    },
    {
      title: "Tarefas",
      description: "Acompanhe suas tarefas e entregas",
      icon: ListTodo,
      path: "/mentoria/tarefas",
      status: "Disponível",
      statusColor: "text-blue-600"
    },
    {
      title: "Sessões",
      description: "Acompanhe suas sessões, gravações e transcrições",
      icon: Calendar,
      path: "/mentoria/sessoes",
      status: "Disponível",
      statusColor: "text-blue-600"
    },
    {
      title: "Recursos",
      description: "Ferramentas recomendadas para seu desenvolvimento",
      icon: BookOpen,
      path: "/mentoria/recursos",
      status: "Disponível",
      statusColor: "text-blue-600"
    },
    {
      title: "Projetos",
      description: "Seus projetos de mentoria com avaliações e feedback",
      icon: FileText,
      path: "/mentoria/projetos",
      status: "Disponível",
      statusColor: "text-blue-600"
    },
    {
      title: "Dúvidas",
      description: "Tire suas dúvidas com seu mentor",
      icon: MessageCircle,
      path: "/mentoria/duvidas",
      status: "Disponível",
      statusColor: "text-blue-600"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Mentoria IA</h1>
        <p className="text-muted-foreground text-lg">
          Seu programa personalizado de desenvolvimento em Inteligência Artificial
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <ResumoProgresso />
        <PendenciasUrgentes />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Acesso Rápido</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.path}
              className="transition-all hover:shadow-lg cursor-pointer hover:border-primary"
              onClick={() => navigate(option.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <span className={`text-sm font-medium ${option.statusColor}`}>
                        {option.status}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {option.description}
                </CardDescription>
                <Button 
                  variant="ghost" 
                  className="mt-4 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(option.path);
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
