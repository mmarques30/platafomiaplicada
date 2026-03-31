import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePainelDiagnostico } from "@/hooks/usePainelDiagnostico";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { BusinessHeader } from "./BusinessHeader";
import { BusinessKPICards } from "./BusinessKPICards";
import { BusinessPerformanceCharts } from "./BusinessPerformanceCharts";
import { BusinessProjetosSection } from "./BusinessProjetosSection";
import { BusinessRoadmap } from "./BusinessRoadmap";
import { BusinessDiagnosticoResumo } from "./BusinessDiagnosticoResumo";


interface FormularioDiagnostico {
  id: string;
  user_id: string;
  nome_completo?: string;
  profissao?: string;
  area_atuacao?: string;
  tamanho_empresa?: string;
  tamanho_equipe?: number;
  ferramentas_ia?: any;
  completado?: boolean;
  created_at?: string;
  insight_ia?: any;
  plano_gerado?: boolean;
}

interface BusinessDashboardProps {
  diagnostico: FormularioDiagnostico;
  userId?: string;
}

export function BusinessDashboard({ diagnostico, userId }: BusinessDashboardProps) {
  const navigate = useNavigate();
  const { projetos, sessoes, tarefas, profile, isLoading } = usePainelDiagnostico(userId || diagnostico.user_id);
  const { 
    createTarefa, 
    updateTarefa, 
    uploadEntrega,
    isCreating, 
    isUpdating 
  } = useMentoriaTarefas(userId || diagnostico.user_id);

  // Calculate KPIs from data
  const kpiData = useMemo(() => {
    const projetosConcluidos = projetos.filter(p => p.status === 'concluido').length;
    const totalProjetos = projetos.length || 1;
    
    // Count unique tools from diagnostico
    const ferramentasSet = new Set<string>();
    if (diagnostico.ferramentas_ia) {
      const diagFerramentas = Array.isArray(diagnostico.ferramentas_ia) 
        ? diagnostico.ferramentas_ia 
        : [];
      diagFerramentas.forEach((f: string) => ferramentasSet.add(f));
    }

    return {
      roiEstimado: 15000,
      ferramentasAprendidas: ferramentasSet.size || 5,
      implementacao: Math.round((projetosConcluidos / totalProjetos) * 100),
      proficiencia: 75,
      roiTrend: 12,
      ferramentasTrend: 3,
    };
  }, [projetos, diagnostico.ferramentas_ia]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const projetosProgresso = projetos.slice(0, 5).map(p => ({
      nome: p.titulo?.slice(0, 20) + (p.titulo && p.titulo.length > 20 ? '...' : '') || 'Projeto',
      progresso: 50, // Default progress
    }));

    if (projetosProgresso.length === 0) {
      projetosProgresso.push(
        { nome: 'Automação E-mails', progresso: 75 },
        { nome: 'Chatbot Atendimento', progresso: 45 },
        { nome: 'Análise Dados', progresso: 30 },
      );
    }

    const ferramentasDistribuicao = [
      { nome: 'Automação', qtd: 4 },
      { nome: 'Análise', qtd: 3 },
      { nome: 'Criação', qtd: 2 },
      { nome: 'Integração', qtd: 2 },
    ];

    const entregasHistorico = [
      { mes: 'Jan', entregas: 2, meta: 3 },
      { mes: 'Fev', entregas: 4, meta: 3 },
      { mes: 'Mar', entregas: 3, meta: 4 },
      { mes: 'Abr', entregas: 5, meta: 4 },
      { mes: 'Mai', entregas: 4, meta: 5 },
    ];

    return { projetosProgresso, ferramentasDistribuicao, entregasHistorico };
  }, [projetos]);

  const handleCreateTarefa = (data: any) => {
    createTarefa({
      titulo: data.titulo,
      descricao: data.descricao,
      prazo_entrega: data.prazo_entrega,
      prioridade: data.prioridade,
      status: 'pendente',
      user_id: userId || diagnostico.user_id,
    });
  };

  const handleUpdateTarefa = (id: string, data: any) => {
    updateTarefa({ id, ...data });
  };

  const handleUploadEntrega = (tarefaId: string, file: File) => {
    uploadEntrega({ tarefaId, file, userId: userId || diagnostico.user_id });
  };

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/mentoria')}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Mentoria
        </Button>

        {/* Header */}
        <BusinessHeader 
          nomeCompleto={diagnostico.nome_completo || profile?.nome_completo}
          empresa={diagnostico.tamanho_empresa}
          cargo={diagnostico.profissao}
          dataDiagnostico={diagnostico.created_at}
          plano="Business Premium"
        />

        {/* Resumo do Diagnóstico */}
        <BusinessDiagnosticoResumo diagnostico={diagnostico} />

        {/* KPI Cards */}
        <BusinessKPICards data={kpiData} />

        {/* Performance Charts */}
        <BusinessPerformanceCharts 
          projetosProgresso={chartData.projetosProgresso}
          ferramentasDistribuicao={chartData.ferramentasDistribuicao}
          entregasHistorico={chartData.entregasHistorico}
        />

        {/* Roadmap - largura total, horizontal */}
        <BusinessRoadmap sessoes={sessoes} />

        {/* Projetos em Andamento - largura total, abaixo do roadmap */}
        <BusinessProjetosSection 
          projetos={projetos}
          tarefas={tarefas}
          onCreateTarefa={handleCreateTarefa}
          onUpdateTarefa={handleUpdateTarefa}
          onUploadEntrega={handleUploadEntrega}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />

      </div>
    </div>
  );
}
