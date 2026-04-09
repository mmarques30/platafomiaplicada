import { useState } from "react";
import { FileText, Download, Trash2, Upload, Loader2, Image, FileArchive, File } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { toast } from "sonner";

const tipoLabels: Record<string, string> = {
  proposta: "Contrato",
  transcricao: "Transcrição",
  anexo: "Anexo",
  solucao: "Solução/Guia",
  logo: "Logo",
  imagem: "Imagem",
  outro: "Outro",
};

const tipoColors: Record<string, string> = {
  proposta: "bg-primary/10 text-primary border-primary/20",
  transcricao: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  anexo: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  solucao: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  logo: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  imagem: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  outro: "bg-muted text-muted-foreground border-muted-foreground/20",
};

const getFileIcon = (tipo: string) => {
  switch (tipo) {
    case "logo":
    case "imagem":
      return Image;
    case "outro":
      return File;
    default:
      return FileText;
  }
};

const isImageFile = (url: string) => {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url);
};

interface ArquivosProjetoSectionProps {
  contratoId: string;
  readOnly?: boolean;
}

export function ArquivosProjetoSection({ contratoId, readOnly = false }: ArquivosProjetoSectionProps) {
  const { documentos, isLoading, createDocumento, deleteDocumento, uploadDocumento } = useDocumentosBusiness(contratoId, false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [tipoUpload, setTipoUpload] = useState<string>("anexo");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const path = await uploadDocumento(file, contratoId, tipoUpload as any);
      await createDocumento.mutateAsync({
        contrato_id: contratoId,
        titulo: file.name.replace(/\.[^/.]+$/, ""),
        tipo: tipoUpload as any,
        arquivo_url: path,
      });
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (doc: DocumentoBusiness) => {
    if (!doc.arquivo_url) return;
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("contratos-business")
        .createSignedUrl(doc.arquivo_url, 3600);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Erro ao baixar arquivo");
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (doc: DocumentoBusiness) => {
    if (!doc.arquivo_url || !isImageFile(doc.arquivo_url)) return;
    try {
      const { data, error } = await supabase.storage
        .from("contratos-business")
        .createSignedUrl(doc.arquivo_url, 3600);
      if (error) throw error;
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    } catch {
      toast.error("Erro ao carregar preview");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const documentosDisponiveis = documentos.filter((d) => d.arquivo_url);

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 flex gap-2 items-center">
                <Select value={tipoUpload} onValueChange={setTipoUpload}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anexo">Anexo</SelectItem>
                    <SelectItem value="solucao">Solução/Guia</SelectItem>
                    <SelectItem value="transcricao">Transcrição</SelectItem>
                    <SelectItem value="logo">Logo</SelectItem>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Tipo do arquivo</span>
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload-arquivos"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt,.html,.htm,.png,.jpg,.jpeg,.gif,.svg,.webp,.zip"
                  disabled={uploadingFile}
                />
                <Button asChild size="sm" disabled={uploadingFile}>
                  <label htmlFor="file-upload-arquivos" className="cursor-pointer">
                    {uploadingFile ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />Enviar Arquivo</>
                    )}
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {documentosDisponiveis.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum arquivo</h3>
            <p className="text-muted-foreground text-sm">
              {readOnly ? "Arquivos do projeto aparecerão aqui." : "Envie arquivos usando o botão acima."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documentosDisponiveis.map((doc) => {
            const IconComp = getFileIcon(doc.tipo);
            const isImg = doc.arquivo_url ? isImageFile(doc.arquivo_url) : false;
            return (
              <Card key={doc.id} className="border-border/50 hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isImg ? "bg-pink-500/10" : "bg-primary/10"} ${isImg ? "cursor-pointer" : ""}`}
                      onClick={() => isImg && handlePreview(doc)}
                    >
                      <IconComp className={`h-5 w-5 ${isImg ? "text-pink-600" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{doc.titulo}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-xs ${tipoColors[doc.tipo] || tipoColors.outro}`}>
                          {tipoLabels[doc.tipo] || doc.tipo}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(doc.created_at), "dd/MM/yy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)} disabled={downloadingId === doc.id}>
                        {downloadingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                      {!readOnly && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteDocumento.mutateAsync(doc.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="max-w-2xl max-h-[80vh] overflow-auto bg-card rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded" />
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setPreviewUrl(null)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
