import { useState } from "react";
import { FileText, Download, Trash2, Upload, Loader2, Image, FileArchive, File } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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

// Paleta unificada com a marca: tons sutis em verde-brand para variar entre
// os tipos sem sair da identidade. Evita o "carnaval" de cores anteriores.
const tipoColors: Record<string, string> = {
  proposta: "bg-brand-strong/12 text-brand-strong border-brand-strong/25",
  transcricao: "bg-brand-strong/8 text-brand-strong/85 border-brand-strong/20",
  anexo: "bg-brand-cream text-brand-strong border-brand-strong/20",
  solucao: "bg-brand-strong/15 text-brand-strong border-brand-strong/30",
  logo: "bg-brand-strong/8 text-brand-strong/85 border-brand-strong/20",
  imagem: "bg-brand-cream text-brand-strong border-brand-strong/20",
  outro: "bg-muted text-muted-foreground border-brand-hairline",
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
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between rounded-xl bg-brand-cream/50 border border-brand-hairline px-4 py-3">
          <div className="flex gap-3 items-center">
            <Select value={tipoUpload} onValueChange={setTipoUpload}>
              <SelectTrigger className="w-[150px] h-9 bg-background border-brand-hairline focus:ring-brand-strong/30">
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
            <span className="text-xs text-muted-foreground">Tipo do arquivo</span>
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
            <Button asChild size="sm" disabled={uploadingFile} className="bg-brand-strong hover:bg-brand-strong/90 text-brand-cream rounded-full px-5">
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
      )}

      {documentosDisponiveis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-hairline bg-background py-12 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-serif-display text-lg text-foreground mb-1">Nenhum arquivo</h3>
          <p className="text-muted-foreground text-sm">
            {readOnly ? "Arquivos do projeto aparecerão aqui." : "Envie arquivos usando o botão acima."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-brand-hairline bg-background overflow-hidden divide-y divide-brand-hairline">
          {documentosDisponiveis.map((doc) => {
            const IconComp = getFileIcon(doc.tipo);
            const isImg = doc.arquivo_url ? isImageFile(doc.arquivo_url) : false;
            return (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-cream/40 transition-colors">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-strong/10 ${isImg ? "cursor-pointer hover:bg-brand-strong/15" : ""}`}
                  onClick={() => isImg && handlePreview(doc)}
                >
                  <IconComp className="h-[18px] w-[18px] text-brand-strong" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">{doc.titulo}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-[10px] font-medium px-2 py-0 h-5 ${tipoColors[doc.tipo] || tipoColors.outro}`}>
                      {tipoLabels[doc.tipo] || doc.tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(doc.created_at), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-strong hover:bg-brand-strong/10" onClick={() => handleDownload(doc)} disabled={downloadingId === doc.id}>
                    {downloadingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                  {!readOnly && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
