import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { StatsCard } from "@/components/admin/StatsCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { DistribuicaoPlanos } from "@/components/admin/DistribuicaoPlanos";
import { TopUsuariosTable } from "@/components/admin/TopUsuariosTable";
import {
  Users,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  HelpCircle,
  FileText,
  FolderKanban,
  Calendar,
  Video,
  Layers,
  Sparkles,
  Star,
  UserPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminDashboard();

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>

      {/* Seção 1: Alertas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Requer Atenção</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <AlertCard
            title="Tarefas Atrasadas"
            value={data.alertas.tarefasAtrasadas}
            icon={AlertTriangle}
            severity="error"
            onClick={() => navigate("/admin/minhas-tarefas")}
          />
          <AlertCard
            title="Dúvidas Pendentes"
            value={data.alertas.duvidasPendentes}
            icon={HelpCircle}
            severity="warning"
            onClick={() => navigate("/admin/mentoria")}
          />
          <AlertCard
            title="Diagnósticos Incompletos"
            value={data.alertas.diagnosticosIncompletos}
            icon={FileText}
            severity="warning"
            onClick={() => navigate("/admin/mentoria")}
          />
        </div>
      </div>

      {/* Seção 2: Crescimento & Engajamento */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Crescimento & Engajamento</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Novos Usuários (7d)"
            value={data.crescimento.novosUsuarios7d}
            description={`${data.crescimento.novosUsuarios30d} nos últimos 30 dias`}
            icon={Users}
          />
          <StatsCard
            title="Usuários Ativos (7d)"
            value={data.crescimento.usuariosAtivos7d}
            description={`${data.crescimento.usuariosAtivos30d} nos últimos 30 dias`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Total de Usuários"
            value={data.crescimento.totalUsuarios}
            description={`${data.crescimento.usuariosAtivos} contas ativas`}
            icon={Users}
          />
          <StatsCard
            title="Taxa de Engajamento"
            value={`${data.crescimento.totalUsuarios > 0 ? Math.round((data.crescimento.usuariosAtivos7d / data.crescimento.totalUsuarios) * 100) : 0}%`}
            description="Ativos nos últimos 7 dias"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Seção 3: Visitantes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Visitantes</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Total de Visitantes"
            value={data.visitantes.total}
            description="Cadastros via aba Visitantes"
            icon={UserPlus}
            onClick={() => navigate("/admin/visitantes")}
          />
          <StatsCard
            title="Novos Visitantes (7d)"
            value={data.visitantes.novos7d}
            description={`${data.visitantes.novos30d} nos últimos 30 dias`}
            icon={UserPlus}
          />
          <StatsCard
            title="Taxa de Conversão"
            value={`${(data.crescimento.totalUsuarios + data.visitantes.total) > 0 ? Math.round((data.crescimento.totalUsuarios / (data.crescimento.totalUsuarios + data.visitantes.total)) * 100) : 0}%`}
            description="Usuários vs Total cadastrados"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Seção 4: Distribuição por Plano */}
      <DistribuicaoPlanos distribuicao={data.distribuicaoPlanos} />

      {/* Seção 5: Saúde da Mentoria */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Saúde da Mentoria</h2>
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

      {/* Seção 6: Inventário de Conteúdo */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Inventário de Conteúdo</h2>
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
            icon={Layers}
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

      {/* Seção 7: Top Usuários */}
      {data.topUsuarios.length > 0 && (
        <TopUsuariosTable usuarios={data.topUsuarios} />
      )}
    </div>
  );
}
