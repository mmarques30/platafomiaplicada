import { useState } from "react";
import { FileText, Download, Trash2, Plus, Upload, ExternalLink, Link2, FolderOpen, HardDrive, Wrench, Video, Table, Loader2, GripVertical, Edit2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { useLinksBusiness, LinkBusiness } from "@/hooks/useLinksBusiness";
import { toast } from "sonner";

interface DocumentosBusinessManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

const tipoLabels: Record<string, string> = {
  proposta: "Contrato",
  transcricao: "Transcrição",
  anexo: "Anexo",
  solucao: "Solução/Guia",
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
  { value: "link", label: "Link Genérico", Icon: ExternalLink },
  { value: "drive", label: "Google Drive", Icon: HardDrive },
  { value: "folder", label: "Pasta", Icon: FolderOpen },
  { value: "tool", label: "Ferramenta", Icon: Wrench },
  { value: "video", label: "Vídeo", Icon: Video },
  { value: "doc", label: "Documento", Icon: FileText },
  { value: "spreadsheet", label: "Planilha", Icon: Table },
];

const getIconComponent = (icone: string) => {
  const found = iconeOptions.find(o => o.value === icone);
  return found?.Icon || ExternalLink;
};

export function DocumentosBusinessManager({ contratoId, userId, userName }: DocumentosBusinessManagerProps) {
  // Buscar apenas documentos para download do mentorado (não para IA)
  const { documentos, isLoading: isLoadingDocs, createDocumento, deleteDocumento, uploadDocumento } = useDocumentosBusiness(contratoId, false);
  const { links, isLoading: isLoadingLinks, createLink, updateLink, deleteLink } = useLinksBusiness(contratoId);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [tipoUpload, setTipoUpload] = useState<"anexo" | "solucao" | "transcricao" | "outro">("anexo");

  // Link form state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBusiness | null>(null);
  const [linkForm, setLinkForm] = useState({ titulo: "", url: "", descricao: "", icone: "link" });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const path = await uploadDocumento(file, contratoId, tipoUpload);
      await createDocumento.mutateAsync({
        contrato_id: contratoId,
        titulo: file.name.replace(/\.[^/.]+$/, ""),
        tipo: tipoUpload,
        arquivo_url: path,
      });
      toast.success("Documento enviado com sucesso");
    } catch (error) {
      console.error("Erro ao enviar documento:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (doc: DocumentoBusiness) => {
    if (!doc.arquivo_url) {
      toast.error("Arquivo não disponível");
      return;
    }

    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("contratos-business")
        .createSignedUrl(doc.arquivo_url, 3600);

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

  const handleDeleteDoc = async (id: string) => {
    try {
      await deleteDocumento.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
    }
  };

  const handleOpenLinkDialog = (link?: LinkBusiness) => {
    if (link) {
      setEditingLink(link);
      setLinkForm({
        titulo: link.titulo,
        url: link.url,
        descricao: link.descricao || "",
        icone: link.icone,
      });
    } else {
      setEditingLink(null);
      setLinkForm({ titulo: "", url: "", descricao: "", icone: "link" });
    }
    setLinkDialogOpen(true);
  };

  const handleSaveLink = async () => {
    if (!linkForm.titulo || !linkForm.url) {
      toast.error("Preencha título e URL");
      return;
    }

    try {
      if (editingLink) {
        await updateLink.mutateAsync({
          id: editingLink.id,
          titulo: linkForm.titulo,
          url: linkForm.url,
          descricao: linkForm.descricao || undefined,
          icone: linkForm.icone,
        });
      } else {
        await createLink.mutateAsync({
          contrato_id: contratoId,
          titulo: linkForm.titulo,
          url: linkForm.url,
          descricao: linkForm.descricao || undefined,
          icone: linkForm.icone,
        });
      }
      setLinkDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar link:", error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao excluir link:", error);
    }
  };

  const isLoading = isLoadingDocs || isLoadingLinks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Documentos e Links</h2>
        </div>
        {userName && (
          <Badge variant="outline" className="text-xs">
            {userName}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="documentos" className="space-y-4">
        <TabsList className="bg-muted/40 border-0 rounded-lg p-1">
          <TabsTrigger value="documentos" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-3.5 w-3.5" />
            Documentos ({documentos.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link2 className="h-3.5 w-3.5" />
            Links Importantes ({links.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Documentos */}
        <TabsContent value="documentos" className="space-y-4 mt-4">
          {/* Upload Section */}
          <Card className="border-border/50">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 flex gap-2 items-center">
                  <Select value={tipoUpload} onValueChange={(v) => setTipoUpload(v as typeof tipoUpload)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anexo">Anexo</SelectItem>
                      <SelectItem value="solucao">Solução/Guia</SelectItem>
                      <SelectItem value="transcricao">Transcrição</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    Tipo do documento
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt"
                    disabled={uploadingFile}
                  />
                  <Button
                    asChild
                    size="sm"
                    disabled={uploadingFile}
                  >
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {uploadingFile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar Documento
                        </>
                      )}
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Documentos */}
          {documentos.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento</h3>
                <p className="text-muted-foreground text-sm">
                  Envie documentos usando o botão acima
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documentos.map((doc) => (
                <Card key={doc.id} className="border-border/50 hover:shadow-sm transition-shadow">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{doc.titulo}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={`text-xs ${tipoColors[doc.tipo] || tipoColors.outro}`}>
                              {tipoLabels[doc.tipo] || doc.tipo}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.arquivo_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingId === doc.id}
                            className="h-8 w-8"
                          >
                            {downloadingId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O documento será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDoc(doc.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Links */}
        <TabsContent value="links" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => handleOpenLinkDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Link
            </Button>
          </div>

          {links.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum link importante</h3>
                <p className="text-muted-foreground text-sm">
                  Adicione links para Drive, ferramentas e outros recursos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const IconComponent = getIconComponent(link.icone);
                return (
                  <Card key={link.id} className="border-border/50 hover:shadow-sm transition-shadow">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{link.titulo}</h4>
                            {link.descricao && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {link.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(link.url, "_blank")}
                            className="h-8 w-8"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenLinkDialog(link)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover link?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  O link "{link.titulo}" será removido da lista.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLink(link.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar/editar link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Editar Link" : "Novo Link Importante"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-titulo">Título *</Label>
              <Input
                id="link-titulo"
                placeholder="Ex: Pasta do Google Drive"
                value={linkForm.titulo}
                onChange={(e) => setLinkForm(prev => ({ ...prev, titulo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                placeholder="https://..."
                value={linkForm.url}
                onChange={(e) => setLinkForm(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-descricao">Descrição (opcional)</Label>
              <Textarea
                id="link-descricao"
                placeholder="Breve descrição do link..."
                value={linkForm.descricao}
                onChange={(e) => setLinkForm(prev => ({ ...prev, descricao: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select value={linkForm.icone} onValueChange={(v) => setLinkForm(prev => ({ ...prev, icone: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.Icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLink} disabled={createLink.isPending || updateLink.isPending}>
              {(createLink.isPending || updateLink.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingLink ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
