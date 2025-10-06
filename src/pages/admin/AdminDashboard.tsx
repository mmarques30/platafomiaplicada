import { useUsers } from "@/hooks/admin/useUsers";
import { useAvisos } from "@/hooks/admin/useAvisos";
import { useVideoAnalytics } from "@/hooks/useVideoAnalytics";
import { StatsCard } from "@/components/admin/StatsCard";
import { Users, GraduationCap, Bell, Clock, TrendingUp, Video, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: avisos, isLoading: loadingAvisos } = useAvisos();
  const { data: analytics, isLoading: loadingAnalytics } = useVideoAnalytics();

  const isLoading = loadingUsers || loadingAvisos || loadingAnalytics;

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalMentorados = users?.filter((u) => u.roles.includes("mentorado")).length || 0;
  const totalAlunosTrilha = users?.filter((u) => u.roles.includes("aluno_trilha")).length || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
      
      {/* KPIs de Usuários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total de Usuários"
          value={users?.length || 0}
          description="Usuários cadastrados"
          icon={Users}
        />
        <StatsCard
          title="Mentorados"
          value={totalMentorados}
          description="Com acesso à mentoria"
          icon={Users}
        />
        <StatsCard
          title="Alunos Trilha"
          value={totalAlunosTrilha}
          description="Cursando trilhas"
          icon={GraduationCap}
        />
        <StatsCard
          title="Avisos Ativos"
          value={avisos?.filter((a) => a.ativo).length || 0}
          description="Avisos publicados"
          icon={Bell}
        />
      </div>

      {/* KPIs de Analytics de Conteúdo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total de Horas Assistidas"
          value={`${analytics?.totalHoras || 0}h`}
          description="Tempo total de vídeos"
          icon={Clock}
        />
        <StatsCard
          title="Taxa de Conclusão"
          value={`${analytics?.taxaConclusao || 0}%`}
          description="Vídeos completados"
          icon={TrendingUp}
        />
        <StatsCard
          title="Vídeo Mais Assistido"
          value={(analytics?.videoMaisAssistido as any)?.visualizacoes || 0}
          description={(analytics?.videoMaisAssistido as any)?.titulo?.substring(0, 30) || "Nenhum"}
          icon={Video}
        />
        <StatsCard
          title="Trilha Mais Popular"
          value={`${(analytics?.trilhaMaisPopular as any)?.alunos || 0} alunos`}
          description={(analytics?.trilhaMaisPopular as any)?.nome || "Nenhuma"}
          icon={Award}
        />
      </div>
    </div>
  );
}
