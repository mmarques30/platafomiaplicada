import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, FileText, Loader2, ArrowLeft } from "lucide-react";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MentoriaSessoes() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { sessoes, isLoading } = useMentoriaSessoes(businessUserId);
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const [selectedSessao, setSelectedSessao] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("todas");

  const sessoesAgendadas = sessoes.filter(s => s.status === "agendada");
  const sessoesRealizadas = sessoes.filter(s => s.status === "realizada");

  const sessoesFiltradas = useMemo(() => {
    switch (activeTab) {
      case "proximas":
        return sessoes.filter(s => s.status === "agendada");
      case "realizadas":
        return sessoes.filter(s => s.status === "realizada");
      default:
        return sessoes;
    }
  }, [sessoes, activeTab]);

  const getEtapaNome = (etapaId: string | null | undefined) => {
    if (!etapaId || !etapas) return null;
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? `Etapa ${etapa.numero_etapa}` : null;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      agendada: { variant: "default", label: "Agendada" },
      realizada: { variant: "secondary", label: "Realizada" },
      cancelada: { variant: "destructive", label: "Cancelada" }
    };
    const { variant, label } = config[status] || { variant: "default", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
        <PageTitle primary="Sessões" secondary="de Mentoria" />
        <p className="text-muted-foreground text-lg mt-2">
          Acompanhe suas sessões e acesse gravações e transcrições
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="proximas">Próximas ({sessoesAgendadas.length})</TabsTrigger>
          <TabsTrigger value="realizadas">Realizadas ({sessoesRealizadas.length})</TabsTrigger>
          <TabsTrigger value="todas">Todas ({sessoes.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabela de Sessões */}
      <div className="mt-6 rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Etapa</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="hidden sm:table-cell">Duração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Recursos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessoesFiltradas.map((sessao, index) => (
              <TableRow 
                key={sessao.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedSessao(sessao)}
              >
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{sessao.titulo}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getEtapaNome(sessao.etapa_id) ? (
                    <Badge variant="outline" className="text-xs">
                      {getEtapaNome(sessao.etapa_id)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(new Date(sessao.data_sessao), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {sessao.duracao ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {sessao.duracao} min
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(sessao.status)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-1.5">
                    {sessao.video_url && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Video className="h-3 w-3" />
                        Vídeo
                      </Badge>
                    )}
                    {sessao.transcricao && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <FileText className="h-3 w-3" />
                        Trans.
                      </Badge>
                    )}
                    {!sessao.video_url && !sessao.transcricao && (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sessoesFiltradas.length === 0 && (
          <EmptyState icon={Calendar} title="Nenhuma sessão agendada" description="Suas sessões aparecerão aqui quando forem confirmadas." />
        )}
      </div>

      <Dialog open={!!selectedSessao} onOpenChange={() => setSelectedSessao(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedSessao?.titulo}</DialogTitle>
            <DialogDescription>
              {selectedSessao && format(new Date(selectedSessao.data_sessao), "PPP", { locale: ptBR })}
              {selectedSessao?.etapa_id && getEtapaNome(selectedSessao.etapa_id) && (
                <span className="ml-2">
                  • <Badge variant="outline" className="text-xs ml-1">{getEtapaNome(selectedSessao.etapa_id)}</Badge>
                </span>
              )}
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

              {!selectedSessao.video_url && !selectedSessao.transcricao && !selectedSessao.notas && (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhum recurso disponível para esta sessão ainda.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
