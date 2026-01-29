import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle2, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

type DiagnosticoTipo = 'academy' | 'business';

interface DiagnosticoEstatisticasDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: DiagnosticoTipo;
}

const TITULOS = {
  academy: "Diagnóstico Academy",
  business: "Diagnóstico Business",
};

export function DiagnosticoEstatisticasDrawer({ 
  open, 
  onOpenChange, 
  tipo 
}: DiagnosticoEstatisticasDrawerProps) {
  const titulo = TITULOS[tipo];

  const { data: estatisticas, isLoading } = useQuery({
    queryKey: ['diagnostico-estatisticas-detalhadas', tipo],
    queryFn: async () => {
      // Buscar formulários com user_id para filtrar por plano
      const { data: formularios, error } = await supabase
        .from('formulario_diagnostico')
        .select('id, completado, created_at, updated_at, insight_gerado_em, nivel_comprometimento, nivel_ia, area_atuacao, ferramentas_ia, user_id');
      
      if (error) throw error;

      // Buscar planos dos usuários
      const userIds = formularios?.map(f => f.user_id).filter(Boolean) || [];
      let profiles: { id: string; plano_mentoria: string | null }[] = [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, plano_mentoria')
          .in('id', userIds);
        profiles = profilesData || [];
      }

      // Filtrar por tipo do plano
      const formsFiltrados = formularios?.filter(f => {
        const plano = profiles.find(p => p.id === f.user_id)?.plano_mentoria;
        
        if (tipo === 'business') {
          return plano === 'business';
        } else {
          // academy - inclui academy e skills
          return plano === 'academy' || plano === 'skills';
        }
      }) || [];

      const total = formsFiltrados.length;
      const completados = formsFiltrados.filter(f => f.completado).length;
      const comInsight = formsFiltrados.filter(f => f.insight_gerado_em).length;
      
      // Taxa de conclusão
      const taxaConclusao = total > 0 ? Math.round((completados / total) * 100) : 0;
      
      // Média de comprometimento (usando formsFiltrados)
      const comprometimentos = formsFiltrados.filter(f => f.nivel_comprometimento).map(f => f.nivel_comprometimento);
      const mediaComprometimento = comprometimentos.length > 0 
        ? (comprometimentos.reduce((a, b) => a + (b || 0), 0) / comprometimentos.length).toFixed(1)
        : 0;

      // Distribuição por nível de IA (usando formsFiltrados)
      const niveisIA: Record<string, number> = {};
      formsFiltrados.forEach(f => {
        if (f.nivel_ia) {
          niveisIA[f.nivel_ia] = (niveisIA[f.nivel_ia] || 0) + 1;
        }
      });

      // Distribuição por área de atuação (usando formsFiltrados)
      const areasAtuacao: Record<string, number> = {};
      formsFiltrados.forEach(f => {
        if (f.area_atuacao) {
          areasAtuacao[f.area_atuacao] = (areasAtuacao[f.area_atuacao] || 0) + 1;
        }
      });

      // Ferramentas mais usadas (usando formsFiltrados)
      const ferramentasCount: Record<string, number> = {};
      formsFiltrados.forEach(f => {
        const ferramentas = f.ferramentas_ia as string[] | null;
        if (ferramentas && Array.isArray(ferramentas)) {
          ferramentas.forEach(ferramenta => {
            ferramentasCount[ferramenta] = (ferramentasCount[ferramenta] || 0) + 1;
          });
        }
      });

      // Top 5 ferramentas
      const topFerramentas = Object.entries(ferramentasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Respostas nos últimos 7 dias (usando formsFiltrados)
      const hoje = new Date();
      const respostasPorDia: { dia: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const dia = subDays(hoje, i);
        const count = formsFiltrados.filter(f => {
          const created = new Date(f.created_at);
          return created >= startOfDay(dia) && created <= endOfDay(dia);
        }).length;
        respostasPorDia.push({
          dia: format(dia, 'dd/MM', { locale: ptBR }),
          count
        });
      }

      return {
        total,
        completados,
        comInsight,
        taxaConclusao,
        mediaComprometimento,
        niveisIA,
        areasAtuacao: Object.entries(areasAtuacao).sort((a, b) => b[1] - a[1]).slice(0, 5),
        topFerramentas,
        respostasPorDia
      };
    },
    enabled: open
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-aplicada-green-700" />
            Estatísticas: {titulo}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aplicada-green-700" />
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Cards de métricas principais */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Total de Respostas</span>
                  </div>
                  <p className="text-2xl font-bold">{estatisticas?.total || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs">Taxa de Conclusão</span>
                  </div>
                  <p className="text-2xl font-bold">{estatisticas?.taxaConclusao || 0}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Média Comprometimento</span>
                  </div>
                  <p className="text-2xl font-bold">{estatisticas?.mediaComprometimento || 0}/10</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Com Insight IA</span>
                  </div>
                  <p className="text-2xl font-bold">{estatisticas?.comInsight || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Respostas por dia */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Respostas (Últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-24 gap-1">
                  {estatisticas?.respostasPorDia.map((dia, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-aplicada-green-700/80 rounded-t"
                        style={{ 
                          height: `${Math.max((dia.count / Math.max(...estatisticas.respostasPorDia.map(d => d.count || 1))) * 60, 4)}px` 
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{dia.dia}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Ferramentas */}
            {estatisticas?.topFerramentas && estatisticas.topFerramentas.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Ferramentas Mais Usadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {estatisticas.topFerramentas.map(([ferramenta, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{ferramenta}</span>
                      <span className="text-sm font-medium text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Áreas de Atuação */}
            {estatisticas?.areasAtuacao && estatisticas.areasAtuacao.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Áreas de Atuação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {estatisticas.areasAtuacao.map(([area, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{area.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Distribuição por Nível de IA */}
            {estatisticas?.niveisIA && Object.keys(estatisticas.niveisIA).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Nível de Conhecimento em IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(estatisticas.niveisIA).map(([nivel, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{nivel.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
