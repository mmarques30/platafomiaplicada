import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/admin/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePromptsAnalytics, type Periodo } from "@/hooks/admin/usePromptsAnalytics";
import {
  FileText,
  Bookmark,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function EngajamentoTab() {
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const { data, isLoading } = usePromptsAnalytics(periodo);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Calcula tendência geral baseada nos dados
  const tendenciaValor = data?.tendenciaValor ?? 0;
  const tendenciaGeral = data?.tendenciaGeral ?? 'stable';

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <div className="flex justify-end">
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
          <TabsList>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
            <TabsTrigger value="90d">90 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Métricas de Prompts */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Prompts Copiados
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total de Cópias"
            value={data?.totalCopias ?? 0}
            description={`Últimos ${periodo === "7d" ? "7" : periodo === "30d" ? "30" : "90"} dias`}
            icon={FileText}
          />
          <StatsCard
            title="Média Diária"
            value={data?.mediaDiaria ?? 0}
            description="Cópias por dia"
            icon={TrendingUp}
          />
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tendência</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    {tendenciaGeral === 'up' ? '+' : tendenciaGeral === 'down' ? '-' : ''}
                    {Math.abs(tendenciaValor).toFixed(0)}%
                    {getTrendIcon(tendenciaGeral)}
                  </p>
                </div>
                <Badge variant={tendenciaGeral === 'up' ? 'default' : tendenciaGeral === 'down' ? 'destructive' : 'secondary'}>
                  vs período anterior
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráfico de Cópias por Dia */}
      {data?.copiasPorDia && data.copiasPorDia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cópias por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.copiasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="data" 
                    className="text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="copias" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    name="Cópias"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking de Prompts */}
      {data?.topPrompts && data.topPrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Prompts Copiados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="text-right">Cópias</TableHead>
                  <TableHead className="text-right">Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topPrompts.slice(0, 10).map((prompt, index) => (
                  <TableRow key={prompt.titulo}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-xs truncate">{prompt.titulo}</TableCell>
                    <TableCell className="text-right">{prompt.copias}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={
                          prompt.tendencia === 'up' ? 'text-green-500' : 
                          prompt.tendencia === 'down' ? 'text-red-500' : 
                          'text-muted-foreground'
                        }>
                          {prompt.percentualMudanca > 0 ? '+' : ''}{prompt.percentualMudanca.toFixed(0)}%
                        </span>
                        {getTrendIcon(prompt.tendencia)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Placeholder para outras métricas de engajamento */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Outros Indicadores
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Conteúdos Salvos"
            value="-"
            description="Em desenvolvimento"
            icon={Bookmark}
          />
          <StatsCard
            title="Ferramentas Acessadas"
            value="-"
            description="Em desenvolvimento"
            icon={Wrench}
          />
          <StatsCard
            title="Taxa de Retorno"
            value="-"
            description="Em desenvolvimento"
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}
