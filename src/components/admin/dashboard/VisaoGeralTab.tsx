import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/admin/StatsCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { DistribuicaoPlanos } from "@/components/admin/DistribuicaoPlanos";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  FileText,
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
    };
    distribuicaoPlanos: {
      academy: number;
      skills: number;
      business: number;
      sem_plano: number;
    };
  };
}

export function VisaoGeralTab({ data }: VisaoGeralTabProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Alertas */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Requer Atenção</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <AlertCard
            title="Tarefas Atrasadas"
            value={data.alertas.tarefasAtrasadas}
            icon={AlertTriangle}
            severity="error"
            onClick={() => navigate("/admin/projetos/minhas-tarefas")}
          />
          <AlertCard
            title="Dúvidas Pendentes"
            value={data.alertas.duvidasPendentes}
            icon={HelpCircle}
            severity="warning"
            onClick={() => navigate("/admin/gestao/duvidas")}
          />
          <AlertCard
            title="Diagnósticos Incompletos"
            value={data.alertas.diagnosticosIncompletos}
            icon={FileText}
            severity="warning"
            onClick={() => navigate("/admin/gestao/formularios")}
          />
        </div>
      </div>

      {/* KPIs Resumidos */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Resumo Geral</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total de Usuários"
            value={data.crescimento.totalUsuarios}
            description={`${data.crescimento.usuariosAtivos} contas ativas`}
            icon={Users}
          />
          <StatsCard
            title="Usuários Ativos (7d)"
            value={data.crescimento.usuariosAtivos7d}
            description="Ativos nos últimos 7 dias"
            icon={TrendingUp}
          />
          <StatsCard
            title="Taxa de Engajamento"
            value={`${data.crescimento.totalUsuarios > 0 ? Math.round((data.crescimento.usuariosAtivos7d / data.crescimento.totalUsuarios) * 100) : 0}%`}
            description="Ativos / Total"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Distribuição de Planos */}
      <DistribuicaoPlanos distribuicao={data.distribuicaoPlanos} />
    </div>
  );
}
