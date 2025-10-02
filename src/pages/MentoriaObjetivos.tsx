import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Plus } from "lucide-react";

export default function MentoriaObjetivos() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/mentoria")}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Meus Objetivos</h1>
        <p className="text-muted-foreground text-lg">
          Gerencie seus objetivos de aprendizagem e desenvolvimento
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivos de Desenvolvimento
              </CardTitle>
              <CardDescription>
                Defina e acompanhe seus objetivos de aprendizagem
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Objetivo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum objetivo cadastrado ainda</p>
            <p className="text-sm mt-2">Comece criando seu primeiro objetivo de desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
