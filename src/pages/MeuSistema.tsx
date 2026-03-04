import { PageTitle } from "@/components/shared/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { ProjetoOverviewCards } from "@/components/meu-sistema/ProjetoOverviewCards";
import { GanttEntregas } from "@/components/meu-sistema/GanttEntregas";
import { TimelineEtapas } from "@/components/meu-sistema/TimelineEtapas";
import { Monitor } from "lucide-react";

const MeuSistema = () => {
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: loadingContrato } = useContratosBusiness(businessUserId);
  const { data: etapas = [], isLoading: loadingEtapas } = useEtapasBusiness(contrato?.id);
  const { entregas, entregasPorEtapa, calcularProgressoEtapa, isLoading: loadingEntregas } = useEntregasBusiness(contrato?.id);

  const isLoading = loadingContrato || loadingEtapas || loadingEntregas;

  const totalEntregas = entregas.length;
  const entregasConcluidas = entregas.filter((e) => e.status === "concluida").length;

  // Determinar número da etapa atual
  const etapaAtualIndex = etapas.findIndex((e) => e.status === "em_andamento");
  const etapaAtualNumero = etapaAtualIndex !== -1
    ? etapaAtualIndex + 1
    : (() => {
        const lastConcluida = [...etapas].reverse().findIndex((e) => e.status === "concluida");
        return lastConcluida !== -1 ? etapas.length - lastConcluida : (etapas.length > 0 ? 1 : null);
      })();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="container max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6 space-y-6">
        <PageTitle primary="Meu Sistema" icon={<Monitor className="h-7 w-7 text-primary" />} />
        <p className="text-muted-foreground">
          Nenhum contrato ativo encontrado. Entre em contato com a equipe para mais informações.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6 space-y-8">
      {/* Header */}
      <div>
        <PageTitle
          primary={`Gestão ${contrato.nome_empresa || "Sistema"}`}
        />
        {contrato.nome_empresa && (
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso do seu sistema em tempo real
          </p>
        )}
      </div>

      {/* Overview Cards */}
      <ProjetoOverviewCards
        etapaAtualNumero={etapaAtualNumero}
        dataInicio={contrato.data_inicio}
        dataFim={contrato.data_fim}
        entregasConcluidas={entregasConcluidas}
        totalEntregas={entregas.length}
      />

      {/* Gantt Chart */}
      <GanttEntregas
        entregas={entregas}
        dataInicio={contrato.data_inicio}
        dataFim={contrato.data_fim}
      />

      {/* Timeline */}
      <TimelineEtapas
        etapas={etapas}
        entregasPorEtapa={entregasPorEtapa}
        calcularProgressoEtapa={calcularProgressoEtapa}
      />
    </div>
  );
};

export default MeuSistema;
