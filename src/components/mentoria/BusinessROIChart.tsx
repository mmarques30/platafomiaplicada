import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ReferenceLine,
  ResponsiveContainer 
} from "recharts";
import { format, parseISO, addMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessROIChart() {
  const { contrato, progresso } = useContratosBusiness();
  const { projetos } = useMentoriaProjetos();

  // Gerar dados do gráfico baseado no contrato
  const gerarDadosGrafico = () => {
    if (!contrato?.data_inicio) {
      // Dados de exemplo quando não há contrato
      return [
        { mes: "Jan", roi: 0, projetosEntregues: 0 },
        { mes: "Fev", roi: 15, projetosEntregues: 1 },
        { mes: "Mar", roi: 35, projetosEntregues: 2 },
        { mes: "Abr", roi: 60, projetosEntregues: 3 },
        { mes: "Mai", roi: 85, projetosEntregues: 4 },
        { mes: "Jun", roi: 100, projetosEntregues: 5 },
      ];
    }

    const dataInicio = parseISO(contrato.data_inicio);
    const meses = contrato.tempo_consultoria_meses || 6;
    const roiTotal = contrato.roi_projetado || 100;
    
    const dados = [];
    const projetosConcluidos = projetos?.filter(p => p.status === "concluido") || [];
    
    for (let i = 0; i <= meses; i++) {
      const mesAtual = addMonths(startOfMonth(dataInicio), i);
      const mesLabel = format(mesAtual, "MMM", { locale: ptBR });
      
      // ROI cresce progressivamente
      const roiMes = Math.round((roiTotal / meses) * i);
      
      // Contar projetos entregues até este mês
      const projetosAteMes = projetosConcluidos.filter(p => {
        if (!p.data_entrega) return false;
        return parseISO(p.data_entrega) <= mesAtual;
      }).length;
      
      dados.push({
        mes: mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1),
        roi: roiMes,
        projetosEntregues: projetosAteMes,
      });
    }
    
    return dados;
  };

  const dados = gerarDadosGrafico();
  const projetosConcluidos = projetos?.filter(p => p.status === "concluido").length || 0;
  const roiAtual = contrato?.roi_projetado 
    ? Math.round((progresso.percentual / 100) * contrato.roi_projetado) 
    : 0;

  const chartConfig = {
    roi: {
      label: "ROI Projetado",
      color: "hsl(var(--primary))",
    },
    projetosEntregues: {
      label: "Projetos Entregues",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Projeção de ROI vs Projetos
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">ROI:</span>
              <span className="font-semibold text-primary">{roiAtual}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Projetos:</span>
              <span className="font-semibold text-green-500">{projetosConcluidos}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="mes" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="roi"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRoi)"
              />
              {/* Marcos de projetos entregues */}
              {dados.map((item, index) => (
                item.projetosEntregues > 0 && index > 0 && 
                dados[index - 1].projetosEntregues < item.projetosEntregues && (
                  <ReferenceLine
                    key={index}
                    x={item.mes}
                    stroke="hsl(var(--accent))"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>ROI Projetado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-accent" style={{ borderStyle: 'dashed' }} />
            <span>Projeto Entregue</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
