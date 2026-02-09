import { useState } from "react";
import { FileText, Download, Trash2, Upload, ExternalLink, Link2, FolderOpen, HardDrive, Wrench, Video, Table, Loader2, Edit2, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentosSkills } from "@/hooks/admin/useDocumentosSkills";
import { useLinksSkills, LinkSkills } from "@/hooks/admin/useLinksSkills";
import { toast } from "sonner";

interface Props { equipeId: string; equipeName?: string }

const tipoLabels: Record<string, string> = { contrato: "Contrato", transcricao: "Transcrição", anexo: "Anexo", solucao: "Solução", outro: "Outro" };
const tipoColors: Record<string, string> = { contrato: "bg-primary/10 text-primary border-primary/20", transcricao: "bg-blue-500/10 text-blue-600 border-blue-500/20", anexo: "bg-amber-500/10 text-amber-600 border-amber-500/20", solucao: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", outro: "bg-muted text-muted-foreground border-muted-foreground/20" };

const iconeOptions = [
  { value: "link", label: "Link", Icon: ExternalLink },
  { value: "drive", label: "Drive", Icon: HardDrive },
  { value: "folder", label: "Pasta", Icon: FolderOpen },
  { value: "tool", label: "Ferramenta", Icon: Wrench },
  { value: "video", label: "Vídeo", Icon: Video },
  { value: "doc", label: "Documento", Icon: FileText },
  { value: "spreadsheet", label: "Planilha", Icon: Table },
];
const getIcon = (icone: string) => iconeOptions.find(o => o.value === icone)?.Icon || ExternalLink;

export default function DocumentosSkillsManager({ equipeId, equipeName }: Props) {
  const { documentos, isLoading: loadDocs, createDocumento, deleteDocumento, uploadDocumento } = useDocumentosSkills(equipeId);
  const { links, isLoading: loadLinks, createLink, updateLink, deleteLink } = useLinksSkills(equipeId);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [tipoUpload, setTipoUpload] = useState<string>("anexo");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkSkills | null>(null);
  const [linkForm, setLinkForm] = useState({ titulo: "", url: "", descricao: "", icone: "link" });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const path = await uploadDocumento(file, equipeId);
      await createDocumento.mutateAsync({ equipe_id: equipeId, titulo: file.name.replace(/\.[^/.]+$/, ""), tipo: tipoUpload, arquivo_url: path });
    } catch { toast.error("Erro ao enviar"); } finally { setUploadingFile(false); e.target.value = ""; }
  };

  const handleDownload = async (doc: any) => {
    if (!doc.arquivo_url) return;
    setDownloadingId(doc.id);
    try {
      const { data } = await supabase.storage.from("documentos-skills").createSignedUrl(doc.arquivo_url, 3600);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } catch { toast.error("Erro ao baixar"); } finally { setDownloadingId(null); }
  };

  const openLinkDialog = (link?: LinkSkills) => {
    if (link) { setEditingLink(link); setLinkForm({ titulo: link.titulo, url: link.url, descricao: link.descricao || "", icone: link.icone }); }
    else { setEditingLink(null); setLinkForm({ titulo: "", url: "", descricao: "", icone: "link" }); }
    setLinkDialogOpen(true);
  };

  const saveLink = async () => {
    if (!linkForm.titulo || !linkForm.url) { toast.error("Preencha título e URL"); return; }
    if (editingLink) await updateLink.mutateAsync({ id: editingLink.id, ...linkForm });
    else await createLink.mutateAsync({ equipe_id: equipeId, ...linkForm });
    setLinkDialogOpen(false);
  };

  if (loadDocs || loadLinks) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-muted-foreground" /><h2 className="text-lg font-semibold">Documentos e Links</h2></div>
        {equipeName && <Badge variant="outline" className="text-xs">{equipeName}</Badge>}
      </div>

      <Tabs defaultValue="documentos" className="space-y-4">
        <TabsList className="bg-muted/40 border-0 rounded-lg p-1">
          <TabsTrigger value="documentos" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"><FileText className="h-3.5 w-3.5" /> Documentos ({documentos.length})</TabsTrigger>
          <TabsTrigger value="links" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"><Link2 className="h-3.5 w-3.5" /> Links ({links.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4 mt-4">
          <Card className="border-border/50"><CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 flex gap-2 items-center">
                <Select value={tipoUpload} onValueChange={setTipoUpload}><SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="anexo">Anexo</SelectItem><SelectItem value="contrato">Contrato</SelectItem><SelectItem value="transcricao">Transcrição</SelectItem><SelectItem value="solucao">Solução</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="relative">
                <input type="file" id="skills-file-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt" disabled={uploadingFile} />
                <Button asChild size="sm" disabled={uploadingFile}><label htmlFor="skills-file-upload" className="cursor-pointer">{uploadingFile ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : <><Upload className="h-4 w-4 mr-2" />Enviar</>}</label></Button>
              </div>
            </div>
          </CardContent></Card>

          {documentos.length === 0 ? (
            <Card className="border-border/50"><CardContent className="py-12 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-lg font-medium mb-2">Nenhum documento</p></CardContent></Card>
          ) : documentos.map(doc => (
            <Card key={doc.id} className="border-border/50 hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4"><div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{doc.titulo}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className={`text-xs ${tipoColors[doc.tipo] || tipoColors.outro}`}>{tipoLabels[doc.tipo] || doc.tipo}</Badge>
                      <span className="text-xs text-muted-foreground">{format(parseISO(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.arquivo_url && <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} disabled={downloadingId === doc.id} className="h-8 w-8">{downloadingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</Button>}
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle><AlertDialogDescription>Ação irreversível.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteDocumento.mutate(doc.id)}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              </div></CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-4">
          <div className="flex justify-end"><Button size="sm" onClick={() => openLinkDialog()}><Plus className="h-4 w-4 mr-2" />Novo Link</Button></div>
          {links.length === 0 ? (
            <Card className="border-border/50"><CardContent className="py-12 text-center"><Link2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-lg font-medium mb-2">Nenhum link</p></CardContent></Card>
          ) : links.map(link => {
            const IconComp = getIcon(link.icone);
            return (
              <Card key={link.id} className="border-border/50 hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4"><div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><IconComp className="h-5 w-5 text-blue-600" /></div>
                    <div className="flex-1 min-w-0"><h4 className="font-medium text-sm truncate">{link.titulo}</h4>{link.descricao && <p className="text-xs text-muted-foreground truncate mt-0.5">{link.descricao}</p>}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => window.open(link.url, "_blank")} className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openLinkDialog(link)} className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover link?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteLink.mutate(link.id)}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div></CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingLink ? "Editar Link" : "Novo Link"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={linkForm.titulo} onChange={e => setLinkForm(p => ({ ...p, titulo: e.target.value }))} /></div>
            <div className="space-y-2"><Label>URL</Label><Input value={linkForm.url} onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Input value={linkForm.descricao} onChange={e => setLinkForm(p => ({ ...p, descricao: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Ícone</Label>
              <Select value={linkForm.icone} onValueChange={v => setLinkForm(p => ({ ...p, icone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{iconeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveLink} disabled={createLink.isPending || updateLink.isPending}>{(createLink.isPending || updateLink.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
