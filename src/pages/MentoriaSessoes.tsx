import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, FileText, Loader2, ArrowLeft } from "lucide-react";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MentoriaSessoes() {
  const navigate = useNavigate();
  const { sessoes, isLoading } = useMentoriaSessoes();
  const [selectedSessao, setSelectedSessao] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const sessoesAgendadas = sessoes.filter(s => s.status === "agendada");
  const sessoesRealizadas = sessoes.filter(s => s.status === "realizada");

  const getStatusBadge = (status: string) => {
    const variants: any = {
      agendada: "default",
      realizada: "secondary",
      cancelada: "destructive"
    };
    const labels: any = {
      agendada: "Agendada",
      realizada: "Realizada",
      cancelada: "Cancelada"
    };
    return <Badge variant={variants[status] || "default"}>{labels[status]}</Badge>;
  };

  const SessaoCard = ({ sessao }: { sessao: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
      onClick={() => setSelectedSessao(sessao)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{sessao.titulo}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(sessao.data_sessao), "PPP", { locale: ptBR })}
            </div>
            {sessao.duracao && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {sessao.duracao} minutos
              </div>
            )}
          </div>
          {getStatusBadge(sessao.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {sessao.transcricao && (
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              Transcrição
            </Badge>
          )}
          {sessao.video_url && (
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              Gravação
            </Badge>
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
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Sessões de Mentoria</h1>
        <p className="text-muted-foreground text-lg">
          Acompanhe suas sessões e acesse gravações e transcrições
        </p>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="proximas">Próximas ({sessoesAgendadas.length})</TabsTrigger>
          <TabsTrigger value="realizadas">Realizadas ({sessoesRealizadas.length})</TabsTrigger>
          <TabsTrigger value="todas">Todas ({sessoes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proximas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessoesAgendadas.length > 0 ? (
              sessoesAgendadas.map((sessao) => (
                <SessaoCard key={sessao.id} sessao={sessao} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma sessão agendada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="realizadas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessoesRealizadas.length > 0 ? (
              sessoesRealizadas.map((sessao) => (
                <SessaoCard key={sessao.id} sessao={sessao} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma sessão realizada ainda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="todas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessoes.length > 0 ? (
              sessoes.map((sessao) => (
                <SessaoCard key={sessao.id} sessao={sessao} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma sessão cadastrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedSessao} onOpenChange={() => setSelectedSessao(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedSessao?.titulo}</DialogTitle>
            <DialogDescription>
              {selectedSessao && format(new Date(selectedSessao.data_sessao), "PPP", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSessao && (
            <div className="space-y-6">
              {selectedSessao.video_url && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Gravação da Sessão
                  </h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <a 
                      href={selectedSessao.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Abrir gravação
                    </a>
                  </div>
                </div>
              )}

              {selectedSessao.transcricao && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transcrição
                  </h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="whitespace-pre-wrap text-sm">{selectedSessao.transcricao}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedSessao.notas && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="whitespace-pre-wrap text-sm">{selectedSessao.notas}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
