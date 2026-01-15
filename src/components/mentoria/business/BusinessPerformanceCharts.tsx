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

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export function BusinessPerformanceCharts({ 
  projetosProgresso, 
  ferramentasDistribuicao,
  entregasHistorico 
}: BusinessPerformanceChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-slate-100 font-medium">{label}</p>
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
      <Card className="bg-white/5 backdrop-blur-md border-white/10 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 flex items-center gap-2 text-base font-semibold">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            Progresso por Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projetosProgresso} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="progresso" 
                  name="Progresso"
                  fill="#8b5cf6" 
                  radius={[0, 4, 4, 0]}
                  background={{ fill: 'rgba(255,255,255,0.05)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Ferramentas - Pie Chart */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 flex items-center gap-2 text-base font-semibold">
            <PieChartIcon className="h-5 w-5 text-violet-400" />
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
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Entregas - Line Chart */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100 flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            Histórico de Entregas vs Meta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={entregasHistorico}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="entregas" 
                  name="Entregas"
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#a78bfa' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  name="Meta"
                  stroke="#64748b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#64748b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
