import { useUsers } from "@/hooks/admin/useUsers";
import { useTrilhas, useCursos, useVideos } from "@/hooks/admin/useContent";
import { useAvisos } from "@/hooks/admin/useAvisos";
import { StatsCard } from "@/components/admin/StatsCard";
import { Users, GraduationCap, Video, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: trilhas, isLoading: loadingTrilhas } = useTrilhas();
  const { data: cursos, isLoading: loadingCursos } = useCursos();
  const { data: videos, isLoading: loadingVideos } = useVideos();
  const { data: avisos, isLoading: loadingAvisos } = useAvisos();

  const isLoading = loadingUsers || loadingTrilhas || loadingCursos || loadingVideos || loadingAvisos;

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Trilhas"
          value={trilhas?.length || 0}
          description={`${trilhas?.filter((t) => t.ativo).length || 0} ativas`}
          icon={GraduationCap}
        />
        <StatsCard
          title="Cursos"
          value={cursos?.length || 0}
          description={`${cursos?.filter((c) => c.ativo).length || 0} ativos`}
          icon={GraduationCap}
        />
        <StatsCard
          title="Vídeos"
          value={videos?.length || 0}
          description={`${videos?.filter((v) => v.ativo).length || 0} ativos`}
          icon={Video}
        />
      </div>
    </div>
  );
}
