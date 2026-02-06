import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Clock, TrendingUp, CheckCircle2, Star, Zap, DollarSign, BarChart3, LineChart, Info } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useSkillsLider } from "@/hooks/useSkillsLider";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Roadmap padrão de 12 semanas (3 fases)
const defaultRoadmap = [
  { id: "default-1", numeroFase: 1, nomeFase: "Fundação", semanaInicio: 1, semanaFim: 4, status: "pendente" },
  { id: "default-2", numeroFase: 2, nomeFase: "Expansão", semanaInicio: 5, semanaFim: 8, status: "pendente" },
  { id: "default-3", numeroFase: 3, nomeFase: "Consolidação", semanaInicio: 9, semanaFim: 12, status: "pendente" },
];

const EmptyOverlay = ({ message }: { message: string }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-card/70 rounded-lg z-10">
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 text-sm text-muted-foreground">
      <Info className="h-4 w-4" />
      {message}
    </div>
  </div>
);

export default function SkillsLiderDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const {
    equipeId,
    equipeNome,
    empresaNome,
    isLider,
    isAdmin,
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
    custoHora,
    roiChartData,
    maturidadeChartData,
  } = useSkillsLider();

  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState("todo");
  const [filtroColaborador, setFiltroColaborador] = useState("todos");
  const [filtroProjeto, setFiltroProjeto] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Redirecionar SOMENTE quando auth carregou E dados carregaram E não tem acesso
  useEffect(() => {
    if (!authLoading && user && !isLoading && !canAccess) {
      navigate("/skills/equipe");
    }
  }, [authLoading, user, isLoading, canAccess, navigate]);

  // Filtrar entregas
  const entregasFiltradas = entregas.filter((e) => {
    if (filtroColaborador !== "todos" && e.responsavelId !== filtroColaborador) return false;
    if (filtroProjeto !== "todos" && e.id !== filtroProjeto) return false;
    if (filtroStatus !== "todos" && e.status !== filtroStatus) return false;
    return true;
  });

  // Usar roadmap do banco ou padrão
  const roadmapDisplay = roadmap.length > 0 ? roadmap : defaultRoadmap;

  // Verificar se há dados
  const hasMetricas = maturidadeChartData.some(d => d.maturidade > 0);
  const hasRoiData = roiChartData.some(d => d.executado > 0);
  const hasEntregas = totalEntregas > 0;
  const hasMembros = membros.length > 0;

  const chartConfig = {
    projetado: { label: "ROI Projetado", color: "hsl(var(--muted-foreground))" },
    executado: { label: "ROI Executado", color: "hsl(78, 54%, 34%)" },
    maturidade: { label: "Maturidade IA", color: "hsl(78, 54%, 34%)" },
  };

  // Mostrar skeleton enquanto auth ou dados carregam
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div>
        <PageTitle primary="Painel do Líder" secondary={equipeNome || "Equipe Skills"} />
        {empresaNome && (
          <p className="text-sm text-muted-foreground mt-1 ml-1">{empresaNome}</p>
        )}
        {isAdmin && !equipeId && (
          <div className="mt-3 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            Modo administrador: nenhuma equipe Skills cadastrada. Cadastre uma equipe no painel administrativo para visualizar dados reais.
          </div>
        )}
      </div>

      {/* BLOCO 1: FILTROS INTERATIVOS */}
      <Card className="border-border bg-card">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Período</span>
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger className="w-[150px] h-9 bg-[hsl(50,56%,91%)]/50 border-0 rounded-full text-sm">
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
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Colaborador</span>
              <Select value={filtroColaborador} onValueChange={setFiltroColaborador}>
                <SelectTrigger className="w-[150px] h-9 bg-[hsl(50,56%,91%)]/50 border-0 rounded-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {membros.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projeto</span>
              <Select value={filtroProjeto} onValueChange={setFiltroProjeto}>
                <SelectTrigger className="w-[150px] h-9 bg-[hsl(50,56%,91%)]/50 border-0 rounded-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {entregas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[150px] h-9 bg-[hsl(50,56%,91%)]/50 border-0 rounded-full text-sm">
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

      {/* BLOCO 2: KPIs PRINCIPAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Horas Economizadas</p>
                <p className="text-2xl font-bold text-foreground mt-1">{horasEconomizadasTotal}h<span className="text-sm font-normal text-muted-foreground">/sem</span></p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ROI Acumulado</p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  roiAcumulado >= 100 ? "text-green-600" : roiAcumulado > 0 ? "text-foreground" : "text-muted-foreground"
                )}>
                  {roiAcumulado.toFixed(0)}%
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entregas Concluídas</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {entregasConcluidas} <span className="text-sm font-normal text-muted-foreground">de {totalEntregas}</span>
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Performance Média</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {performanceMedia.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">/5</span>
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 3: CRONOGRAMA 12 SEMANAS */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Cronograma do Programa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {roadmapDisplay.map((fase) => (
              <div key={fase.id} className="flex-1">
                <div className="text-xs text-center font-medium text-muted-foreground mb-1.5">{fase.nomeFase}</div>
                <div className="flex gap-0.5">
                  {Array.from({ length: fase.semanaFim - fase.semanaInicio + 1 }, (_, i) => {
                    const semana = fase.semanaInicio + i;
                    const isCurrent = semana === semanaAtual;
                    const isPast = semana < semanaAtual;
                    return (
                      <div
                        key={semana}
                        className={cn(
                          "flex-1 h-3 rounded-sm transition-colors relative",
                          isPast && "bg-primary",
                          isCurrent && "bg-primary ring-2 ring-primary ring-offset-1 ring-offset-background",
                          !isPast && !isCurrent && "bg-muted"
                        )}
                        title={`Semana ${semana}${isCurrent ? " (atual)" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>Semana 1</span>
            <span className="font-medium text-primary">Semana atual: {semanaAtual}</span>
            <span>Semana 12</span>
          </div>
        </CardContent>
      </Card>

      {/* BLOCO 4 e 5: GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Impacto vs ROI */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              Impacto vs ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semana" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="projetado"
                  stackId="1"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.15}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="executado"
                  stackId="2"
                  stroke="hsl(78, 54%, 34%)"
                  fill="hsl(78, 54%, 34%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
            {!hasRoiData && <EmptyOverlay message="Adicione métricas semanais para visualizar o ROI executado" />}
          </CardContent>
        </Card>

        {/* Gráfico Maturidade IA */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
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
                <Bar dataKey="maturidade" fill="hsl(78, 54%, 34%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            {!hasMetricas && <EmptyOverlay message="Registre métricas semanais para visualizar a evolução" />}
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 6: RANKING DE ENTREGAS POR COLABORADOR */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ranking de Performance por Colaborador
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(0,0%,5%)] hover:bg-[hsl(0,0%,5%)]">
                  <TableHead className="w-14 text-white font-semibold text-xs">#</TableHead>
                  <TableHead className="text-white font-semibold text-xs">Colaborador</TableHead>
                  <TableHead className="text-center text-white font-semibold text-xs">Entregas</TableHead>
                  <TableHead className="text-center text-white font-semibold text-xs">Horas Econ.</TableHead>
                  <TableHead className="text-center text-white font-semibold text-xs">Performance</TableHead>
                  <TableHead className="text-center text-white font-semibold text-xs">Prazo</TableHead>
                  <TableHead className="text-right text-white font-semibold text-xs">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Info className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm">
                          {hasMembros
                            ? "Nenhuma entrega atribuída ainda. Configure entregas no painel administrativo."
                            : "Adicione membros à equipe para visualizar o ranking de performance."
                          }
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ranking.map((r, index) => (
                    <TableRow
                      key={r.userId}
                      className={cn(
                        index % 2 === 0 ? "bg-card" : "bg-muted/30",
                        r.posicao <= 3 && "bg-primary/5"
                      )}
                    >
                      <TableCell>
                        <Badge
                          variant={r.posicao <= 3 ? "default" : "secondary"}
                          className={cn(
                            "w-8 justify-center text-xs",
                            r.posicao === 1 && "bg-yellow-500 text-yellow-950 hover:bg-yellow-500",
                            r.posicao === 2 && "bg-gray-400 text-gray-950 hover:bg-gray-400",
                            r.posicao === 3 && "bg-amber-600 text-amber-950 hover:bg-amber-600"
                          )}
                        >
                          {r.posicao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={r.avatar || undefined} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {r.nome?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{r.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {r.entregasConcluidas}/{r.totalEntregas}
                      </TableCell>
                      <TableCell className="text-center text-sm">{r.horasEconomizadas}h</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {r.performanceMedia.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{r.taxaPrazo.toFixed(0)}%</TableCell>
                      <TableCell className="text-right font-bold text-sm">{r.score.toFixed(0)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* BLOCO 7: RESUMO DE IMPACTO (ROI) */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Resumo de Impacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold">{horasEconomizadasTotal}h</p>
              <p className="text-[11px] text-muted-foreground mt-1">Horas/semana</p>
            </div>

            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <Zap className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold">{entregasConcluidas}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Processos Automatizados</p>
            </div>

            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold">{(horasEconomizadasTotal * semanaAtual).toFixed(0)}h</p>
              <p className="text-[11px] text-muted-foreground mt-1">Total Economizado</p>
            </div>

            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xl font-bold">
                R$ {valorGerado.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Valor Gerado</p>
            </div>

            <div className="text-center p-4 bg-muted/40 rounded-lg">
              <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xl font-bold">
                R$ {(investimento || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Investimento</p>
            </div>

            <div className={cn(
              "text-center p-4 rounded-lg",
              roiAcumulado >= 100 ? "bg-green-500/15" : roiAcumulado >= 50 ? "bg-yellow-500/15" : "bg-muted/40"
            )}>
              <TrendingUp className={cn(
                "h-5 w-5 mx-auto mb-2",
                roiAcumulado >= 100 ? "text-green-600" : roiAcumulado >= 50 ? "text-yellow-600" : "text-primary"
              )} />
              <p className={cn(
                "text-xl font-bold",
                roiAcumulado >= 100 ? "text-green-600" : roiAcumulado >= 50 ? "text-yellow-600" : ""
              )}>
                {roiAcumulado.toFixed(0)}%
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">ROI</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
