import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  UserPlus,
  UserCheck,
  FolderKanban,
  CheckSquare,
  Calendar,
  Target,
} from "lucide-react";
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
    mentoria: {
      projetosEmAndamento: number;
      tarefasPorStatus: {
        pendente: number;
        em_andamento: number;
        concluida: number;
      };
      sessoesAgendadas: number;
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

  const totalTarefas =
    data.mentoria.tarefasPorStatus.pendente +
    data.mentoria.tarefasPorStatus.em_andamento +
    data.mentoria.tarefasPorStatus.concluida;

  const taxaConclusao = totalTarefas > 0
    ? Math.round((data.mentoria.tarefasPorStatus.concluida / totalTarefas) * 100)
    : 0;

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
          title="Novos Usuarios"
          value={novosUsuarios}
          description={`Ultimos ${periodo === "7d" ? "7" : "30"} dias`}
          icon={UserPlus}
        />
        <StatsCard
          title="Usuarios Ativos"
          value={usuariosAtivos}
          description={`Ultimos ${periodo === "7d" ? "7" : "30"} dias`}
          icon={UserCheck}
        />
        <StatsCard
          title="Total de Usuarios"
          value={data.crescimento.totalUsuarios}
          description={`${data.crescimento.usuariosAtivos} contas ativas`}
          icon={Users}
        />
        <StatsCard
          title="Taxa de Retencao"
          value={`${data.crescimento.totalUsuarios > 0 ? Math.round((usuariosAtivos / data.crescimento.totalUsuarios) * 100) : 0}%`}
          description="Ativos / Total"
          icon={TrendingUp}
        />
      </div>

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
            description={`Ultimos ${periodo === "7d" ? "7" : "30"} dias`}
            icon={UserPlus}
          />
          <StatsCard
            title="Conversoes"
            value={conversoes}
            description={`${data.visitantes.taxaConversao}% taxa de conversao`}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Mentoria */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Mentoria</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Projetos em Andamento"
            value={data.mentoria.projetosEmAndamento}
            description="Planejamento + Em andamento"
            icon={FolderKanban}
          />
          <StatsCard
            title="Tarefas Pendentes"
            value={data.mentoria.tarefasPorStatus.pendente}
            description={`${data.mentoria.tarefasPorStatus.em_andamento} em andamento`}
            icon={CheckSquare}
          />
          <StatsCard
            title="Tarefas Concluidas"
            value={data.mentoria.tarefasPorStatus.concluida}
            description="Total concluido"
            icon={CheckSquare}
          />
          <StatsCard
            title="Sessoes Agendadas"
            value={data.mentoria.sessoesAgendadas}
            description="Proximas sessoes"
            icon={Calendar}
          />
        </div>
      </div>

      {/* Taxa de Conclusão + Top Usuários */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Taxa de Conclusao de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{taxaConclusao}%</span>
              <p className="text-sm text-muted-foreground mt-1">
                {data.mentoria.tarefasPorStatus.concluida} de {totalTarefas} tarefas
              </p>
            </div>
            <Progress value={taxaConclusao} className="h-3" />
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Pendentes</span>
                </div>
                <span className="font-medium">{data.mentoria.tarefasPorStatus.pendente}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Em Andamento</span>
                </div>
                <span className="font-medium">{data.mentoria.tarefasPorStatus.em_andamento}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Concluidas</span>
                </div>
                <span className="font-medium">{data.mentoria.tarefasPorStatus.concluida}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Usuários */}
        {data.topUsuarios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Usuarios Engajados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-center">Videos</TableHead>
                    <TableHead className="text-center">Concluidos</TableHead>
                    <TableHead className="text-right">Ultimo Acesso</TableHead>
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
                          <span className="truncate max-w-[120px]">{usuario.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{usuario.videosAssistidos}</TableCell>
                      <TableCell className="text-center">{usuario.videosConcluidos}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
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
    </div>
  );
}
