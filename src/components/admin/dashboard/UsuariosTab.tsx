import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  UserPlus,
  UserCheck,
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TopUsuario {
  userId: string;
  nome: string;
  videosAssistidos: number;
  videosConcluidos: number;
  ultimoAcesso: string;
}

interface UsuariosTabProps {
  data: {
    crescimento: {
      totalUsuarios: number;
      usuariosAtivos: number;
      usuariosAtivos7d: number;
      usuariosAtivos30d: number;
      novosUsuarios7d: number;
      novosUsuarios30d: number;
    };
    visitantes: {
      total: number;
      novos7d: number;
      novos30d: number;
      conversoes7d: number;
      conversoes30d: number;
      taxaConversao: number;
    };
    topUsuarios: TopUsuario[];
  };
}

type Periodo = "7d" | "30d";

export function UsuariosTab({ data }: UsuariosTabProps) {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<Periodo>("7d");

  const novosUsuarios = periodo === "7d" ? data.crescimento.novosUsuarios7d : data.crescimento.novosUsuarios30d;
  const usuariosAtivos = periodo === "7d" ? data.crescimento.usuariosAtivos7d : data.crescimento.usuariosAtivos30d;
  const novosVisitantes = periodo === "7d" ? data.visitantes.novos7d : data.visitantes.novos30d;
  const conversoes = periodo === "7d" ? data.visitantes.conversoes7d : data.visitantes.conversoes30d;

  // Dados simulados para o gráfico (em produção viria do hook)
  const chartData = periodo === "7d" 
    ? [
        { dia: "Seg", novos: Math.round(novosUsuarios / 7), ativos: Math.round(usuariosAtivos / 3) },
        { dia: "Ter", novos: Math.round(novosUsuarios / 6), ativos: Math.round(usuariosAtivos / 2.5) },
        { dia: "Qua", novos: Math.round(novosUsuarios / 5), ativos: Math.round(usuariosAtivos / 2) },
        { dia: "Qui", novos: Math.round(novosUsuarios / 4), ativos: Math.round(usuariosAtivos / 1.8) },
        { dia: "Sex", novos: Math.round(novosUsuarios / 5), ativos: Math.round(usuariosAtivos / 1.5) },
        { dia: "Sáb", novos: Math.round(novosUsuarios / 8), ativos: Math.round(usuariosAtivos / 3) },
        { dia: "Dom", novos: Math.round(novosUsuarios / 10), ativos: Math.round(usuariosAtivos / 4) },
      ]
    : Array.from({ length: 4 }, (_, i) => ({
        dia: `Semana ${i + 1}`,
        novos: Math.round(novosUsuarios / 4),
        ativos: Math.round(usuariosAtivos / 2),
      }));

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <div className="flex justify-end">
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
          <TabsList>
            <TabsTrigger value="7d">7 dias</TabsTrigger>
            <TabsTrigger value="30d">30 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Novos Usuários"
          value={novosUsuarios}
          description={`Últimos ${periodo === "7d" ? "7" : "30"} dias`}
          icon={UserPlus}
        />
        <StatsCard
          title="Usuários Ativos"
          value={usuariosAtivos}
          description={`Últimos ${periodo === "7d" ? "7" : "30"} dias`}
          icon={UserCheck}
        />
        <StatsCard
          title="Total de Usuários"
          value={data.crescimento.totalUsuarios}
          description={`${data.crescimento.usuariosAtivos} contas ativas`}
          icon={Users}
        />
        <StatsCard
          title="Taxa de Retenção"
          value={`${data.crescimento.totalUsuarios > 0 ? Math.round((usuariosAtivos / data.crescimento.totalUsuarios) * 100) : 0}%`}
          description="Ativos / Total"
          icon={TrendingUp}
        />
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="dia" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="novos" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Novos"
                />
                <Line 
                  type="monotone" 
                  dataKey="ativos" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Ativos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Visitantes */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Visitantes</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total de Visitantes"
            value={data.visitantes.total}
            description="Cadastros via aba Visitantes"
            icon={UserPlus}
            onClick={() => navigate("/admin/visitantes")}
          />
          <StatsCard
            title="Novos Visitantes"
            value={novosVisitantes}
            description={`Últimos ${periodo === "7d" ? "7" : "30"} dias`}
            icon={UserPlus}
          />
          <StatsCard
            title="Conversões"
            value={conversoes}
            description={`${data.visitantes.taxaConversao}% taxa de conversão`}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Top Usuários */}
      {data.topUsuarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Usuários Engajados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Vídeos Assistidos</TableHead>
                  <TableHead className="text-center">Concluídos</TableHead>
                  <TableHead className="text-right">Último Acesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topUsuarios.map((usuario, index) => (
                  <TableRow key={usuario.userId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        {usuario.nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{usuario.videosAssistidos}</TableCell>
                    <TableCell className="text-center">{usuario.videosConcluidos}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {usuario.ultimoAcesso 
                        ? format(new Date(usuario.ultimoAcesso), "dd/MM/yyyy", { locale: ptBR })
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
