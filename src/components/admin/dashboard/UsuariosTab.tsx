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
    topUsuarios: TopUsuario[];
    mentoria: {
      projetosEmAndamento: number;
      tarefasPorStatus: {
        pendente: number;
        em_andamento: number;
        concluida: number;
      };
      sessoesAgendadas: number;
    };
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
            title="Tarefas Concluídas"
            value={data.mentoria.tarefasPorStatus.concluida}
            description="Total concluído"
            icon={CheckSquare}
          />
          <StatsCard
            title="Sessões Agendadas"
            value={data.mentoria.sessoesAgendadas}
            description="Próximas sessões"
            icon={Calendar}
          />
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Taxa de Conclusão de Tarefas
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Pendentes", color: "bg-yellow-500", count: data.mentoria.tarefasPorStatus.pendente },
              { label: "Em Andamento", color: "bg-blue-500", count: data.mentoria.tarefasPorStatus.em_andamento },
              { label: "Concluídas", color: "bg-green-500", count: data.mentoria.tarefasPorStatus.concluida },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({totalTarefas > 0 ? Math.round((item.count / totalTarefas) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Tarefas</span>
                <span className="font-bold">{totalTarefas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
