import { useState, useEffect } from "react";
import { FileText, ExternalLink, Link2, FolderOpen, HardDrive, Wrench, Video, Table, Loader2, Edit2, Plus, Trash2, StickyNote, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLinksBusiness, LinkBusiness } from "@/hooks/useLinksBusiness";
import { useDocumentosBusiness } from "@/hooks/useDocumentosBusiness";
import { useNotasProjetoBusiness } from "@/hooks/useNotasProjetoBusiness";
import { ArquivosProjetoSection } from "./ArquivosProjetoSection";
import { NotasProjetoSection } from "./NotasProjetoSection";
import { toast } from "sonner";

interface DocumentosBusinessManagerProps {
  contratoId: string;
  userId: string;
  userName?: string;
}

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
  const { documentos } = useDocumentosBusiness(contratoId, false);
  const { links, isLoading: isLoadingLinks, createLink, updateLink, deleteLink } = useLinksBusiness(contratoId);
  const { notas } = useNotasProjetoBusiness(contratoId);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBusiness | null>(null);
  const [linkForm, setLinkForm] = useState({ titulo: "", url: "", descricao: "", icone: "link" });

  const storageKey = `documentos-admin-expandido-${contratoId}`;
  const [documentosExpandido, setDocumentosExpandido] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(storageKey);
    return stored === null ? true : stored === "true";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, String(documentosExpandido));
    }
  }, [storageKey, documentosExpandido]);

  const handleOpenLinkDialog = (link?: LinkBusiness) => {
    if (link) {
      setEditingLink(link);
      setLinkForm({ titulo: link.titulo, url: link.url, descricao: link.descricao || "", icone: link.icone });
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
        await updateLink.mutateAsync({ id: editingLink.id, titulo: linkForm.titulo, url: linkForm.url, descricao: linkForm.descricao || undefined, icone: linkForm.icone });
      } else {
        await createLink.mutateAsync({ contrato_id: contratoId, titulo: linkForm.titulo, url: linkForm.url, descricao: linkForm.descricao || undefined, icone: linkForm.icone });
      }
      setLinkDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar link:", error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try { await deleteLink.mutateAsync(id); } catch (error) { console.error("Erro ao excluir link:", error); }
  };

  const arquivosCount = documentos.filter(d => d.arquivo_url).length;

  return (
    <div className="space-y-4">
      <Collapsible open={documentosExpandido} onOpenChange={setDocumentosExpandido} className="border border-border/60 rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left min-w-0">
                <h2 className="text-sm font-semibold text-foreground">Documentos e Links</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {arquivosCount} {arquivosCount === 1 ? "arquivo" : "arquivos"} · {notas.length} {notas.length === 1 ? "anotação" : "anotações"} · {links.length} {links.length === 1 ? "link" : "links"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {userName && <Badge variant="outline" className="text-xs">{userName}</Badge>}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${documentosExpandido ? "rotate-180" : ""}`} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 pt-2">
          <Tabs defaultValue="arquivos" className="space-y-4">
        <TabsList className="bg-muted/40 border-0 rounded-lg p-1">
          <TabsTrigger value="arquivos" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-3.5 w-3.5" />
            Arquivos ({arquivosCount})
          </TabsTrigger>
          <TabsTrigger value="anotacoes" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <StickyNote className="h-3.5 w-3.5" />
            Anotações ({notas.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-xs rounded-md px-3 py-1.5 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link2 className="h-3.5 w-3.5" />
            Links ({links.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arquivos" className="mt-4">
          <ArquivosProjetoSection contratoId={contratoId} />
        </TabsContent>

        <TabsContent value="anotacoes" className="mt-4">
          <NotasProjetoSection contratoId={contratoId} />
        </TabsContent>

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
                <p className="text-muted-foreground text-sm">Adicione links para Drive, ferramentas e outros recursos</p>
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
                            {link.descricao && <p className="text-xs text-muted-foreground truncate mt-0.5">{link.descricao}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => window.open(link.url, "_blank")} className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenLinkDialog(link)} className="h-8 w-8">
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
                                <AlertDialogDescription>O link "{link.titulo}" será removido da lista.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLink(link.id)}>Remover</AlertDialogAction>
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
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog para adicionar/editar link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Editar Link" : "Novo Link Importante"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-titulo">Título *</Label>
              <Input id="link-titulo" placeholder="Ex: Pasta do Google Drive" value={linkForm.titulo} onChange={(e) => setLinkForm(prev => ({ ...prev, titulo: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL *</Label>
              <Input id="link-url" placeholder="https://..." value={linkForm.url} onChange={(e) => setLinkForm(prev => ({ ...prev, url: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-descricao">Descrição (opcional)</Label>
              <Textarea id="link-descricao" placeholder="Breve descrição do link..." value={linkForm.descricao} onChange={(e) => setLinkForm(prev => ({ ...prev, descricao: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select value={linkForm.icone} onValueChange={(v) => setLinkForm(prev => ({ ...prev, icone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {iconeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2"><opt.Icon className="h-4 w-4" />{opt.label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveLink} disabled={createLink.isPending || updateLink.isPending}>
              {(createLink.isPending || updateLink.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingLink ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
