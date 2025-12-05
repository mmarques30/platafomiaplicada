import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Users, Download, Eye, ExternalLink, Trash2 } from "lucide-react";
import { usePesquisasAdmin, useRespostasPesquisa, useEstatisticasPesquisa, useDeleteResposta } from "@/hooks/usePesquisas";
import type { Pesquisa } from "@/types/pesquisas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

export default function GerenciarPesquisas() {
  const { data: pesquisas, isLoading } = usePesquisasAdmin();
  const [selectedPesquisa, setSelectedPesquisa] = useState<Pesquisa | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pesquisas</h1>
          <p className="text-muted-foreground">Gerencie pesquisas e visualize respostas</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {pesquisas?.map((pesquisa) => (
            <PesquisaCard
              key={pesquisa.id}
              pesquisa={pesquisa}
              onViewRespostas={() => setSelectedPesquisa(pesquisa)}
            />
          ))}
        </div>
      )}

      {selectedPesquisa && (
        <RespostasDrawer
          pesquisa={selectedPesquisa}
          open={!!selectedPesquisa}
          onClose={() => setSelectedPesquisa(null)}
        />
      )}
    </div>
  );
}

function PesquisaCard({ 
  pesquisa, 
  onViewRespostas 
}: { 
  pesquisa: Pesquisa; 
  onViewRespostas: () => void;
}) {
  const { data: stats } = useEstatisticasPesquisa(pesquisa.id);
  const totalPerguntas = pesquisa.perguntas.reduce((acc, s) => acc + s.perguntas.length, 0);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{pesquisa.titulo}</h3>
              <p className="text-sm text-muted-foreground mt-1">{pesquisa.descricao}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stats?.total || 0} respostas
                </span>
                <span>/{pesquisa.slug}</span>
                <Badge variant={pesquisa.ativo ? "default" : "secondary"}>
                  {pesquisa.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/${pesquisa.slug}`, "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onViewRespostas}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver Respostas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{pesquisa.perguntas.length}</p>
            <p className="text-xs text-muted-foreground">Seções</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalPerguntas}</p>
            <p className="text-xs text-muted-foreground">Perguntas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats?.completas || 0}</p>
            <p className="text-xs text-muted-foreground">Completas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats?.parciais || 0}</p>
            <p className="text-xs text-muted-foreground">Parciais</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RespostasDrawer({ 
  pesquisa, 
  open, 
  onClose 
}: { 
  pesquisa: Pesquisa; 
  open: boolean; 
  onClose: () => void;
}) {
  const { data: respostas, isLoading } = useRespostasPesquisa(pesquisa.id);
  const deleteResposta = useDeleteResposta();
  const [selectedResposta, setSelectedResposta] = useState<any>(null);
  const [respostaToDelete, setRespostaToDelete] = useState<any>(null);

  const handleDelete = async () => {
    if (!respostaToDelete) return;
    
    try {
      await deleteResposta.mutateAsync(respostaToDelete.id);
      toast({
        title: "Resposta excluída",
        description: "A resposta foi removida com sucesso.",
      });
      if (selectedResposta?.id === respostaToDelete.id) {
        setSelectedResposta(null);
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a resposta.",
        variant: "destructive",
      });
    } finally {
      setRespostaToDelete(null);
    }
  };

  const exportCSV = () => {
    if (!respostas || respostas.length === 0) return;

    const allPerguntaIds = pesquisa.perguntas.flatMap(s => 
      s.perguntas.map(p => ({ id: p.id, texto: p.texto }))
    );

    const headers = ["Nome", "Email", "Status", "Data", ...allPerguntaIds.map(p => p.texto)];
    
    const rows = respostas.map(r => {
      const displayEmail = (r as any).email_respondente || "N/A";
      return [
        displayEmail.split("@")[0] || "Anônimo",
        displayEmail,
        r.completado ? "Completa" : "Parcial",
        format(new Date(r.created_at), "dd/MM/yyyy HH:mm"),
        ...allPerguntaIds.map(p => (r.respostas as Record<string, string>)[p.id] || "")
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `respostas-${pesquisa.slug}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Respostas: {pesquisa.titulo}</DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {respostas?.length || 0} respostas registradas
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </DrawerHeader>

          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : respostas?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma resposta registrada ainda.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Lista de respostas */}
                <ScrollArea className="h-[70vh]">
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {respostas?.map((resposta) => {
                          const emailRespondente = (resposta as any).email_respondente;
                          const displayEmail = emailRespondente || "N/A";
                          const displayName = emailRespondente ? emailRespondente.split("@")[0] : "Anônimo";
                          return (
                            <TableRow 
                              key={resposta.id}
                              className={selectedResposta?.id === resposta.id ? "bg-muted" : ""}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {displayName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {displayEmail}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={resposta.completado ? "default" : "secondary"}>
                                  {resposta.completado ? "Completa" : "Parcial"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(resposta.created_at), "dd/MM/yy", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedResposta(resposta)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setRespostaToDelete(resposta)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>

                {/* Detalhes da resposta selecionada */}
                <div className="border border-border rounded-lg p-4">
                  {selectedResposta ? (
                    <ScrollArea className="h-[70vh]">
                      <h3 className="font-semibold text-foreground mb-4">
                        Respostas de {selectedResposta.email_respondente?.split("@")[0] || "Anônimo"}
                      </h3>
                      <div className="space-y-6">
                        {pesquisa.perguntas.map((secao) => (
                          <div key={secao.secao}>
                            <h4 className="text-sm font-medium text-primary mb-3">
                              {secao.titulo}
                            </h4>
                            <div className="space-y-4">
                              {secao.perguntas.map((pergunta) => {
                                const resposta = (selectedResposta.respostas as Record<string, string>)[pergunta.id];
                                return (
                                  <div key={pergunta.id}>
                                    <p className="text-sm text-muted-foreground">
                                      {pergunta.texto}
                                    </p>
                                    <p className="text-foreground mt-1">
                                      {resposta || <span className="text-muted-foreground italic">Não respondida</span>}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Selecione uma resposta para ver os detalhes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!respostaToDelete} onOpenChange={(o) => !o && setRespostaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir resposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. A resposta de "{respostaToDelete?.email_respondente || "Anônimo"}" será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
