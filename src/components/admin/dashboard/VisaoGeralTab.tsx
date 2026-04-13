import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/admin/StatsCard";
import { DistribuicaoPlanos } from "@/components/admin/DistribuicaoPlanos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  FileText,
  UserX,
  Bot,
  MessageSquare,
  Percent,
  BarChart3,
} from "lucide-react";

interface VisaoGeralTabProps {
  data: {
    alertas: {
      tarefasAtrasadas: number;
      duvidasPendentes: number;
      diagnosticosIncompletos: number;
    };
    crescimento: {
      totalUsuarios: number;
      usuariosAtivos: number;
      usuariosAtivos7d: number;
      usuariosAtivos30d: number;
      usuariosInativos: number;
      novosUsuarios7d: number;
      novosUsuarios30d: number;
    };
    tendencias: {
      novosUsuarios: { direction: 'up' | 'down' | 'stable'; value: number };
      usuariosAtivos: { direction: 'up' | 'down' | 'stable'; value: number };
    };
    visitantes: {
      total: number;
      conversoes30d: number;
    };
    distribuicaoPlanos: {
      academy: number;
      skills: number;
      business_parceria: number;
      business_sistemas: number;
      sem_plano: number;
    };
    mari: {
      totalUsuarios: number;
      mensagens7d: number;
      taxaAdocao: number;
      mediaMensagensPorUsuario: number;
    };
  };
}

export function VisaoGeralTab({ data }: VisaoGeralTabProps) {
  const navigate = useNavigate();

  // Funil
  const funilVisitantes = data.visitantes.total;
  const funilConvertidos = data.visitantes.conversoes30d;
  const funilAtivos = data.crescimento.usuariosAtivos7d;
  const maxFunil = Math.max(funilVisitantes, funilConvertidos, funilAtivos, 1);

  return (
    <div className="space-y-6">
      {/* Banner de Alertas Compacto */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-1">Requer atenção:</span>
            <Badge
              variant="destructive"
              className="cursor-pointer gap-1"
              onClick={() => navigate("/admin/minhas-tarefas")}
            >
              <AlertTriangle className="h-3 w-3" />
              {data.alertas.tarefasAtrasadas} Tarefas Atrasadas
            </Badge>
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
              onClick={() => navigate("/admin/mentoria")}
            >
              <HelpCircle className="h-3 w-3" />
              {data.alertas.duvidasPendentes} Dúvidas
            </Badge>
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
              onClick={() => navigate("/admin/mentoria")}
            >
              <FileText className="h-3 w-3" />
              {data.alertas.diagnosticosIncompletos} Diagnósticos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPIs com Tendências */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Resumo Geral</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Usuários"
            value={data.crescimento.totalUsuarios}
            description={`${data.crescimento.usuariosAtivos} contas ativas`}
            icon={Users}
          />
          <StatsCard
            title="Novos (7d)"
            value={data.crescimento.novosUsuarios7d}
            description="vs. 7 dias anteriores"
            icon={TrendingUp}
            trend={data.tendencias.novosUsuarios}
          />
          <StatsCard
            title="Usuários Ativos (7d)"
            value={data.crescimento.usuariosAtivos7d}
            description="Ativos nos últimos 7 dias"
            icon={TrendingUp}
            trend={data.tendencias.usuariosAtivos}
          />
          <StatsCard
            title="Usuários Inativos"
            value={data.crescimento.usuariosInativos}
            description="Sem acesso há 30+ dias"
            icon={UserX}
          />
        </div>
      </div>

      {/* Funil Visual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Funil de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Visitantes", value: funilVisitantes, color: "bg-blue-500" },
            { label: "Convertidos (30d)", value: funilConvertidos, color: "bg-amber-500" },
            { label: "Ativos (7d)", value: funilAtivos, color: "bg-green-500" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.value} ({maxFunil > 0 ? Math.round((item.value / maxFunil) * 100) : 0}%)
                </span>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all`}
                  style={{ width: `${maxFunil > 0 ? (item.value / maxFunil) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Distribuição de Planos */}
      <DistribuicaoPlanos distribuicao={data.distribuicaoPlanos} />

      {/* Mari - Mentora IA */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Mari - Mentora IA</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Usuários da Mari"
            value={data.mari.totalUsuarios}
            description="Últimos 60 dias"
            icon={Bot}
          />
          <StatsCard
            title="Mensagens (7d)"
            value={data.mari.mensagens7d}
            description="Últimos 7 dias"
            icon={MessageSquare}
          />
          <StatsCard
            title="Taxa de Adoção"
            value={`${data.mari.taxaAdocao}%`}
            description="Usuários da Mari / Total"
            icon={Percent}
          />
          <StatsCard
            title="Média por Usuário"
            value={data.mari.mediaMensagensPorUsuario}
            description="Mensagens por usuário"
            icon={MessageSquare}
          />
        </div>
      </div>
    </div>
  );
}
