import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Clock, TrendingUp, CheckCircle2, Star, Users, Zap, DollarSign, BarChart3, LineChart } from "lucide-react";
import { useSkillsLider } from "@/hooks/useSkillsLider";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Roadmap padrão de 12 semanas (3 fases)
const defaultRoadmap = [
  { id: "default-1", numeroFase: 1, nomeFase: "Fundação", semanaInicio: 1, semanaFim: 4, status: "pendente" },
  { id: "default-2", numeroFase: 2, nomeFase: "Expansão", semanaInicio: 5, semanaFim: 8, status: "pendente" },
  { id: "default-3", numeroFase: 3, nomeFase: "Consolidação", semanaInicio: 9, semanaFim: 12, status: "pendente" },
];

export default function SquadLiderPainel() {
  const navigate = useNavigate();
  const {
    equipeId,
    equipeNome,
    empresaNome,
    isLider,
    canAccess,
    isLoading,
    membros,
    entregas,
    ranking,
    roadmap,
    semanaAtual,
    horasEconomizadasTotal,
    entregasConcluidas,
    totalEntregas,
    performanceMedia,
    valorGerado,
    roiAcumulado,
    investimento,
    roiChartData,
    maturidadeChartData,
  } = useSkillsLider();

  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState("todo");
  const [filtroColaborador, setFiltroColaborador] = useState("todos");
  const [filtroProjeto, setFiltroProjeto] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Redirecionar se não for líder NEM admin em simulação
  useEffect(() => {
    if (!isLoading && !canAccess) {
      navigate("/skills/equipe");
    }
  }, [isLoading, canAccess, navigate]);

  // Filtrar entregas
  const entregasFiltradas = entregas.filter((e) => {
    if (filtroColaborador !== "todos" && e.responsavelId !== filtroColaborador) return false;
    if (filtroProjeto !== "todos" && e.id !== filtroProjeto) return false;
    if (filtroStatus !== "todos" && e.status !== filtroStatus) return false;
    return true;
  });

  // Usar roadmap do banco ou padrão
  const roadmapDisplay = roadmap.length > 0 ? roadmap : defaultRoadmap;

  // Verificar se há dados de métricas
  const hasMetricas = maturidadeChartData.some(d => d.maturidade > 0);
  const hasRoiData = roiChartData.some(d => d.executado > 0);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-20" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!equipeId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhuma Equipe encontrada</h2>
        <p className="text-muted-foreground">
          Você não está associado a nenhuma equipe Skills. Entre em contato com o suporte.
        </p>
      </div>
    );
  }

  const chartConfig = {
    projetado: { label: "ROI Projetado", color: "hsl(var(--muted-foreground))" },
    executado: { label: "ROI Executado", color: "hsl(var(--primary))" },
    maturidade: { label: "Maturidade IA", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Painel do Líder
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
        <p className="text-muted-foreground mt-2">
          {equipeNome || "Equipe Skills"} {empresaNome && `• ${empresaNome}`}
        </p>
      </div>

      {/* Filtros */}
      <Card className="border-border bg-card">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Período:</span>
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger className="w-40 bg-accent/50 border-0 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo o programa</SelectItem>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="mes">Último mês</SelectItem>
                  <SelectItem value="trimestre">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Colaborador:</span>
              <Select value={filtroColaborador} onValueChange={setFiltroColaborador}>
                <SelectTrigger className="w-40 bg-accent/50 border-0 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {membros.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Projeto:</span>
              <Select value={filtroProjeto} onValueChange={setFiltroProjeto}>
                <SelectTrigger className="w-40 bg-accent/50 border-0 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {entregas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40 bg-accent/50 border-0 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas Economizadas</p>
                <p className="text-2xl font-bold text-foreground">{horasEconomizadasTotal}h/sem</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI Acumulado</p>
                <p className="text-2xl font-bold text-foreground">{roiAcumulado.toFixed(0)}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregas Concluídas</p>
                <p className="text-2xl font-bold text-foreground">
                  {entregasConcluidas} <span className="text-muted-foreground text-base font-normal">de {totalEntregas}</span>
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Média</p>
                <p className="text-2xl font-bold text-foreground">{performanceMedia.toFixed(1)}/5</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cronograma 12 Semanas - Sempre com 3 fases */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Cronograma do Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {roadmapDisplay.map((fase) => (
              <div key={fase.id} className="flex-1">
                <div className="text-xs text-center text-muted-foreground mb-1">{fase.nomeFase}</div>
                <div className="flex gap-0.5">
                  {Array.from({ length: fase.semanaFim - fase.semanaInicio + 1 }, (_, i) => {
                    const semana = fase.semanaInicio + i;
                    const isCurrent = semana === semanaAtual;
                    const isPast = semana < semanaAtual;
                    return (
                      <div
                        key={semana}
                        className={cn(
                          "flex-1 h-3 rounded-sm transition-colors",
                          isPast && "bg-primary",
                          isCurrent && "bg-primary ring-2 ring-primary ring-offset-2",
                          !isPast && !isCurrent && "bg-muted"
                        )}
                        title={`Semana ${semana}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Semana 1</span>
            <span>Semana atual: {semanaAtual}</span>
            <span>Semana 12</span>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos: Impacto vs ROI + Maturidade IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Impacto vs ROI */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              Impacto vs ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semana" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="projetado"
                  stackId="1"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="executado"
                  stackId="2"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
            {!hasRoiData && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/60 rounded-lg">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Adicione métricas semanais para visualizar o ROI executado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Maturidade IA */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Evolução de Maturidade IA
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={maturidadeChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semana" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="maturidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            {!hasMetricas && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/60 rounded-lg">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Registre métricas semanais para visualizar a evolução da maturidade
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Entregas por Colaborador */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Ranking de Performance por Colaborador</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-foreground/5 hover:bg-foreground/5">
                <TableHead className="w-16 text-foreground">#</TableHead>
                <TableHead className="text-foreground">Colaborador</TableHead>
                <TableHead className="text-center text-foreground">Entregas</TableHead>
                <TableHead className="text-center text-foreground">Horas Econ.</TableHead>
                <TableHead className="text-center text-foreground">Performance</TableHead>
                <TableHead className="text-center text-foreground">Prazo</TableHead>
                <TableHead className="text-right text-foreground">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma entrega atribuída ainda. Configure entregas no painel administrativo.
                  </TableCell>
                </TableRow>
              ) : (
                ranking.map((r) => (
                  <TableRow
                    key={r.userId}
                    className={cn(
                      r.posicao <= 3 && "bg-primary/5"
                    )}
                  >
                    <TableCell>
                      <Badge
                        variant={r.posicao <= 3 ? "default" : "secondary"}
                        className={cn(
                          "w-8 justify-center",
                          r.posicao === 1 && "bg-yellow-500 text-yellow-950",
                          r.posicao === 2 && "bg-gray-400 text-gray-950",
                          r.posicao === 3 && "bg-amber-600 text-amber-950"
                        )}
                      >
                        {r.posicao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={r.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {r.nome?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{r.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {r.entregasConcluidas}/{r.totalEntregas}
                    </TableCell>
                    <TableCell className="text-center">{r.horasEconomizadas}h</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {r.performanceMedia.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{r.taxaPrazo.toFixed(0)}%</TableCell>
                    <TableCell className="text-right font-bold">{r.score.toFixed(0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumo de Impacto (ROI) */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Resumo de Impacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-accent/30 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{horasEconomizadasTotal}h</p>
              <p className="text-xs text-muted-foreground">Horas/semana</p>
            </div>

            <div className="text-center p-4 bg-accent/30 rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{entregasConcluidas}</p>
              <p className="text-xs text-muted-foreground">Processos Automatizados</p>
            </div>

            <div className="text-center p-4 bg-accent/30 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{(horasEconomizadasTotal * semanaAtual).toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">Total Economizado</p>
            </div>

            <div className="text-center p-4 bg-accent/30 rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                R$ {valorGerado.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">Valor Gerado</p>
            </div>

            <div className="text-center p-4 bg-accent/30 rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">
                R$ {(investimento || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">Investimento</p>
            </div>

            <div className={cn(
              "text-center p-4 rounded-lg",
              roiAcumulado >= 100 ? "bg-green-500/20" : roiAcumulado >= 50 ? "bg-yellow-500/20" : "bg-accent/30"
            )}>
              <TrendingUp className={cn(
                "h-6 w-6 mx-auto mb-2",
                roiAcumulado >= 100 ? "text-green-600" : roiAcumulado >= 50 ? "text-yellow-600" : "text-primary"
              )} />
              <p className="text-2xl font-bold">{roiAcumulado.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">ROI</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
