import { useState } from "react";
import { FileText, Loader2, FolderOpen, ExternalLink, Link2, HardDrive, Wrench, Video, Table, ArrowLeft, StickyNote, Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness } from "@/hooks/useDocumentosBusiness";
import { useLinksBusiness, LinkBusiness } from "@/hooks/useLinksBusiness";
import { useNotasProjetoBusiness } from "@/hooks/useNotasProjetoBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import BusinessReportsCard from "@/components/mentoria/business/BusinessReportsCard";
import { ArquivosProjetoSection } from "@/components/admin/business/ArquivosProjetoSection";
import { NotasProjetoSection } from "@/components/admin/business/NotasProjetoSection";
import { toast } from "sonner";

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

export default function MentoriaDocumentos() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(businessUserId);
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id, false);
  const { links, isLoading: isLoadingLinks, createLink, updateLink, deleteLink } = useLinksBusiness(contrato?.id);
  const { notas, isLoading: isLoadingNotas } = useNotasProjetoBusiness(contrato?.id);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBusiness | null>(null);
  const [linkForm, setLinkForm] = useState({ titulo: "", url: "", descricao: "", icone: "link" });

  const isLoading = isLoadingContrato || isLoadingDocs || isLoadingLinks || isLoadingNotas;

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
        await createLink.mutateAsync({ contrato_id: contrato!.id, titulo: linkForm.titulo, url: linkForm.url, descricao: linkForm.descricao || undefined, icone: linkForm.icone });
      }
      setLinkDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar link:", error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try { await deleteLink.mutateAsync(id); } catch (error) { console.error("Erro ao excluir link:", error); }
  };

  if (isLoading) return <PageSkeleton variant="evolucao" />;

  if (!contrato) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground">Você ainda não possui um contrato ativo no sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const arquivosCount = documentos.filter((d) => d.arquivo_url).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Documentos</h1>
        <p className="text-muted-foreground">Acesse seus arquivos, anotações, links e relatórios.</p>
      </div>

      <Tabs defaultValue="arquivos" className="space-y-4">
        <TabsList className="bg-muted/40 border-0 rounded-lg p-1">
          <TabsTrigger value="arquivos" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            Arquivos ({arquivosCount})
          </TabsTrigger>
          <TabsTrigger value="anotacoes" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <StickyNote className="h-4 w-4" />
            Anotações ({notas.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link2 className="h-4 w-4" />
            Links ({links.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arquivos" className="mt-4">
          <ArquivosProjetoSection contratoId={contrato.id} readOnly />
        </TabsContent>

        <TabsContent value="anotacoes" className="mt-4">
          <NotasProjetoSection contratoId={contrato.id} readOnly />
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => handleOpenLinkDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Link
            </Button>
          </div>

          {links.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum link adicionado</h3>
                <p className="text-muted-foreground">Adicione links importantes como Drive, ferramentas e outros recursos.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const IconComponent = getIconComponent(link.icone);
                return (
                  <Card key={link.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer" onClick={() => window.open(link.url, "_blank")}>
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">{link.titulo}</h3>
                            {link.descricao && <p className="text-sm text-muted-foreground truncate">{link.descricao}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
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

        <TabsContent value="reports" className="mt-4">
          <BusinessReportsCard />
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar/editar link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Editar Link" : "Novo Link"}</DialogTitle>
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
