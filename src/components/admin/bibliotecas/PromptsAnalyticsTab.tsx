import { useState } from "react";
import { usePromptsAnalytics, Periodo } from "@/hooks/admin/usePromptsAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Copy, Calendar, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PromptsAnalyticsTab() {
  const [periodo, setPeriodo] = useState<Periodo>('7d');
  const { data, isLoading } = usePromptsAnalytics(periodo);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const TrendIcon = data?.tendenciaGeral && data.tendenciaGeral > 0 
    ? TrendingUp 
    : data?.tendenciaGeral && data.tendenciaGeral < 0 
      ? TrendingDown 
      : Minus;

  const trendColor = data?.tendenciaGeral && data.tendenciaGeral > 0 
    ? 'text-green-500' 
    : data?.tendenciaGeral && data.tendenciaGeral < 0 
      ? 'text-red-500' 
      : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
        <TabsList>
          <TabsTrigger value="7d">7 dias</TabsTrigger>
          <TabsTrigger value="30d">30 dias</TabsTrigger>
          <TabsTrigger value="90d">90 dias</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Cópias</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalCopias?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.mediaDiaria || 0}</div>
            <p className="text-xs text-muted-foreground">cópias por dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trendColor}`}>
              {data?.tendenciaGeral && data.tendenciaGeral > 0 ? '+' : ''}{data?.tendenciaGeral || 0}%
            </div>
            <p className="text-xs text-muted-foreground">vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Cópias por Dia */}
      {data?.copiasPorDia && data.copiasPorDia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cópias por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.copiasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="data" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value: number) => [value, 'Cópias']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="copias" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Top Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Prompts Copiados</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.topPrompts && data.topPrompts.length > 0 ? (
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
                {data.topPrompts.map((prompt, index) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{prompt.titulo}</TableCell>
                    <TableCell className="text-right font-medium">{prompt.copias}</TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center gap-1 ${
                        prompt.tendencia === 'up' ? 'text-green-500' :
                        prompt.tendencia === 'down' ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {prompt.tendencia === 'up' && <TrendingUp className="h-3 w-3" />}
                        {prompt.tendencia === 'down' && <TrendingDown className="h-3 w-3" />}
                        {prompt.tendencia === 'stable' && <Minus className="h-3 w-3" />}
                        {prompt.tendencia === 'up' ? '+' : prompt.tendencia === 'down' ? '-' : ''}{prompt.percentualMudanca}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Copy className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
