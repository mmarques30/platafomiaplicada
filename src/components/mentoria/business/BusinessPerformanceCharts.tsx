import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

interface ProjetoProgresso {
  nome: string;
  progresso: number;
}

interface FerramentaDistribuicao {
  nome: string;
  qtd: number;
}

interface EntregaHistorico {
  mes: string;
  entregas: number;
  meta: number;
}

interface BusinessPerformanceChartsProps {
  projetosProgresso: ProjetoProgresso[];
  ferramentasDistribuicao: FerramentaDistribuicao[];
  entregasHistorico: EntregaHistorico[];
}

// Using brand colors - aplicada-green variants
const COLORS = ['#9EB038', '#7A8C2A', '#5C6A20', '#4A5519', '#3D4615'];

export function BusinessPerformanceCharts({ 
  projetosProgresso, 
  ferramentasDistribuicao,
  entregasHistorico 
}: BusinessPerformanceChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'Progresso' || entry.name === 'Meta' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Progresso por Projeto - Bar Chart */}
      <Card className="border-border lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-5 w-5 text-brand-strong" />
            Progresso por Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projetosProgresso} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="progresso" 
                  name="Progresso"
                  fill="#9EB038" 
                  radius={[0, 4, 4, 0]}
                  background={{ fill: 'hsl(var(--muted))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Ferramentas - Pie Chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <PieChartIcon className="h-5 w-5 text-brand-strong" />
            Ferramentas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ferramentasDistribuicao}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="qtd"
                  nameKey="nome"
                >
                  {ferramentasDistribuicao.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Entregas - Line Chart */}
      <Card className="border-border lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-5 w-5 text-brand-strong" />
            Histórico de Entregas vs Meta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={entregasHistorico}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="entregas" 
                  name="Entregas"
                  stroke="#9EB038" 
                  strokeWidth={2}
                  dot={{ fill: '#9EB038', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#B5C940' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  name="Meta"
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
