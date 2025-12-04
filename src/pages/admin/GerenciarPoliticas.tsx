import { useState } from "react";
import { useDocumentosLegais, useAtualizarDocumento, DocumentoLegal } from "@/hooks/useDocumentosLegais";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileText, Edit, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarPoliticas() {
  const { data: documentos, isLoading } = useDocumentosLegais();
  const atualizarDocumento = useAtualizarDocumento();
  
  const [editando, setEditando] = useState<DocumentoLegal | null>(null);
  const [conteudoMentorados, setConteudoMentorados] = useState("");
  const [conteudoVisitantes, setConteudoVisitantes] = useState("");
  const [apenasMentorados, setApenasMentorados] = useState(false);

  const handleEditar = (doc: DocumentoLegal) => {
    setEditando(doc);
    setConteudoMentorados(doc.conteudo_mentorados);
    setConteudoVisitantes(doc.conteudo_visitantes || "");
    setApenasMentorados(doc.apenas_mentorados);
  };

  const handleSalvar = async () => {
    if (!editando) return;

    try {
      await atualizarDocumento.mutateAsync({
        id: editando.id,
        conteudo_mentorados: conteudoMentorados,
        conteudo_visitantes: apenasMentorados ? null : conteudoVisitantes,
        apenas_mentorados: apenasMentorados,
      });
      toast.success("Documento atualizado com sucesso");
      setEditando(null);
    } catch (error) {
      toast.error("Erro ao atualizar documento");
    }
  };

  const handleCancelar = () => {
    setEditando(null);
    setConteudoMentorados("");
    setConteudoVisitantes("");
    setApenasMentorados(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Gerenciar Políticas e Termos</h1>
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Políticas e Termos</h1>
        <p className="text-muted-foreground">
          Edite os documentos legais da plataforma
        </p>
      </div>

      <div className="grid gap-4">
        {documentos?.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{doc.titulo}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Atualizado em {format(new Date(doc.ultima_atualizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.apenas_mentorados && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Apenas Mentorados
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEditar(doc)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editando} onOpenChange={(open) => !open && handleCancelar()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar: {editando?.titulo}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Toggle Apenas Mentorados */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Apenas para Mentorados</Label>
                <p className="text-sm text-muted-foreground">
                  Se ativado, visitantes não terão acesso a este documento
                </p>
              </div>
              <Switch
                checked={apenasMentorados}
                onCheckedChange={setApenasMentorados}
              />
            </div>

            {/* Tabs de Conteúdo */}
            <Tabs defaultValue="mentorados" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mentorados">Versão Mentorados</TabsTrigger>
                <TabsTrigger value="visitantes" disabled={apenasMentorados}>
                  Versão Visitantes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mentorados" className="mt-4">
                <div className="space-y-2">
                  <Label>Conteúdo para Mentorados (Markdown)</Label>
                  <Textarea
                    value={conteudoMentorados}
                    onChange={(e) => setConteudoMentorados(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Conteúdo em Markdown..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="visitantes" className="mt-4">
                <div className="space-y-2">
                  <Label>Conteúdo para Visitantes (Markdown)</Label>
                  <Textarea
                    value={conteudoVisitantes}
                    onChange={(e) => setConteudoVisitantes(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Conteúdo em Markdown..."
                    disabled={apenasMentorados}
                  />
                  {apenasMentorados && (
                    <p className="text-sm text-muted-foreground">
                      Desative "Apenas para Mentorados" para editar a versão de visitantes.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={atualizarDocumento.isPending}>
              {atualizarDocumento.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
