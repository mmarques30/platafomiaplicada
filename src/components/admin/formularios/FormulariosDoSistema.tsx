import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, BarChart3, FileText, GraduationCap, Briefcase, Users, Crown, ClipboardList, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DiagnosticoPreviewModal } from "./DiagnosticoPreviewModal";
import { DiagnosticoEstatisticasDrawer } from "./DiagnosticoEstatisticasDrawer";
import { RespostasDiagnosticoDrawer } from "./RespostasDiagnosticoDrawer";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DiagnosticoTipo = 'academy' | 'business' | 'legacy';

// Mapeamento de ícones por nome
const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Briefcase,
  Users,
  FileText,
  Crown,
  ClipboardList,
};

interface FormularioSistema {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  tipo: string;
  etapas: number;
  icon: string | null;
  rota_form: string | null;
  rota_admin: string | null;
  ativo: boolean;
}

export function FormulariosDoSistema() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [estatisticasOpen, setEstatisticasOpen] = useState(false);
  const [respostasOpen, setRespostasOpen] = useState(false);
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<DiagnosticoTipo | null>(null);

  // Buscar formulários do sistema (todos, incluindo inativos)
  const { data: formularios, isLoading } = useQuery({
    queryKey: ['formularios-sistema'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formularios_sistema')
        .select('*')
        .order('categoria', { ascending: true });
      
      if (error) throw error;
      return data as FormularioSistema[];
    }
  });

  // Mutation para toggle ativo/inativo
  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('formularios_sistema')
        .update({ ativo })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formularios-sistema'] });
      toast.success("Status atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  // Buscar estatísticas de cada tipo - separado por plano para diagnósticos
  const { data: estatisticas } = useQuery({
    queryKey: ['formularios-sistema-estatisticas'],
    queryFn: async () => {
      // Diagnósticos com user_id para separar por plano
      const { data: diagnosticos } = await supabase
        .from('formulario_diagnostico')
        .select('id, completado, user_id');
      
      // Buscar planos dos usuários
      const userIds = diagnosticos?.map(d => d.user_id).filter(Boolean) || [];
      let profiles: { id: string; plano_mentoria: string | null }[] = [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, plano_mentoria')
          .in('id', userIds);
        profiles = profilesData || [];
      }

      // Separar diagnósticos por tipo de plano
      const diagnosticosAcademy = diagnosticos?.filter(d => {
        const plano = profiles.find(p => p.id === d.user_id)?.plano_mentoria;
        return plano === 'academy' || plano === 'skills';
      }) || [];

      const diagnosticosBusiness = diagnosticos?.filter(d => {
        const plano = profiles.find(p => p.id === d.user_id)?.plano_mentoria;
        return plano === 'business';
      }) || [];

      const diagnosticosLegacy = diagnosticos?.filter(d => {
        const plano = profiles.find(p => p.id === d.user_id)?.plano_mentoria;
        return !plano || !['academy', 'business', 'skills'].includes(plano);
      }) || [];
      
      // Candidaturas
      const { data: candidaturas } = await supabase
        .from('candidaturas_mentoria')
        .select('id, status');

      // Pesquisas (respostas_pesquisas)
      const { data: pesquisasRespostas } = await supabase
        .from('respostas_pesquisas')
        .select('id, completado');

      const totalCandidaturas = candidaturas?.length || 0;
      const completadasCandidaturas = candidaturas?.filter(c => c.status !== 'rascunho').length || 0;

      const totalPesquisas = pesquisasRespostas?.length || 0;
      const completadasPesquisas = pesquisasRespostas?.filter(p => p.completado).length || 0;

      return {
        'diagnostico-academy': { 
          total: diagnosticosAcademy.length, 
          completados: diagnosticosAcademy.filter(d => d.completado).length 
        },
        'diagnostico-business': { 
          total: diagnosticosBusiness.length, 
          completados: diagnosticosBusiness.filter(d => d.completado).length 
        },
        'diagnostico-legacy': { 
          total: diagnosticosLegacy.length, 
          completados: diagnosticosLegacy.filter(d => d.completado).length 
        },
        'candidatura': { total: totalCandidaturas, completados: completadasCandidaturas },
        'pesquisa': { total: totalPesquisas, completados: completadasPesquisas },
      };
    }
  });

  // Agrupar por categoria
  const formulariosAgrupados = formularios?.reduce((acc, form) => {
    if (!acc[form.categoria]) {
      acc[form.categoria] = [];
    }
    acc[form.categoria].push(form);
    return acc;
  }, {} as Record<string, FormularioSistema[]>) || {};

  const categoriaLabels: Record<string, string> = {
    'diagnostico': 'Diagnósticos',
    'pesquisa': 'Pesquisas',
    'candidatura': 'Candidaturas',
  };

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

  const handleNavegar = (rota: string | null) => {
    if (rota) {
      navigate(rota);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Formulários do Sistema</h3>
        <Badge variant="secondary" className="ml-2">
          {formularios?.length || 0} formulários
        </Badge>
      </div>

      {Object.entries(formulariosAgrupados).map(([categoria, forms]) => (
        <div key={categoria} className="space-y-4">
          <h4 className="text-md font-medium text-muted-foreground">
            {categoriaLabels[categoria] || categoria}
          </h4>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => {
              const Icon = form.icon ? iconMap[form.icon] || FileText : FileText;
              const isDiagnostico = form.categoria === 'diagnostico';
              // Para diagnósticos, usar tipo específico; para outros, usar categoria
              const stats = isDiagnostico 
                ? estatisticas?.[`diagnostico-${form.tipo}`]
                : estatisticas?.[form.categoria];

              return (
                <Card 
                  key={form.id} 
                  className={cn(
                    "border border-primary/20 hover:border-primary/40 transition-colors",
                    !form.ativo && "opacity-60"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {!form.ativo && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {form.etapas} etapas
                        </Badge>
                        <Switch
                          checked={form.ativo}
                          onCheckedChange={(ativo) => toggleAtivo.mutate({ id: form.id, ativo })}
                        />
                      </div>
                    </div>
                    <CardTitle className="text-base mt-3">{form.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.descricao || "Sem descrição"}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{stats?.total || 0} respostas</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stats?.completados || 0} completos
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {isDiagnostico ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleVerRespostas(form.tipo as DiagnosticoTipo)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Respostas
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerPerguntas(form.tipo as DiagnosticoTipo)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerEstatisticas(form.tipo as DiagnosticoTipo)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleNavegar(form.rota_admin)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Respostas
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleNavegar(form.rota_form)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modais para diagnósticos */}
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
