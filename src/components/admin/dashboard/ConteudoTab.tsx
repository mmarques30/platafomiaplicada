import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Video,
  Layers,
  Sparkles,
  Star,
  FileText,
  BookOpen,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ConteudoTabProps {
  data: {
    conteudo: {
      trilhasAtivas: number;
      modulosAtivos: number;
      videosAtivos: number;
      ferramentasAtivas: number;
      mediaAvaliacoes: string;
    };
  };
}

export function ConteudoTab({ data }: ConteudoTabProps) {
  const inventarioData = [
    { name: "Trilhas", value: data.conteudo.trilhasAtivas, color: "hsl(var(--chart-1))" },
    { name: "Módulos", value: data.conteudo.modulosAtivos, color: "hsl(var(--chart-2))" },
    { name: "Vídeos", value: data.conteudo.videosAtivos, color: "hsl(var(--chart-3))" },
    { name: "Ferramentas", value: data.conteudo.ferramentasAtivas, color: "hsl(var(--chart-4))" },
  ];

  const totalConteudos = 
    data.conteudo.trilhasAtivas + 
    data.conteudo.modulosAtivos + 
    data.conteudo.videosAtivos + 
    data.conteudo.ferramentasAtivas;

  return (
    <div className="space-y-6">
      {/* Cards de Inventário */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Inventário de Conteúdo</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Trilhas Ativas"
            value={data.conteudo.trilhasAtivas}
            description="Trilhas disponíveis"
            icon={Layers}
          />
          <StatsCard
            title="Módulos Ativos"
            value={data.conteudo.modulosAtivos}
            description="Módulos disponíveis"
            icon={BookOpen}
          />
          <StatsCard
            title="Vídeos Ativos"
            value={data.conteudo.videosAtivos}
            description="Vídeos disponíveis"
            icon={Video}
          />
          <StatsCard
            title="Ferramentas IA"
            value={data.conteudo.ferramentasAtivas}
            description="Ferramentas catalogadas"
            icon={Sparkles}
          />
          <StatsCard
            title="Média Avaliações"
            value={data.conteudo.mediaAvaliacoes}
            description="Nota média dos vídeos"
            icon={Star}
          />
        </div>
      </div>

      {/* Gráfico de Distribuição */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventarioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventarioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Total de Conteúdos</span>
              </div>
              <span className="text-2xl font-bold">{totalConteudos}</span>
            </div>
            
            <div className="space-y-2">
              {inventarioData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {item.value} ({((item.value / totalConteudos) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avaliação Média</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{data.conteudo.mediaAvaliacoes}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
