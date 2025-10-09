import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, Clock, FileText, Upload, ExternalLink, CheckCircle2, ArrowLeft } from "lucide-react";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MentoriaTarefas() {
  const navigate = useNavigate();
  const { tarefas, isLoading, updateTarefa, uploadEntrega, isUploading } = useMentoriaTarefas();
  const [entregaFile, setEntregaFile] = useState<File | null>(null);
  const [linkExterno, setLinkExterno] = useState("");
  const [selectedTarefa, setSelectedTarefa] = useState<string | null>(null);

  const handleUpload = (tarefaId: string, userId: string) => {
    if (entregaFile) {
      uploadEntrega({ file: entregaFile, tarefaId, userId });
      setEntregaFile(null);
      setSelectedTarefa(null);
    }
  };

  const handleSaveLink = (tarefaId: string) => {
    updateTarefa({ id: tarefaId, link_externo: linkExterno });
    setLinkExterno("");
    setSelectedTarefa(null);
  };

  const handleConcluir = (tarefaId: string) => {
    updateTarefa({ id: tarefaId, status: "concluida" });
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      critica: { variant: "destructive", icon: AlertTriangle },
      alta: { variant: "default", icon: AlertTriangle },
      media: { variant: "secondary", icon: Clock },
      baixa: { variant: "outline", icon: CheckCircle2 }
    };
    const config = variants[prioridade] || variants.media;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {prioridade.toUpperCase()}
      </Badge>
    );
  };

  const getDiasRestantes = (prazo: string) => {
    const dias = differenceInDays(new Date(prazo), new Date());
    if (dias < 0) return <span className="text-destructive font-semibold">Atrasada</span>;
    if (dias === 0) return <span className="text-warning font-semibold">Vence hoje</span>;
    if (dias === 1) return <span className="text-warning">Vence amanhã</span>;
    if (dias <= 7) return <span className="text-warning">Vence em {dias} dias</span>;
    return <span className="text-muted-foreground">Vence em {dias} dias</span>;
  };

  const pendentes = tarefas.filter(t => t.status === "pendente" || t.status === "em_andamento");
  const atrasadas = tarefas.filter(t => t.status === "atrasada");
  const concluidas = tarefas.filter(t => t.status === "concluida");

  const TarefaCard = ({ tarefa }: { tarefa: any }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getPrioridadeBadge(tarefa.prioridade)}
              <Badge variant="outline">{tarefa.tipo}</Badge>
            </div>
            <h4 className="font-semibold text-lg">{tarefa.titulo}</h4>
            <p className="text-sm text-muted-foreground mt-1">{tarefa.descricao}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Prazo: {format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {getDiasRestantes(tarefa.prazo_entrega)}
          </div>
        </div>

        {tarefa.link_externo && (
          <div className="mb-2">
            <a href={tarefa.link_externo} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
              <ExternalLink className="h-3 w-3" />
              Link externo
            </a>
          </div>
        )}

        {tarefa.arquivo_entrega_url && (
          <div className="mb-2">
            <a href={tarefa.arquivo_entrega_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
              <FileText className="h-3 w-3" />
              Arquivo anexado
            </a>
          </div>
        )}

        {tarefa.status !== "concluida" && (
          <div className="flex gap-2 mt-3">
            <Dialog open={selectedTarefa === tarefa.id} onOpenChange={(open) => !open && setSelectedTarefa(null)}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setSelectedTarefa(tarefa.id)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Entrega
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Anexar Entrega - {tarefa.titulo}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Upload de Arquivo</Label>
                    <Input
                      type="file"
                      onChange={(e) => setEntregaFile(e.target.files?.[0] || null)}
                    />
                    {entregaFile && (
                      <Button 
                        className="mt-2 w-full" 
                        onClick={() => handleUpload(tarefa.id, tarefa.user_id)}
                        disabled={isUploading}
                      >
                        {isUploading ? "Enviando..." : "Enviar Arquivo"}
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Ou</span>
                    </div>
                  </div>
                  <div>
                    <Label>Link Externo</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={linkExterno}
                      onChange={(e) => setLinkExterno(e.target.value)}
                    />
                    {linkExterno && (
                      <Button 
                        className="mt-2 w-full" 
                        onClick={() => handleSaveLink(tarefa.id)}
                      >
                        Salvar Link
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" onClick={() => handleConcluir(tarefa.id)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar como Concluída
            </Button>
          </div>
        )}

        {tarefa.feedback_mentor && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-1">Feedback do Mentor:</p>
            <p className="text-sm">{tarefa.feedback_mentor}</p>
            {tarefa.avaliacao_mentor && (
              <p className="text-sm mt-1">Avaliação: {tarefa.avaliacao_mentor}/5</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">Minhas Tarefas</h1>
        <p className="text-muted-foreground">Gerencie suas entregas e acompanhe seu progresso</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendentes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{atrasadas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{concluidas.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="atrasadas">Atrasadas ({atrasadas.length})</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas ({concluidas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4 mt-4">
          {pendentes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhuma tarefa pendente
              </CardContent>
            </Card>
          ) : (
            pendentes.map(tarefa => <TarefaCard key={tarefa.id} tarefa={tarefa} />)
          )}
        </TabsContent>

        <TabsContent value="atrasadas" className="space-y-4 mt-4">
          {atrasadas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhuma tarefa atrasada
              </CardContent>
            </Card>
          ) : (
            atrasadas.map(tarefa => <TarefaCard key={tarefa.id} tarefa={tarefa} />)
          )}
        </TabsContent>

        <TabsContent value="concluidas" className="space-y-4 mt-4">
          {concluidas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhuma tarefa concluída
              </CardContent>
            </Card>
          ) : (
            concluidas.map(tarefa => <TarefaCard key={tarefa.id} tarefa={tarefa} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
