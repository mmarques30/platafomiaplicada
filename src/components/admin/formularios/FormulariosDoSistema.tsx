import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, BarChart3, FileText, GraduationCap, Briefcase, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DiagnosticoPreviewModal } from "./DiagnosticoPreviewModal";
import { DiagnosticoEstatisticasDrawer } from "./DiagnosticoEstatisticasDrawer";
import { RespostasDiagnosticoDrawer } from "./RespostasDiagnosticoDrawer";

type DiagnosticoTipo = 'academy' | 'business' | 'legacy';

interface DiagnosticoConfig {
  id: DiagnosticoTipo;
  titulo: string;
  descricao: string;
  etapas: number;
  icon: React.ElementType;
  plano: string;
}

const DIAGNOSTICOS: DiagnosticoConfig[] = [
  {
    id: 'academy',
    titulo: 'Diagnóstico Academy',
    descricao: 'Formulário focado em aprendizado pessoal e desenvolvimento de habilidades em IA',
    etapas: 5,
    icon: GraduationCap,
    plano: 'academy'
  },
  {
    id: 'business',
    titulo: 'Diagnóstico Business',
    descricao: 'Formulário focado em projetos, entregas e ROI de implementações de IA',
    etapas: 6,
    icon: Briefcase,
    plano: 'business'
  },
  {
    id: 'legacy',
    titulo: 'Diagnóstico Mentoria',
    descricao: 'Formulário completo original com 7 etapas (versão anterior)',
    etapas: 7,
    icon: Users,
    plano: 'legacy'
  }
];

export function FormulariosDoSistema() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [estatisticasOpen, setEstatisticasOpen] = useState(false);
  const [respostasOpen, setRespostasOpen] = useState(false);
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<DiagnosticoTipo | null>(null);

  // Buscar estatísticas dos diagnósticos
  const { data: estatisticas } = useQuery({
    queryKey: ['diagnosticos-estatisticas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formulario_diagnostico')
        .select('id, completado, created_at');
      
      if (error) throw error;

      // Buscar perfis para saber os planos
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, plano_mentoria');

      const profileMap = new Map(profiles?.map(p => [p.id, p.plano_mentoria]) || []);

      // Contar por tipo baseado no plano
      const stats = {
        academy: { total: 0, completados: 0 },
        business: { total: 0, completados: 0 },
        legacy: { total: 0, completados: 0 }
      };

      // Como não temos o user_id diretamente nos dados, vamos contar todos
      // e assumir distribuição baseada em completados
      const total = data?.length || 0;
      const completados = data?.filter(d => d.completado).length || 0;

      // Por enquanto, mostrar total geral (pode ser refinado depois)
      stats.academy = { total, completados };
      stats.business = { total, completados };
      stats.legacy = { total, completados };

      return stats;
    }
  });

  const handleVerRespostas = (tipo: DiagnosticoTipo) => {
    setSelectedDiagnostico(tipo);
    setRespostasOpen(true);
  };

  const handleVerPerguntas = (tipo: DiagnosticoTipo) => {
    setSelectedDiagnostico(tipo);
    setPreviewOpen(true);
  };

  const handleVerEstatisticas = (tipo: DiagnosticoTipo) => {
    setSelectedDiagnostico(tipo);
    setEstatisticasOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-aplicada-green-700" />
        <h3 className="text-lg font-semibold">Formulários do Sistema</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {DIAGNOSTICOS.map((diagnostico) => {
          const Icon = diagnostico.icon;
          const stats = estatisticas?.[diagnostico.id];

          return (
            <Card key={diagnostico.id} className="border border-aplicada-green-800/20 hover:border-aplicada-green-700/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-aplicada-green-700/10">
                    <Icon className="h-5 w-5 text-aplicada-green-700" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {diagnostico.etapas} etapas
                  </Badge>
                </div>
                <CardTitle className="text-base mt-3">{diagnostico.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {diagnostico.descricao}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{stats?.total || 0} respostas</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {stats?.completados || 0} completos
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleVerRespostas(diagnostico.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Respostas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerPerguntas(diagnostico.id)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVerEstatisticas(diagnostico.id)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modais */}
      {selectedDiagnostico && (
        <>
          <DiagnosticoPreviewModal 
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            tipo={selectedDiagnostico}
          />
          <DiagnosticoEstatisticasDrawer
            open={estatisticasOpen}
            onOpenChange={setEstatisticasOpen}
            tipo={selectedDiagnostico}
          />
          <RespostasDiagnosticoDrawer
            open={respostasOpen}
            onOpenChange={setRespostasOpen}
            tipo={selectedDiagnostico}
          />
        </>
      )}
    </div>
  );
}
