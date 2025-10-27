import { ConquistaCard } from "@/components/shared/ConquistaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressoGeral, useSequenciaEstudo } from "@/hooks/useEvolucao";
import { useMeusCertificados } from "@/hooks/useCertificados";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function EvolucaoConquistas() {
  const { user } = useAuth();
  const { data: progressoGeral, isLoading: loadingProgresso } = useProgressoGeral();
  const { data: sequencia, isLoading: loadingSequencia } = useSequenciaEstudo();
  const { data: certificados, isLoading: loadingCertificados } = useMeusCertificados();

  const { data: primeiraAula, isLoading: loadingPrimeiraAula } = useQuery({
    queryKey: ["primeira-aula", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("progresso_videos")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at")
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const isLoading = loadingProgresso || loadingSequencia || loadingCertificados || loadingPrimeiraAula;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Conquistas</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const conquistas = [
    {
      titulo: "Primeiro Passo",
      descricao: "Completou sua primeira aula",
      desbloqueada: !!primeiraAula,
      dataDesbloqueio: primeiraAula?.created_at,
    },
    {
      titulo: "Maratonista",
      descricao: "7 dias consecutivos estudando",
      desbloqueada: (sequencia || 0) >= 7,
      dataDesbloqueio: undefined,
      progresso: sequencia || 0,
      progressoNecessario: 7,
    },
    {
      titulo: "Dedicado",
      descricao: "14 dias consecutivos estudando",
      desbloqueada: (sequencia || 0) >= 14,
      dataDesbloqueio: undefined,
      progresso: sequencia || 0,
      progressoNecessario: 14,
    },
    {
      titulo: "Especialista",
      descricao: "Concluiu 5 trilhas completas",
      desbloqueada: (progressoGeral?.trilhasConcluidas || 0) >= 5,
      dataDesbloqueio: undefined,
      progresso: progressoGeral?.trilhasConcluidas || 0,
      progressoNecessario: 5,
    },
    {
      titulo: "Mestre IA",
      descricao: "Complete 10 trilhas completas",
      desbloqueada: (progressoGeral?.trilhasConcluidas || 0) >= 10,
      dataDesbloqueio: undefined,
      progresso: progressoGeral?.trilhasConcluidas || 0,
      progressoNecessario: 10,
    },
    {
      titulo: "Estudioso",
      descricao: "Estude 10 horas no total",
      desbloqueada: ((progressoGeral?.tempoTotal || 0) / 3600) >= 10,
      dataDesbloqueio: undefined,
      progresso: Math.floor((progressoGeral?.tempoTotal || 0) / 3600),
      progressoNecessario: 10,
    },
    {
      titulo: "Dedicação Total",
      descricao: "Estude 20 horas no total",
      desbloqueada: ((progressoGeral?.tempoTotal || 0) / 3600) >= 20,
      dataDesbloqueio: undefined,
      progresso: Math.floor((progressoGeral?.tempoTotal || 0) / 3600),
      progressoNecessario: 20,
    },
    {
      titulo: "Colecionador",
      descricao: "Obtenha 10 certificados",
      desbloqueada: (certificados?.length || 0) >= 10,
      dataDesbloqueio: undefined,
      progresso: certificados?.length || 0,
      progressoNecessario: 10,
    },
  ];

  const desbloqueadas = conquistas.filter((c) => c.desbloqueada);
  const bloqueadas = conquistas.filter((c) => !c.desbloqueada);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Conquistas</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Desbloqueadas ({desbloqueadas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {desbloqueadas.map((conquista, index) => (
              <ConquistaCard key={index} {...conquista} />
            ))}
          </div>
        </div>

        {bloqueadas.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Próximas Conquistas ({bloqueadas.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bloqueadas.map((conquista, index) => (
                <ConquistaCard key={index} {...conquista} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
