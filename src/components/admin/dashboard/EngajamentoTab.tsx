import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/admin/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngajamentoCompleto } from "@/hooks/admin/useEngajamentoCompleto";
import {
  FileText,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Minus,
  Video,
  Star,
  Wrench,
  Clock,
  CheckCircle2,
  Eye,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function EngajamentoTab() {
  const { data: engajamentoData, isLoading: engajamentoLoading } = useEngajamentoCompleto();

  const isLoading = engajamentoLoading;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
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
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ========== VÍDEOS ASSISTIDOS ========== */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Vídeos Assistidos
        </h3>
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <StatsCard
            title="Total de Horas"
            value={`${engajamentoData?.videos.totalHoras ?? 0}h`}
            description="Tempo total assistido"
            icon={Clock}
          />
          <StatsCard
            title="Visualizações"
            value={engajamentoData?.videos.totalVisualizacoes ?? 0}
            description="Total de plays"
            icon={Eye}
          />
          <StatsCard
            title="Completados"
            value={engajamentoData?.videos.totalCompletados ?? 0}
            description="Vídeos finalizados"
            icon={CheckCircle2}
          />
          <StatsCard
            title="Taxa de Conclusão"
            value={`${engajamentoData?.videos.taxaConclusao ?? 0}%`}
            description="Vídeos completos"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Vídeos */}
          {engajamentoData?.videos.topVideos && engajamentoData.videos.topVideos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 10 Vídeos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engajamentoData.videos.topVideos.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis 
                        dataKey="titulo" 
                        type="category" 
                        width={120}
                        className="text-xs"
                        tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                      <Bar dataKey="visualizacoes" fill="hsl(var(--primary))" name="Visualizações" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribuição por Trilha */}
          {engajamentoData?.videos.distribuicaoTrilhas && engajamentoData.videos.distribuicaoTrilhas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tempo por Trilha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engajamentoData.videos.distribuicaoTrilhas.slice(0, 5)}
                          dataKey="tempo"
                          nameKey="nome"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          innerRadius={30}
                          paddingAngle={2}
                        >
                          {engajamentoData.videos.distribuicaoTrilhas.slice(0, 5).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}h`, 'Tempo']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legenda externa */}
                  <div className="mt-4 space-y-2">
                    {engajamentoData.videos.distribuicaoTrilhas.slice(0, 5).map((trilha, index) => (
                      <div key={trilha.nome} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="truncate flex-1 text-foreground">{trilha.nome}</span>
                        <span className="text-muted-foreground font-medium">{trilha.tempo.toFixed(1)}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ========== FERRAMENTAS AVALIADAS ========== */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Ferramentas Avaliadas
        </h3>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <StatsCard
            title="Total de Avaliações"
            value={engajamentoData?.ferramentas.totalAvaliacoes ?? 0}
            description="Votos da comunidade"
            icon={Star}
          />
          <StatsCard
            title="Média Geral"
            value={`${engajamentoData?.ferramentas.mediaGeral ?? 0} ⭐`}
            description="Nota média"
            icon={Star}
          />
          <StatsCard
            title="Ferramentas Avaliadas"
            value={engajamentoData?.ferramentas.topFerramentas?.length ?? 0}
            description="Com pelo menos 1 voto"
            icon={Wrench}
          />
        </div>

        {engajamentoData?.ferramentas.topFerramentas && engajamentoData.ferramentas.topFerramentas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Ferramentas Avaliadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Ferramenta</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Avaliação</TableHead>
                    <TableHead className="text-right">Votos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engajamentoData.ferramentas.topFerramentas.slice(0, 10).map((ferramenta, index) => (
                    <TableRow key={ferramenta.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{ferramenta.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ferramenta.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="flex items-center justify-end gap-1">
                          {(ferramenta.avaliacao_comunidade || 0).toFixed(1)}
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{ferramenta.total_avaliacoes_comunidade || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ========== CONTEÚDOS SALVOS (FAVORITOS) ========== */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Conteúdos Salvos (Favoritos)
        </h3>
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <StatsCard
            title="Total Salvos"
            value={engajamentoData?.favoritos.total ?? 0}
            description="Itens favoritados"
            icon={Bookmark}
          />
          <StatsCard
            title="Vídeos"
            value={engajamentoData?.favoritos.porTipo?.video ?? 0}
            description="Vídeos salvos"
            icon={Video}
          />
          <StatsCard
            title="Prompts"
            value={engajamentoData?.favoritos.porTipo?.prompt ?? 0}
            description="Prompts salvos"
            icon={FileText}
          />
          <StatsCard
            title="Ferramentas"
            value={engajamentoData?.favoritos.porTipo?.ferramenta ?? 0}
            description="Ferramentas salvas"
            icon={Wrench}
          />
        </div>

        {engajamentoData?.favoritos.topFavoritados && engajamentoData.favoritos.topFavoritados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conteúdos Mais Favoritados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>ID do Item</TableHead>
                    <TableHead className="text-right">Vezes Salvo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engajamentoData.favoritos.topFavoritados.map((item, index) => (
                    <TableRow key={`${item.tipo}-${item.itemId}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.itemId.substring(0, 8)}...</TableCell>
                      <TableCell className="text-right">{item.totalSalvos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
