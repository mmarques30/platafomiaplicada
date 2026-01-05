import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Star, Loader2, MessageSquare, Calendar, Plus, ArrowLeft, Target } from "lucide-react";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import ProjetoModal from "@/components/admin/mentoria/ProjetoModal";
import { ProjetoPreparacaoCard } from "@/components/mentoria/ProjetoPreparacaoCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatProjetoTitulo } from "@/lib/utils";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MentoriaProjetos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projetos, createProjeto, updateProjeto, isLoading, isCreating, isUpdating } = useMentoriaProjetos();
  const [selectedProjeto, setSelectedProjeto] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<any>(undefined);

  const handleCreate = (data: any) => {
    createProjeto(data);
  };

  const handleEdit = (projeto: any) => {
    setEditingProjeto(projeto);
    setModalOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (editingProjeto) {
      updateProjeto({ ...data, id: editingProjeto.id });
      setEditingProjeto(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const projetosEstrategicos = projetos.filter(p => p.tipo === "estrategico");
  const projetosOperacionais = projetos.filter(p => p.tipo === "operacional");
  const projetosAndamento = projetos.filter(p => p.status === "em_andamento");
  const projetosConcluidos = projetos.filter(p => p.status === "concluido");

  const getStatusBadge = (status: string) => {
    const variants: any = {
      planejamento: "secondary",
      em_andamento: "default",
      concluido: "outline",
      cancelado: "destructive"
    };
    const labels: any = {
      planejamento: "Planejamento",
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      cancelado: "Cancelado"
    };
    return <Badge variant={variants[status] || "default"}>{labels[status]}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "estrategico" ? (
      <Badge variant="default" className="bg-primary flex items-center gap-1.5">
        <Target className="h-3.5 w-3.5" />
        Estratégico
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1.5">
        <FolderKanban className="h-3.5 w-3.5" />
        Operacional
      </Badge>
    );
  };

  const ProjetoCard = ({ projeto }: { projeto: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
      onClick={() => setSelectedProjeto(projeto)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{formatProjetoTitulo(projeto.titulo)}</CardTitle>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {getTipoBadge(projeto.tipo)}
              {getStatusBadge(projeto.status)}
            </div>
            <CardDescription className="mt-2 line-clamp-2">
              {projeto.descricao}
            </CardDescription>
            {projeto.data_entrega && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Entrega: {format(new Date(projeto.data_entrega), "PPP", { locale: ptBR })}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm">
          {projeto.avaliacao_mentor && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Mentor: {projeto.avaliacao_mentor}/5</span>
            </div>
          )}
          {projeto.devolutiva_mentor && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Com feedback
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/mentoria")}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <PageTitle primary="Projetos" secondary="de Mentoria" />
          <p className="text-muted-foreground text-lg mt-2">
            Acompanhe seus projetos e receba feedback do mentor
          </p>
        </div>
        <Button onClick={() => { setEditingProjeto(undefined); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-4xl">
          <TabsTrigger value="estrategicos">Estratégicos ({projetosEstrategicos.length})</TabsTrigger>
          <TabsTrigger value="operacionais">Operacionais ({projetosOperacionais.length})</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento ({projetosAndamento.length})</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos ({projetosConcluidos.length})</TabsTrigger>
          <TabsTrigger value="todos">Todos ({projetos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="estrategicos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projetosEstrategicos.length > 0 ? (
              projetosEstrategicos.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum objetivo estratégico definido</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Objetivos estratégicos são metas de alto nível que orientam seu desenvolvimento
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="operacionais" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projetosOperacionais.length > 0 ? (
              projetosOperacionais.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum projeto operacional cadastrado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Projetos operacionais são entregas específicas e práticas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="andamento" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projetosAndamento.length > 0 ? (
              projetosAndamento.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum projeto em andamento</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="concluidos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projetosConcluidos.length > 0 ? (
              projetosConcluidos.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum projeto concluído ainda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projetos.length > 0 ? (
              projetos.map((projeto) => (
                <ProjetoCard key={projeto.id} projeto={projeto} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum projeto cadastrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedProjeto} onOpenChange={() => setSelectedProjeto(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{formatProjetoTitulo(selectedProjeto?.titulo)}</DialogTitle>
            <DialogDescription>
              {selectedProjeto && getStatusBadge(selectedProjeto.status)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProjeto && (
            <div className="space-y-6">
              {/* Tipo do Projeto */}
              <div className="flex items-center gap-2">
                {getTipoBadge(selectedProjeto.tipo)}
              </div>
              
              {/* Card de Preparação Recomendada */}
              {user && (
                <ProjetoPreparacaoCard 
                  projetoId={selectedProjeto.id} 
                  userId={user.id} 
                />
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground">{selectedProjeto.descricao}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Objetivo do Projeto</h3>
                <p className="text-sm">{selectedProjeto.objetivo_projeto}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contribuição para o Plano de Desenvolvimento</h3>
                <p className="text-sm">{selectedProjeto.contribuicao_plano}</p>
              </div>

              {selectedProjeto.devolutiva_mentor && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Devolutiva do Mentor
                  </h3>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <p className="whitespace-pre-wrap text-sm">{selectedProjeto.devolutiva_mentor}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedProjeto.avaliacao_mentor && (
                  <div>
                    <h3 className="font-semibold mb-2">Avaliação do Mentor</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedProjeto.avaliacao_mentor
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {selectedProjeto.comentarios_mentor && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedProjeto.comentarios_mentor}
                      </p>
                    )}
                  </div>
                )}

                {selectedProjeto.avaliacao_mentorado && (
                  <div>
                    <h3 className="font-semibold mb-2">Sua Avaliação</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedProjeto.avaliacao_mentorado
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {selectedProjeto.comentarios_mentorado && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedProjeto.comentarios_mentorado}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ProjetoModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingProjeto(undefined);
        }}
        onSubmit={editingProjeto ? handleUpdate : handleCreate}
        projeto={editingProjeto}
        isLoading={isCreating || isUpdating}
        isAdmin={false}
      />
    </div>
  );
}
