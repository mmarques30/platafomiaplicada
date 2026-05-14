import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, GraduationCap, Briefcase, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiagnosticoAcademyPanel } from "@/components/mentoria/DiagnosticoAcademyPanel";
import { BusinessDashboard } from "@/components/mentoria/business/BusinessDashboard";

// Mock data para demonstração Academy
const mockDiagnosticoAcademy = {
  id: "preview-academy-demo",
  user_id: "preview-user-academy",
  nome_completo: "Maria Silva (Demonstração)",
  completado: true,
  insight_ia: {
    ferramentas_prioritarias: [
      { nome: "ChatGPT", categoria: "Diálogo e Criação", prioridade: 1 },
      { nome: "Claude", categoria: "Pesquisa e Análise", prioridade: 2 },
      { nome: "Notion AI", categoria: "Organização", prioridade: 3 },
      { nome: "Gamma", categoria: "Apresentações", prioridade: 4 },
    ],
    roadmap: [
      { etapa: "Semana 1-2", titulo: "Fundamentos de IA", descricao: "Dominar os conceitos básicos e criar seus primeiros prompts eficientes" },
      { etapa: "Semana 3-4", titulo: "Aplicação Prática", descricao: "Usar IA no trabalho diário para tarefas reais" },
      { etapa: "Mês 2", titulo: "Especialização", descricao: "Automações avançadas e fluxos de trabalho com IA" },
      { etapa: "Mês 3", titulo: "Domínio", descricao: "Criar soluções personalizadas e treinar equipe" },
    ],
    primeiros_passos: [
      "Complete o módulo 'Fundamentos de IA' na trilha recomendada",
      "Configure suas 4 ferramentas principais (ChatGPT, Claude, Notion, Gamma)",
      "Pratique com os exercícios sugeridos da semana 1",
      "Agende 30 minutos diários para prática"
    ],
    oportunidades: [
      { titulo: "Automação de Tarefas Repetitivas", descricao: "Potencial de economizar 10h/semana automatizando relatórios e comunicações" },
      { titulo: "Criação de Conteúdo", descricao: "Acelere em 5x a produção de material usando IA como co-piloto" },
      { titulo: "Análise de Dados", descricao: "Use IA para extrair insights de planilhas e documentos rapidamente" },
    ],
    trilhas_recomendadas: [
      { titulo: "IA para Produtividade no Trabalho", slug: "ia-produtividade" },
      { titulo: "Automações com IA", slug: "automacoes-ia" },
      { titulo: "Prompts Avançados", slug: "prompts-avancados" },
    ],
    analise_perfil: "Profissional com perfil analítico, busca otimização de processos. Recomenda-se foco inicial em automações e uso de IA para análise de dados."
  },
  ferramentas_ia: ["ChatGPT", "Claude", "Notion AI"],
  insight_gerado_em: new Date().toISOString(),
};

// Mock data para demonstração Business
const mockDiagnosticoBusiness = {
  id: "preview-business-demo",
  user_id: "preview-user-business",
  nome_completo: "João Empresário (Demonstração)",
  completado: true,
  plano_mentoria: "business",
  area_atuacao: "Tecnologia",
  profissao: "Diretor de Operações",
  tamanho_empresa: "50-100 funcionários",
  tamanho_equipe: 15,
  ferramentas_ia: ["ChatGPT", "Zapier", "Make"],
  objetivo_principal: "Implementar IA em toda a empresa para aumentar produtividade",
  meta_3_meses: "Ter 3 processos automatizados com IA",
  meta_12_meses: "Equipe 100% treinada em ferramentas de IA",
  desafio_1: "Resistência da equipe a mudanças",
  desafio_2: "Falta de tempo para aprender novas ferramentas",
  desafio_3: "Escolher as ferramentas certas para cada processo",
  created_at: new Date().toISOString(),
  insight_ia: {
    ferramentas_prioritarias: [
      { nome: "ChatGPT Enterprise", categoria: "Base de IA", prioridade: 1 },
      { nome: "Zapier", categoria: "Automação", prioridade: 2 },
      { nome: "Make", categoria: "Integração", prioridade: 3 },
    ],
    roadmap: [
      { etapa: "Mês 1", titulo: "Diagnóstico e Setup", descricao: "Mapeamento de processos e configuração inicial" },
      { etapa: "Mês 2-3", titulo: "Automações Prioritárias", descricao: "Implementar 3 automações de alto impacto" },
      { etapa: "Mês 4-6", titulo: "Treinamento da Equipe", descricao: "Capacitação gradual do time" },
    ],
    analise_perfil: "Líder com visão estratégica, busca resultados mensuráveis. Foco em ROI e escalabilidade."
  },
};

// Mock vazio para demonstrar estado sem dados
const mockEmpty = {
  id: "preview-empty",
  user_id: "preview-user-empty",
  nome_completo: "Usuário Novo (Sem Diagnóstico)",
  completado: false,
  insight_ia: null,
  insight_gerado_em: null,
};

export default function PreviewPaineisPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"demo" | "user">("demo");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Buscar usuários para seleção
  const { data: usuarios } = useQuery({
    queryKey: ["usuarios-diagnostico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("user_id, nome_completo, completado, insight_gerado_em")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  // Buscar diagnóstico do usuário selecionado
  const { data: diagnosticoUsuario } = useQuery({
    queryKey: ["diagnostico-usuario", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .eq("user_id", selectedUserId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUserId && viewMode === "user",
  });

  const getDiagnosticoData = (type: "academy" | "business") => {
    if (showEmptyState) return mockEmpty;
    if (viewMode === "user" && diagnosticoUsuario) return diagnosticoUsuario;
    return type === "academy" ? mockDiagnosticoAcademy : mockDiagnosticoBusiness;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/admin/mentoria/academy")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-brand-strong/10">
          <Eye className="h-6 w-6 text-brand-strong" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Preview dos Painéis de Diagnóstico</h1>
          <p className="text-muted-foreground">Visualize como os mentorados veem seus painéis</p>
        </div>
      </div>

      {/* Controles */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Configurações de Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            {/* Modo de visualização */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Modo de Visualização</Label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "demo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("demo")}
                  className={viewMode === "demo" ? "bg-brand-strong hover:bg-brand-strong/90" : ""}
                >
                  Dados de Demonstração
                </Button>
                <Button
                  variant={viewMode === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("user")}
                  className={viewMode === "user" ? "bg-brand-strong hover:bg-brand-strong/90" : ""}
                >
                  Usuário Existente
                </Button>
              </div>
            </div>

            {/* Seletor de usuário */}
            {viewMode === "user" && (
              <div className="space-y-2 min-w-[250px]">
                <Label className="text-sm font-medium">Selecionar Usuário</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolher usuário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios?.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.nome_completo} {u.insight_gerado_em ? "✓" : "(sem insight)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Toggle estado vazio */}
            {viewMode === "demo" && (
              <div className="flex items-center gap-3">
                <Switch
                  id="empty-state"
                  checked={showEmptyState}
                  onCheckedChange={setShowEmptyState}
                />
                <Label htmlFor="empty-state" className="text-sm">
                  Mostrar estado vazio (sem insight gerado)
                </Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Preview */}
      <Tabs defaultValue="academy" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="academy" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Academy
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Business
          </TabsTrigger>
        </TabsList>

        {/* Preview Academy */}
        <TabsContent value="academy">
          <div className="relative">
            {/* Indicador de Preview */}
            <div className="absolute -top-3 left-4 z-10">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                <Eye className="h-3 w-3 mr-1" />
                MODO PREVIEW
              </Badge>
            </div>

            {/* Container com borda de preview */}
            <div className="border-2 border-dashed border-amber-500/30 rounded-xl p-4 pt-6 bg-card/50">
              <DiagnosticoAcademyPanel 
                diagnostico={getDiagnosticoData("academy")}
              />
            </div>

            {/* Aviso */}
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Você está visualizando o painel como um usuário Academy veria. 
                {viewMode === "demo" ? " Os dados mostrados são de demonstração." : " Os dados são reais do usuário selecionado."}
              </span>
            </div>
          </div>
        </TabsContent>

        {/* Preview Business */}
        <TabsContent value="business">
          <div className="relative">
            {/* Indicador de Preview */}
            <div className="absolute -top-3 left-4 z-20">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                <Eye className="h-3 w-3 mr-1" />
                MODO PREVIEW
              </Badge>
            </div>

            {/* Container com borda de preview - usa o BusinessDashboard real */}
            <div className="border-2 border-dashed border-amber-500/30 rounded-xl overflow-hidden">
              <BusinessDashboard 
                diagnostico={getDiagnosticoData("business")}
              />
            </div>

            {/* Aviso */}
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Você está visualizando o painel Business real, com cores da marca IAplicada. 
                {viewMode === "demo" ? " Os dados mostrados são de demonstração." : " Os dados são reais do usuário selecionado."}
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
