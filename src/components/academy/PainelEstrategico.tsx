import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, ListTodo, Map, MessageCircle, Plus, CheckCircle2, Circle, Clock, Trash2, Pencil, ArrowRight } from "lucide-react";
import { useMetasAcademy, type MetaAcademy } from "@/hooks/useMetasAcademy";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { AlertasInteligentes } from "./AlertasInteligentes";
import { MetaModal } from "./MetaModal";
import { AbaDuvidas } from "@/components/evolucao/AbaDuvidas";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const prioridadeColors: Record<string, string> = {
  alta: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  baixa: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  pendente: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  em_andamento: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  concluida: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
};

export function PainelEstrategico() {
  const { metas, pendentes, emAndamento, concluidas, isLoading, createMeta, updateMeta, deleteMeta, isCreating } = useMetasAcademy();
  const { formulario, isLoading: loadingForm } = useMentoriaForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaAcademy | null>(null);
  const navigate = useNavigate();

  const insightIA = formulario?.insight_ia as any;
  const hasInsight = !!insightIA;
  const objetivos = insightIA?.objetivos || insightIA?.metas || [];
  const etapas = insightIA?.etapas || insightIA?.roadmap || [];

  if (loadingForm || isLoading) {
    return <div className="text-center text-muted-foreground py-12">Carregando painel estratégico...</div>;
  }

  if (!formulario || !formulario.completado) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center space-y-4">
          <Target className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Complete seu diagnóstico</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha o formulário de diagnóstico para desbloquear seu plano estratégico personalizado
            </p>
          </div>
          <Button onClick={() => navigate("/diagnostico/formulario")}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Iniciar Diagnóstico
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSave = (data: Partial<MetaAcademy>) => {
    if (data.id) {
      updateMeta(data as any);
    } else {
      createMeta(data);
    }
  };

  const handleStatusChange = (meta: MetaAcademy, newStatus: string) => {
    updateMeta({ id: meta.id, status: newStatus });
  };

  const renderMetaCard = (meta: MetaAcademy) => (
    <Card key={meta.id} className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button onClick={() => handleStatusChange(meta, meta.status === "concluida" ? "pendente" : meta.status === "pendente" ? "em_andamento" : "concluida")} className="mt-0.5 shrink-0">
              {statusIcons[meta.status]}
            </button>
            <div className="min-w-0">
              <p className={`font-medium text-sm ${meta.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>
                {meta.titulo}
              </p>
              {meta.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{meta.descricao}</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${prioridadeColors[meta.prioridade]}`}>
                  {meta.prioridade}
                </Badge>
                <Badge variant="outline" className="text-xs">{meta.tipo}</Badge>
                {meta.prazo && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(meta.prazo).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingMeta(meta); setModalOpen(true); }}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMeta(meta.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{Array.isArray(objetivos) ? objetivos.length : 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Objetivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendentes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{emAndamento.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{concluidas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {hasInsight && <AlertasInteligentes insightIA={insightIA} metas={metas} />}

      {/* Tabs */}
      <Tabs defaultValue="tarefas" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
          <TabsTrigger value="objetivos" className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Objetivos</span>
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm">
            <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Minhas Tarefas</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm">
            <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Roadmap</span>
          </TabsTrigger>
          <TabsTrigger value="duvidas" className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dúvidas</span>
          </TabsTrigger>
        </TabsList>

        {/* Objetivos */}
        <TabsContent value="objetivos" className="mt-6">
          {Array.isArray(objetivos) && objetivos.length > 0 ? (
            <div className="space-y-3">
              {objetivos.map((obj: any, i: number) => {
                const text = typeof obj === "string" ? obj : obj.titulo || obj.descricao || obj.objetivo || JSON.stringify(obj);
                const prazoObj = typeof obj === "object" ? obj.prazo || obj.tipo : null;
                return (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{text}</p>
                        {prazoObj && <Badge variant="outline" className="mt-2 text-xs">{prazoObj}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {hasInsight ? "Nenhum objetivo identificado no diagnóstico" : "Gere seu insight IA no diagnóstico para ver objetivos aqui"}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tarefas" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">Minhas Tarefas</h3>
              <Button size="sm" onClick={() => { setEditingMeta(null); setModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
              </Button>
            </div>

            {metas.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center space-y-3">
                  <ListTodo className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa criada ainda</p>
                  <Button variant="outline" size="sm" onClick={() => { setEditingMeta(null); setModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Criar Primeira Tarefa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {/* Pendente */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Circle className="h-3 w-3" /> Pendente ({pendentes.length})
                  </h4>
                  {pendentes.map(renderMetaCard)}
                </div>
                {/* Em Andamento */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Em Andamento ({emAndamento.length})
                  </h4>
                  {emAndamento.map(renderMetaCard)}
                </div>
                {/* Concluída */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Concluída ({concluidas.length})
                  </h4>
                  {concluidas.map(renderMetaCard)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Roadmap */}
        <TabsContent value="roadmap" className="mt-6">
          {Array.isArray(etapas) && etapas.length > 0 ? (
            <div className="space-y-4">
              {etapas.map((etapa: any, i: number) => {
                const titulo = typeof etapa === "string" ? etapa : etapa.titulo || etapa.nome || etapa.etapa || `Etapa ${i + 1}`;
                const desc = typeof etapa === "object" ? etapa.descricao || etapa.acoes || null : null;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      {i < etapas.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
                    </div>
                    <Card className="flex-1 mb-2">
                      <CardContent className="p-4">
                        <p className="font-medium text-sm">{titulo}</p>
                        {desc && <p className="text-xs text-muted-foreground mt-1">{typeof desc === "string" ? desc : JSON.stringify(desc)}</p>}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {hasInsight ? "Nenhum roadmap identificado no diagnóstico" : "Gere seu insight IA para visualizar o roadmap"}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dúvidas */}
        <TabsContent value="duvidas" className="mt-6">
          <AbaDuvidas />
        </TabsContent>
      </Tabs>

      <MetaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        meta={editingMeta}
        onSave={handleSave}
        isSaving={isCreating}
      />
    </div>
  );
}
