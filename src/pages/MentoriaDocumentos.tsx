import { useState } from "react";
import { FileText, Download, Loader2, FolderOpen, ExternalLink, Link2, HardDrive, Wrench, Video, Table, ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { useLinksBusiness } from "@/hooks/useLinksBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useNavigate } from "react-router-dom";
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

const iconeOptions = [
  { value: "link", Icon: ExternalLink },
  { value: "drive", Icon: HardDrive },
  { value: "folder", Icon: FolderOpen },
  { value: "tool", Icon: Wrench },
  { value: "video", Icon: Video },
  { value: "doc", Icon: FileText },
  { value: "spreadsheet", Icon: Table },
];

const getIconComponent = (icone: string) => {
  const found = iconeOptions.find(o => o.value === icone);
  return found?.Icon || ExternalLink;
};

export default function MentoriaDocumentos() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(businessUserId);
  // Buscar apenas documentos que NÃO são para processamento IA (importados na aba Documentos)
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id, false);
  const { links, isLoading: isLoadingLinks } = useLinksBusiness(contrato?.id);
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

  const isLoading = isLoadingContrato || isLoadingDocs || isLoadingLinks;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="container mx-auto py-8 px-4">
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
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Documentos</h1>
        <p className="text-muted-foreground">
          Acesse seus contratos, documentos e links importantes.
        </p>
      </div>

      <Tabs defaultValue="downloads" className="space-y-4">
        <TabsList className="bg-muted/40 border-0 rounded-lg p-1">
          <TabsTrigger value="downloads" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Download className="h-4 w-4" />
            Downloads ({documentosDisponiveis.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link2 className="h-4 w-4" />
            Links Importantes ({links.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Downloads */}
        <TabsContent value="downloads" className="space-y-4 mt-4">
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
        </TabsContent>

        {/* Tab Links */}
        <TabsContent value="links" className="space-y-4 mt-4">
          {links.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum link disponível</h3>
                <p className="text-muted-foreground">
                  Links importantes aparecerão aqui quando forem adicionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {links.map((link) => {
                const IconComponent = getIconComponent(link.icone);
                return (
                  <Card 
                    key={link.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">
                              {link.titulo}
                            </h3>
                            {link.descricao && (
                              <p className="text-sm text-muted-foreground truncate">
                                {link.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
