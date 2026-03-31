import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
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
  ResponsiveContainer 
} from "recharts";
import { format, parseISO, addMonths, startOfMonth, endOfMonth, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessROIChart() {
  const businessUserId = useBusinessUserId();
  const { contrato, progresso } = useContratosBusiness(businessUserId);
  const { entregas } = useEntregasBusiness(contrato?.id);

  // Gerar dados do gráfico baseado no contrato e entregas
  const gerarDadosGrafico = () => {
    // Dados de exemplo quando não há contrato
    if (!contrato?.data_inicio) {
      return [
        { mes: "Jan", roiProjetado: 0, roiExecutado: 0 },
        { mes: "Fev", roiProjetado: 20, roiExecutado: 15 },
        { mes: "Mar", roiProjetado: 40, roiExecutado: 30 },
        { mes: "Abr", roiProjetado: 60, roiExecutado: 45 },
        { mes: "Mai", roiProjetado: 80, roiExecutado: 60 },
        { mes: "Jun", roiProjetado: 100, roiExecutado: 75 },
      ];
    }

    const dataInicio = parseISO(contrato.data_inicio);
    const meses = contrato.tempo_consultoria_meses || 6;
    const roiTotal = contrato.roi_projetado || 100;
    const totalEntregas = entregas.length || 1;
    const pesoEntrega = roiTotal / totalEntregas; // ROI por entrega

    const dados = [];
    const hoje = new Date();
    
    for (let i = 0; i <= meses; i++) {
      const mesAtual = addMonths(startOfMonth(dataInicio), i);
      const fimDoMes = endOfMonth(mesAtual);
      const mesLabel = format(mesAtual, "MMM", { locale: ptBR });
      
      // Entregas com prazo até este mês (projetado)
      const entregasProjetadas = entregas.filter(e => {
        if (!e.prazo_previsto) return false;
        const prazo = parseISO(e.prazo_previsto);
        return isBefore(prazo, fimDoMes) || prazo.getTime() === fimDoMes.getTime();
      }).length;
      
      // Entregas concluídas até este mês (executado real)
      // Só conta se o mês já passou ou é o mês atual
      const entregasConcluidas = isAfter(mesAtual, hoje) ? 0 : entregas.filter(e => {
        if (e.status !== 'concluida') return false;
        const dataAtualizacao = parseISO(e.updated_at);
        return isBefore(dataAtualizacao, fimDoMes) || dataAtualizacao.getTime() <= fimDoMes.getTime();
      }).length;
      
      dados.push({
        mes: mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1),
        roiProjetado: Math.round(entregasProjetadas * pesoEntrega),
        roiExecutado: Math.round(entregasConcluidas * pesoEntrega),
      });
    }
    
    return dados;
  };

  const dados = gerarDadosGrafico();
  const isDadosFicticios = !contrato?.data_inicio;
  
  // Calcular ROI atual baseado em entregas concluídas
  const totalEntregas = entregas.length || 1;
  const entregasConcluidas = entregas.filter(e => e.status === 'concluida').length;
  const roiTotal = contrato?.roi_projetado || 100;
  const roiAtualExecutado = Math.round((entregasConcluidas / totalEntregas) * roiTotal);
  
  // ROI projetado até agora (baseado em prazos)
  const hoje = new Date();
  const entregasComPrazoVencido = entregas.filter(e => {
    if (!e.prazo_previsto) return false;
    return isBefore(parseISO(e.prazo_previsto), hoje);
  }).length;
  const roiProjetadoAteAgora = Math.round((entregasComPrazoVencido / totalEntregas) * roiTotal);

  const chartConfig = {
    roiProjetado: {
      label: "ROI Projetado",
      color: "hsl(var(--primary))",
    },
    roiExecutado: {
      label: "ROI Executado",
      color: "#3b82f6",
    },
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Projeção de ROI
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Projetado:</span>
              <span className="font-semibold text-primary">{roiProjetadoAteAgora}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Executado:</span>
              <span className="font-semibold text-blue-500">{roiAtualExecutado}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className={isDadosFicticios ? "opacity-40" : ""}>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRoiProjetado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRoiExecutado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                    dataKey="roiProjetado"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRoiProjetado)"
                    name="Projetado"
                  />
                  <Area
                    type="monotone"
                    dataKey="roiExecutado"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRoiExecutado)"
                    name="Executado"
                  />
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
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>ROI Executado</span>
              </div>
            </div>
          </div>

          {isDadosFicticios && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
              <div className="bg-zinc-900/90 border border-[#E8A43C]/50 rounded-xl px-5 py-4 max-w-sm text-center flex flex-col items-center gap-2">
                <Info className="h-5 w-5 text-[#E8A43C] shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este é um exemplo do que você verá quando seu projeto iniciar. Os dados reais serão inseridos pela sua mentora.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
