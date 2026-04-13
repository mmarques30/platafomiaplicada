import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DistribuicaoPlanos } from "@/components/admin/DistribuicaoPlanos";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  HelpCircle,
  FileText,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Bot,
  ArrowRight,
} from "lucide-react";

interface VisaoGeralTabProps {
  data: {
    alertas: {
      tarefasAtrasadas: number;
      duvidasPendentes: number;
      diagnosticosIncompletos: number;
      total: number;
    };
    crescimento: {
      totalUsuarios: number;
      usuariosAtivos: number;
      usuariosAtivos7d: number;
      novosUsuarios7d: number;
      usuariosInativos: number;
      tendenciaNovoUsuarios7d: 'up' | 'down' | 'stable';
      tendenciaAtivos7d: 'up' | 'down' | 'stable';
      variacaoNovoUsuarios7d: number;
      variacaoAtivos7d: number;
    };
    distribuicaoPlanos: {
      academy: number;
      skills: number;
      business_parceria: number;
      business_sistemas: number;
      sem_plano: number;
    };
    visitantes: {
      total: number;
      conversoes7d: number;
      taxaConversao: number;
    };
    mari: {
      usuariosUsandoMari: number;
      mensagens7d: number;
      taxaAdocao: number;
      tendenciaMensagens7d: 'up' | 'down' | 'stable';
      variacaoMensagens7d: number;
      mediaConversasPorUsuario: number;
    };
  };
}

function TrendBadge({ trend, variacao }: { trend: 'up' | 'down' | 'stable'; variacao: number }) {
  if (trend === 'stable') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="h-3 w-3" /> +{variacao}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
      <TrendingDown className="h-3 w-3" /> {variacao}%
    </span>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variacao,
  onClick,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  variacao?: number;
  onClick?: () => void;
}) {
  return (
    <Card
      className={onClick ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}
      onClick={onClick}
    >
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {trend !== undefined && variacao !== undefined && (
                <TrendBadge trend={trend} variacao={variacao} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/60">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VisaoGeralTab({ data }: VisaoGeralTabProps) {
  const navigate = useNavigate();

  const taxaEngajamento = data.crescimento.totalUsuarios > 0
    ? Math.round((data.crescimento.usuariosAtivos7d / data.crescimento.totalUsuarios) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Alertas Consolidados */}
      {data.alertas.total > 0 && (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Requer atenção:</span>
              {data.alertas.tarefasAtrasadas > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-red-300 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30"
                  onClick={() => navigate("/admin/minhas-tarefas")}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {data.alertas.tarefasAtrasadas} tarefa{data.alertas.tarefasAtrasadas > 1 ? 's' : ''} atrasada{data.alertas.tarefasAtrasadas > 1 ? 's' : ''}
                </Badge>
              )}
              {data.alertas.duvidasPendentes > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-yellow-300 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/30"
                  onClick={() => navigate("/admin/mentoria")}
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {data.alertas.duvidasPendentes} duvida{data.alertas.duvidasPendentes > 1 ? 's' : ''} pendente{data.alertas.duvidasPendentes > 1 ? 's' : ''}
                </Badge>
              )}
              {data.alertas.diagnosticosIncompletos > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-yellow-300 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/30"
                  onClick={() => navigate("/admin/mentoria")}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {data.alertas.diagnosticosIncompletos} diagnostico{data.alertas.diagnosticosIncompletos > 1 ? 's' : ''} incompleto{data.alertas.diagnosticosIncompletos > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Principais */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Usuarios</h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <KpiCard
            title="Total Usuarios"
            value={data.crescimento.totalUsuarios}
            description={`${data.crescimento.usuariosAtivos} contas ativas`}
            icon={Users}
          />
          <KpiCard
            title="Novos (7d)"
            value={data.crescimento.novosUsuarios7d}
            description="vs semana anterior"
            icon={UserPlus}
            trend={data.crescimento.tendenciaNovoUsuarios7d}
            variacao={data.crescimento.variacaoNovoUsuarios7d}
          />
          <KpiCard
            title="Ativos (7d)"
            value={data.crescimento.usuariosAtivos7d}
            description="vs semana anterior"
            icon={UserCheck}
            trend={data.crescimento.tendenciaAtivos7d}
            variacao={data.crescimento.variacaoAtivos7d}
          />
          <KpiCard
            title="Engajamento"
            value={`${taxaEngajamento}%`}
            description="Ativos / Total"
            icon={TrendingUp}
          />
          <KpiCard
            title="Inativos (30d+)"
            value={data.crescimento.usuariosInativos}
            description="Sem acesso ha 30+ dias"
            icon={UserX}
          />
        </div>
      </div>

      {/* Funil + Distribuição */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Funil de Conversão */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Funil de Conversao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelStep
              label="Visitantes"
              value={data.visitantes.total}
              percent={100}
              color="bg-blue-500"
            />
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <FunnelStep
              label="Convertidos (30d)"
              value={data.visitantes.conversoes7d}
              percent={data.visitantes.total > 0 ? Math.round((data.visitantes.conversoes7d / data.visitantes.total) * 100) : 0}
              color="bg-emerald-500"
            />
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>
            <FunnelStep
              label="Ativos (7d)"
              value={data.crescimento.usuariosAtivos7d}
              percent={data.crescimento.totalUsuarios > 0 ? Math.round((data.crescimento.usuariosAtivos7d / data.crescimento.totalUsuarios) * 100) : 0}
              color="bg-primary"
            />
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxa de conversao</span>
                <span className="font-bold">{data.visitantes.taxaConversao}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Planos */}
        <DistribuicaoPlanos distribuicao={data.distribuicaoPlanos} />
      </div>

      {/* Mari - IA */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mari - Mentora IA</h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Usuarios da Mari"
            value={data.mari.usuariosUsandoMari}
            description={`${data.mari.taxaAdocao}% de adocao`}
            icon={Bot}
          />
          <KpiCard
            title="Mensagens (7d)"
            value={data.mari.mensagens7d}
            description="vs semana anterior"
            icon={MessageSquare}
            trend={data.mari.tendenciaMensagens7d}
            variacao={data.mari.variacaoMensagens7d}
          />
          <KpiCard
            title="Usuarios ativos (7d)"
            value={data.mari.usuariosMari7d}
            description="Usaram a Mari esta semana"
            icon={Users}
          />
          <KpiCard
            title="Media/Usuario"
            value={data.mari.mediaConversasPorUsuario}
            description="Perguntas por usuario"
            icon={MessageSquare}
          />
        </div>
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">{percent}%</p>
    </div>
  );
}
