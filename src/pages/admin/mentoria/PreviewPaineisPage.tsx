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

// Mock data para demonstração Academy
const mockDiagnosticoAcademy = {
  id: "preview-academy-demo",
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
  nome_completo: "João Empresário (Demonstração)",
  completado: true,
  plano_mentoria: "business",
  area_atuacao: "Tecnologia",
  profissao: "Diretor de Operações",
  objetivo_principal: "Implementar IA em toda a empresa para aumentar produtividade",
  meta_3_meses: "Ter 3 processos automatizados com IA",
  meta_12_meses: "Equipe 100% treinada em ferramentas de IA",
  desafio_1: "Resistência da equipe a mudanças",
  desafio_2: "Falta de tempo para aprender novas ferramentas",
  desafio_3: "Escolher as ferramentas certas para cada processo",
  projetos: [
    { id: "1", nome: "Automação de Atendimento", status: "em_andamento", prioridade: 1 },
    { id: "2", nome: "IA para Análise de Vendas", status: "pendente", prioridade: 2 },
    { id: "3", nome: "Chatbot Interno", status: "pendente", prioridade: 3 },
  ],
  sessoes: [
    { id: "1", data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), tipo: "Sessão de Projeto" },
  ],
};

// Mock vazio para demonstrar estado sem dados
const mockEmpty = {
  id: "preview-empty",
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

  const getDiagnosticoData = () => {
    if (showEmptyState) return mockEmpty;
    if (viewMode === "user" && diagnosticoUsuario) return diagnosticoUsuario;
    return mockDiagnosticoAcademy;
  };

  const diagnosticoData = getDiagnosticoData();

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
        <div className="p-3 rounded-xl bg-aplicada-green-700/10">
          <Eye className="h-6 w-6 text-aplicada-green-700" />
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
                  className={viewMode === "demo" ? "bg-aplicada-green-700 hover:bg-aplicada-green-800" : ""}
                >
                  Dados de Demonstração
                </Button>
                <Button
                  variant={viewMode === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("user")}
                  className={viewMode === "user" ? "bg-aplicada-green-700 hover:bg-aplicada-green-800" : ""}
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
                diagnostico={diagnosticoData}
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
            <div className="absolute -top-3 left-4 z-10">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                <Eye className="h-3 w-3 mr-1" />
                MODO PREVIEW
              </Badge>
            </div>

            {/* Container com borda de preview */}
            <div className="border-2 border-dashed border-amber-500/30 rounded-xl p-4 pt-6 bg-card/50">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-aplicada-green-700" />
                    Painel Business - {mockDiagnosticoBusiness.nome_completo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Info do mentorado */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Área de Atuação</p>
                      <p className="font-medium">{mockDiagnosticoBusiness.area_atuacao}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Profissão</p>
                      <p className="font-medium">{mockDiagnosticoBusiness.profissao}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Meta 3 meses</p>
                      <p className="font-medium">{mockDiagnosticoBusiness.meta_3_meses}</p>
                    </div>
                  </div>

                  {/* Projetos */}
                  <div>
                    <h3 className="font-semibold mb-3">Projetos Priorizados</h3>
                    <div className="space-y-2">
                      {mockDiagnosticoBusiness.projetos.map((projeto, idx) => (
                        <div key={projeto.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-aplicada-green-700/10 text-aplicada-green-700 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{projeto.nome}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              Status: {projeto.status.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desafios */}
                  <div>
                    <h3 className="font-semibold mb-3">Principais Desafios</h3>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                        <p className="text-sm">{mockDiagnosticoBusiness.desafio_1}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                        <p className="text-sm">{mockDiagnosticoBusiness.desafio_2}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-sm">{mockDiagnosticoBusiness.desafio_3}</p>
                      </div>
                    </div>
                  </div>

                  {/* Próxima sessão */}
                  {mockDiagnosticoBusiness.sessoes.length > 0 && (
                    <div className="p-4 rounded-lg bg-aplicada-green-700/5 border border-aplicada-green-700/20">
                      <h3 className="font-semibold mb-2">Próxima Sessão</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(mockDiagnosticoBusiness.sessoes[0].data).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm font-medium mt-1">{mockDiagnosticoBusiness.sessoes[0].tipo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Aviso */}
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Você está visualizando o painel como um usuário Business veria. 
                Os dados mostrados são de demonstração.
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
