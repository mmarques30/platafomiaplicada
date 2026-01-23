import { useState } from "react";
import { FileText, Download, Loader2, FolderOpen } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { toast } from "sonner";

const tipoLabels: Record<string, string> = {
  proposta: "Contrato",
  transcricao: "Transcrição",
  anexo: "Anexo",
  solucao: "Solução",
  outro: "Outro",
};

const tipoColors: Record<string, string> = {
  proposta: "bg-primary/10 text-primary border-primary/20",
  transcricao: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  anexo: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  solucao: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  outro: "bg-muted text-muted-foreground border-muted-foreground/20",
};

export default function MentoriaDocumentos() {
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness();
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: DocumentoBusiness) => {
    if (!doc.arquivo_url) {
      toast.error("Arquivo não disponível");
      return;
    }

    setDownloadingId(doc.id);
    try {
      // Gerar signed URL para download seguro
      const { data, error } = await supabase.storage
        .from("contratos-business")
        .createSignedUrl(doc.arquivo_url, 3600); // 1 hora de validade

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
        toast.success("Download iniciado");
      }
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
      toast.error("Erro ao baixar documento");
    } finally {
      setDownloadingId(null);
    }
  };

  const isLoading = isLoadingContrato || isLoadingDocs;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground">
              Você ainda não possui um contrato ativo no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documentosDisponiveis = documentos.filter((d) => d.arquivo_url);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Documentos</h1>
        <p className="text-muted-foreground">
          Acesse seus contratos e documentos relacionados à mentoria.
        </p>
      </div>

      {documentosDisponiveis.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento disponível</h3>
            <p className="text-muted-foreground">
              Seus documentos aparecerão aqui quando forem disponibilizados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documentosDisponiveis.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">
                        {doc.titulo}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={tipoColors[doc.tipo] || tipoColors.outro}
                        >
                          {tipoLabels[doc.tipo] || doc.tipo}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Adicionado em{" "}
                          {format(parseISO(doc.created_at), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="w-full sm:w-auto"
                  >
                    {downloadingId === doc.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
