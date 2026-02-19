import { useMemo } from "react";
import { useVisitantes } from "@/hooks/useVisitantes";
import { useContentAccessMetrics } from "@/hooks/admin/useContentAccessMetrics";
import { useAcademyPurchaseClicks } from "@/hooks/admin/useButtonClickLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VisitantesTab } from "@/components/admin/visitantes/VisitantesTab";
import { CuponsTab } from "@/components/admin/visitantes/CuponsTab";
import { Users, Tag, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarVisitantes() {
  const { visitantes } = useVisitantes();
  const { data: metrics } = useContentAccessMetrics();
  const { data: academyClicks } = useAcademyPurchaseClicks();

  // Função auxiliar para download de CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função auxiliar para formatar célula CSV
  const formatCSVCell = (cell: string | number) => {
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

  // Export Relatório Completo
  const exportFullReportCSV = () => {
    let fullContent = '';
    
    // Seção 1: Top Conteúdos
    if (metrics?.topContent?.length) {
      fullContent += '=== TOP CONTEÚDOS MAIS ACESSADOS ===\n';
      fullContent += 'Posição,Conteúdo,Tipo,Total de Acessos\n';
      metrics.topContent.forEach((content, index) => {
        fullContent += [index + 1, formatCSVCell(content.title), content.type === 'video' ? 'Vídeo' : 'Material', content.count].join(',') + '\n';
      });
      fullContent += '\n';
    }

    // Seção 2: Engajamento
    if (metrics?.allVisitors?.length) {
      fullContent += '=== VISITANTES POR ENGAJAMENTO ===\n';
      fullContent += 'Posição,Email,Vídeos,Materiais,Total Acessos,Último Acesso\n';
      metrics.allVisitors.forEach((visitor, index) => {
        fullContent += [index + 1, formatCSVCell(visitor.email), visitor.videoCount, visitor.materialCount, visitor.totalAccesses, format(new Date(visitor.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })].join(',') + '\n';
      });
      fullContent += '\n';
    }

    // Seção 3: Academy Clicks
    if (academyClicks?.length) {
      fullContent += '=== CLIQUES BOTÃO ACADEMY ===\n';
      fullContent += 'Email,Página,Data/Hora do Clique,Status\n';
      academyClicks.forEach(click => {
        const visitante = visitantes.find(v => v.email === click.user_email);
        const converteu = visitante && !visitante.is_visitante;
        const status = converteu ? 'Converteu' : visitante ? 'Visitante' : 'Não cadastrado';
        fullContent += [formatCSVCell(click.user_email), click.page_origin, format(new Date(click.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR }), status].join(',') + '\n';
      });
      fullContent += '\n';
    }

    // Seção 4: Lista de Visitantes
    if (visitantes?.length) {
      fullContent += '=== LISTA DE VISITANTES ===\n';
      fullContent += 'Nome,Email,Telefone,Data Cadastro,Status,Cupom,Vídeos,Materiais,Total Acessos\n';
      const accessStatsMap = new Map(metrics?.allVisitors?.map(v => [v.email, v]) || []);
      visitantes.forEach(visitante => {
        const accessStats = accessStatsMap.get(visitante.email || '');
        fullContent += [
          formatCSVCell(visitante.nome_completo || ''),
          formatCSVCell(visitante.email || ''),
          visitante.telefone || '',
          visitante.created_at ? format(new Date(visitante.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '',
          visitante.conta_ativa ? 'Ativo' : 'Inativo',
          visitante.cupom_especial || 'Academy12',
          accessStats?.videoCount || 0,
          accessStats?.materialCount || 0,
          accessStats?.totalAccesses || 0
        ].join(',') + '\n';
      });
    }

    downloadCSV(fullContent, `relatorio_completo_visitantes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Visitantes</h1>
          <p className="text-muted-foreground">
            Gerencie contas de visitantes, cupons e converta para mentorados
          </p>
        </div>
        <Button onClick={exportFullReportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório Completo
        </Button>
      </div>

      <Tabs defaultValue="visitantes" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-1">
          <TabsTrigger value="visitantes" className="gap-2">
            <Users className="h-4 w-4" />
            Visitantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visitantes">
          <VisitantesTab onExportFullReport={exportFullReportCSV} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
