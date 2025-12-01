import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Avance() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-aplicada-green-700/10 mb-4">
          <TrendingUp className="h-8 w-8 text-aplicada-green-700" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Avance para o próximo nível
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Você já está conosco. Hora de acelerar seus resultados com IA
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border text-center">
          <CardContent className="pt-6">
            <Target className="h-8 w-8 text-aplicada-green-700 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Mentoria 1:1</h3>
            <p className="text-sm text-muted-foreground">
              Suporte individualizado para acelerar resultados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-center">
          <CardContent className="pt-6">
            <Zap className="h-8 w-8 text-aplicada-green-700 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Projetos Práticos</h3>
            <p className="text-sm text-muted-foreground">
              Implemente IA em casos reais do seu negócio
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-center">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-aplicada-green-700 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Acesso Premium</h3>
            <p className="text-sm text-muted-foreground">
              Conteúdo exclusivo e ferramentas avançadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-aplicada-green-700/5 border-aplicada-green-700/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-foreground">
            Pronto para dar o próximo passo?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Explore as opções de upgrade e acelere sua jornada com IA
          </p>
          <Button 
            size="lg"
            className="bg-aplicada-green-700 hover:bg-aplicada-green-800 text-white font-semibold px-8 py-6 text-lg shadow-lg"
            onClick={() => navigate("/ecossistema")}
          >
            Ver opções de upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
