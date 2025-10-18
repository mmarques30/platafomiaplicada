import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getColorByIndex } from "@/lib/chartColors";

const COLORS = [
  "hsl(var(--chart-1))", // Verde 900
  "hsl(var(--chart-2))", // Verde 800
  "hsl(var(--chart-3))", // Verde 700
  "hsl(var(--chart-4))", // Verde 600
  "hsl(var(--chart-5))", // Verde 500
  "hsl(var(--chart-6))", // Verde 400
];

interface VideoAnalyticsChartsProps {
  topVideos: any[];
  distribuicaoTrilhas: any[];
}

export function VideoAnalyticsCharts({ topVideos, distribuicaoTrilhas }: VideoAnalyticsChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-8">
      {/* Gráfico de Barras: Top 10 Vídeos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Vídeos Mais Assistidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topVideos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="titulo" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visualizacoes" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza: Distribuição por Trilha */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Tempo por Trilha</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoTrilhas}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.nome}: ${entry.tempo.toFixed(1)}h`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="tempo"
              >
                {distribuicaoTrilhas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
