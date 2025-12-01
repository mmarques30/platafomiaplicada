import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Aplique() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-aplicada-green-700/10 mb-4">
          <Rocket className="h-8 w-8 text-aplicada-green-700" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Aplique IA no seu negócio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubra como a Inteligência Artificial pode transformar sua empresa e carreira profissional
        </p>
      </div>

      <Card className="bg-card border-border shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Por que aplicar IA?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-aplicada-green-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Aumente sua produtividade</p>
              <p className="text-sm text-muted-foreground">Automatize tarefas repetitivas e foque no estratégico</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-aplicada-green-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Tome decisões mais inteligentes</p>
              <p className="text-sm text-muted-foreground">Use dados e insights gerados por IA para decisões assertivas</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-aplicada-green-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Destaque-se no mercado</p>
              <p className="text-sm text-muted-foreground">Profissionais que dominam IA são mais valorizados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <Button 
          size="lg"
          className="bg-aplicada-green-700 hover:bg-aplicada-green-800 text-white font-semibold px-8 py-6 text-lg shadow-lg"
          onClick={() => navigate("/ecossistema")}
        >
          Conheça nossos produtos
        </Button>
        <p className="text-sm text-muted-foreground">
          Explore nossas trilhas de aprendizado e produtos
        </p>
      </div>
    </div>
  );
}
