import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, ClipboardList, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AcessoRapidoCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        className="border-border bg-card cursor-pointer hover:border-[hsl(72,50%,35%)] transition-colors"
        onClick={() => navigate("/skills/projeto/performance")}
      >
        <CardContent className="flex items-center gap-4 py-5">
          <div className="rounded-lg bg-[hsl(68,40%,88%)] p-2.5">
            <BarChart3 className="h-5 w-5 text-[hsl(72,50%,35%)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Performance</p>
            <p className="text-xs text-muted-foreground">KPIs, gráficos e ranking</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card
        className="border-border bg-card cursor-pointer hover:border-[hsl(72,50%,35%)] transition-colors"
        onClick={() => navigate("/skills/projeto/diagnostico")}
      >
        <CardContent className="flex items-center gap-4 py-5">
          <div className="rounded-lg bg-[hsl(68,40%,88%)] p-2.5">
            <ClipboardList className="h-5 w-5 text-[hsl(72,50%,35%)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Diagnóstico</p>
            <p className="text-xs text-muted-foreground">Formulário e resultados IA</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
