import { useState, useMemo, useEffect } from "react";
import { FileText, Download, Eye, Calendar, Shield, DollarSign, Package, ExternalLink, Link2, FolderOpen, HardDrive, Wrench, Video, Table, StickyNote, TrendingUp, Clock, Lightbulb, CheckCircle2, Building2, Plus, Edit2, Trash2, Loader2, AlertCircle, Info, ChevronDown } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness } from "@/hooks/useDocumentosBusiness";
import { useLinksBusiness, LinkBusiness } from "@/hooks/useLinksBusiness";
import { useNotasProjetoBusiness } from "@/hooks/useNotasProjetoBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { downloadUrl } from "@/lib/download";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageContainer } from "@/components/shared/PageContainer";
import { MentoriaPageHeader } from "@/components/mentoria/MentoriaPageHeader";
import { ArquivosProjetoSection } from "@/components/admin/business/ArquivosProjetoSection";
import { NotasProjetoSection } from "@/components/admin/business/NotasProjetoSection";
import { cn } from "@/lib/utils";
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

export default function MeuSistemaDocumentos() {
  const userId = useBusinessUserId();
  const { contrato, reports, isLoading, progresso } = useContratosBusiness(userId);
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id, false);
  const { links, isLoading: isLoadingLinks, createLink, updateLink, deleteLink } = useLinksBusiness(contrato?.id);
  const { notas, isLoading: isLoadingNotas } = useNotasProjetoBusiness(contrato?.id);
  const [viewingReport, setViewingReport] = useState<{ titulo: string; html: string } | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBusiness | null>(null);
  const [linkForm, setLinkForm] = useState({ titulo: "", url: "", descricao: "", icone: "link" });
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  const allLoading = isLoading || isLoadingDocs || isLoadingLinks || isLoadingNotas;

  // Estado expandir/recolher seção de documentos (persistido por contrato)
  const storageKey = contrato?.id ? `documentos-projeto-expandido-${contrato.id}` : null;
  const [documentosExpandido, setDocumentosExpandido] = useState(true);
  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) setDocumentosExpandido(saved === "true");
  }, [storageKey]);
  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, String(documentosExpandido));
  }, [storageKey, documentosExpandido]);

  // Progresso temporal do contrato
  const cronograma = useMemo(() => {
    if (!contrato?.data_inicio || !contrato?.data_fim) return null;
    const inicio = new Date(contrato.data_inicio);
    const fim = new Date(contrato.data_fim);
    const hoje = new Date();
    const totalDias = differenceInDays(fim, inicio) || 1;
    const diasPassados = Math.max(0, differenceInDays(hoje, inicio));
    const percentual = Math.min(100, Math.round((diasPassados / totalDias) * 100));
    return { percentual, diasRestantes: Math.max(0, differenceInDays(fim, hoje)) };
  }, [contrato]);

  // Link CRUD handlers
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

  if (allLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhum contrato ativo encontrado.
      </div>
    );
  }

  const formatDate = (d: string | null) =>
    d ? format(new Date(d), "dd/MM/yyyy", { locale: ptBR }) : "—";

  const formatCurrency = (v: number | null) =>
    v != null ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

  const arquivosCount = documentos.filter((d) => d.arquivo_url).length;
  const totalItens = arquivosCount + notas.length + links.length;

  const handleDownloadReport = async (arquivoUrl: string, titulo: string, reportId: string) => {
    try {
      setDownloadingReportId(reportId);
      let urlFinal = arquivoUrl;
      // Se não for URL absoluta, gerar signed URL do bucket privado
      if (!/^https?:\/\//i.test(arquivoUrl)) {
        const path = arquivoUrl.replace(/^\/+/, "");
        const { data, error } = await supabase
          .storage
          .from("contratos-business")
          .createSignedUrl(path, 3600);
        if (error || !data?.signedUrl) {
          throw error || new Error("Falha ao gerar URL de download");
        }
        urlFinal = data.signedUrl;
      }
      await downloadUrl(urlFinal, titulo);
    } catch (err) {
      console.error("Erro ao baixar report:", err);
      toast.error("Não foi possível baixar este report.");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const statCards = [
    { label: "Arquivos", count: arquivosCount, icon: FileText },
    { label: "Anotações", count: notas.length, icon: StickyNote },
    { label: "Links", count: links.length, icon: Link2 },
    { label: "Reports", count: reports.length, icon: FileText },
  ];

  // Saúde do projeto (progresso vs cronograma)
  const saudeProjeto: { label: string; classe: string } = (() => {
    if (!cronograma) return { label: "Sem cronograma definido", classe: "bg-muted text-muted-foreground border-transparent" };
    if (progresso.percentual >= cronograma.percentual) return { label: "No prazo", classe: "bg-emerald-500/15 text-emerald-600 border-transparent" };
    if (progresso.percentual >= cronograma.percentual - 15) return { label: "Atenção", classe: "bg-amber-500/15 text-amber-600 border-transparent" };
    return { label: "Atrasado", classe: "bg-destructive/15 text-destructive border-transparent" };
  })();

  return (
    <PageContainer>
      <MentoriaPageHeader
        eyebrow="Meu Sistema"
        primary="Documentos"
        secondary="do projeto"
        backTo="/meu-sistema"
        description="Arquivos, anotações, links, reports e contrato em um só lugar."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-brand-cream-soft border border-brand-hairline shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand-strong/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-brand-strong" />
              </div>
              <div>
                <p className="text-2xl font-serif-display text-foreground tabular-nums leading-tight">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Collapsible open={documentosExpandido} onOpenChange={setDocumentosExpandido} className="bg-brand-cream-soft border border-brand-hairline rounded-2xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-cream/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-brand-strong/10 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-[18px] w-[18px] text-brand-strong" />
              </div>
              <div className="text-left min-w-0">
                <h2 className="font-serif-display text-lg text-foreground leading-tight tracking-tight">Documentos do Projeto</h2>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {arquivosCount} {arquivosCount === 1 ? "arquivo" : "arquivos"} · {notas.length} {notas.length === 1 ? "anotação" : "anotações"} · {links.length} {links.length === 1 ? "link" : "links"} · {reports.length} {reports.length === 1 ? "report" : "reports"}
                </p>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${documentosExpandido ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-5 pb-5 pt-1 border-t border-brand-hairline">
        <Tabs defaultValue="arquivos" className="space-y-4 mt-4">
          <TabsList className="inline-flex items-center gap-0.5 rounded-full bg-brand-cream/60 border border-brand-hairline p-1 h-auto flex-wrap">
          <TabsTrigger value="arquivos" className="text-sm rounded-full px-4 py-1.5 gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm transition-colors">
            <FileText className="h-3.5 w-3.5" />
            Arquivos ({arquivosCount})
          </TabsTrigger>
          <TabsTrigger value="anotacoes" className="text-sm rounded-full px-4 py-1.5 gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm transition-colors">
            <StickyNote className="h-3.5 w-3.5" />
            Anotações ({notas.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-sm rounded-full px-4 py-1.5 gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm transition-colors">
            <Link2 className="h-3.5 w-3.5" />
            Links ({links.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm rounded-full px-4 py-1.5 gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm transition-colors">
            <FileText className="h-3.5 w-3.5" />
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="contrato" className="text-sm rounded-full px-4 py-1.5 gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm transition-colors">
            <Shield className="h-3.5 w-3.5" />
            Contrato
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arquivos" className="mt-4">
          <ArquivosProjetoSection contratoId={contrato.id} />
        </TabsContent>

        <TabsContent value="anotacoes" className="mt-4">
          <NotasProjetoSection contratoId={contrato.id} />
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

        <TabsContent value="reports" className="space-y-4 mt-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum report disponível</h3>
                <p className="text-muted-foreground">Reports do projeto aparecerão aqui quando forem gerados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {reports.map((report) => (
                <Card key={report.id} className="border-border/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{report.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(report.data_envio)}
                          {report.periodo_referencia && ` · ${report.periodo_referencia}`}
                        </p>
                      </div>
                      {report.gerado_por_ia && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">IA</Badge>
                      )}
                    </div>
                    {report.resumo_executivo && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{report.resumo_executivo}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      {report.conteudo_html && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setViewingReport({ titulo: report.titulo, html: report.conteudo_html! })}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Ver
                        </Button>
                      )}
                      {report.arquivo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          disabled={downloadingReportId === report.id}
                          onClick={() => handleDownloadReport(report.arquivo_url!, report.titulo, report.id)}
                        >
                          {downloadingReportId === report.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3 mr-1" />
                          )}
                          Baixar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contrato" className="mt-4 space-y-4">
          {/* Dados da Empresa */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem label="Empresa" value={contrato.nome_empresa || contrato.razao_social} />
                <InfoItem label="CNPJ" value={contrato.cnpj} />
                <InfoItem label="Representante" value={contrato.representante_nome} />
                <InfoItem label="Email" value={contrato.representante_email} />
                <InfoItem label="Setor" value={contrato.setor_atuacao} />
                <InfoItem label="Endereço" value={contrato.endereco} />
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Contrato */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Detalhes do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Início" value={formatDate(contrato.data_inicio)} />
                <InfoItem label="Fim" value={formatDate(contrato.data_fim)} />
                <InfoItem label="Duração" value={contrato.tempo_consultoria_meses ? `${contrato.tempo_consultoria_meses} meses` : undefined} />
                <InfoItem label="Valor" value={formatCurrency(contrato.valor_contrato)} />
                <InfoItem label="Entrada" value={formatCurrency(contrato.valor_entrada ?? null)} />
                <InfoItem label="Parcelas" value={contrato.numero_parcelas ? `${contrato.numero_parcelas}x ${formatCurrency(contrato.valor_parcela ?? null)}` : "—"} />
              </div>
            </CardContent>
          </Card>

          {/* Módulos e Garantias */}
          {((contrato.modulos_selecionados && (contrato.modulos_selecionados as any[]).length > 0) ||
            (contrato.garantias && (contrato.garantias as string[]).length > 0)) && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Módulos e Garantias
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {contrato.modulos_selecionados && (contrato.modulos_selecionados as any[]).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Módulos Contratados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(contrato.modulos_selecionados as any[]).map((m: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{m.nome || m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {contrato.garantias && (contrato.garantias as string[]).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Garantias</p>
                    <ul className="text-sm text-foreground space-y-1">
                      {(contrato.garantias as string[]).map((g, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
        </CollapsibleContent>
      </Collapsible>

      {/* Painel Estratégico — versão enxuta: progresso, saúde, timeline e 3 métricas.
          Sem gráficos redundantes (radial / donut / atividade / painel de alertas),
          porque os mesmos números já aparecem nos stat cards e badges acima. */}
      <Card className="bg-brand-cream-soft border border-brand-hairline shadow-none">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-strong mb-2">
                Painel Estratégico
              </p>
              <h3 className="font-serif-display text-2xl md:text-3xl text-foreground leading-tight tracking-tight">
                {progresso.percentual}% das entregas concluídas
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                {progresso.modulosConcluidos} de {(contrato.entregas_esperadas || []).length} marcos do projeto
              </p>
            </div>
            <span className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap",
              saudeProjeto.label === "No prazo" && "bg-brand-strong/10 text-brand-strong border-brand-strong/25",
              saudeProjeto.label === "Atenção" && "bg-amber-500/10 text-amber-700 border-amber-500/25",
              saudeProjeto.label === "Atrasado" && "bg-destructive/10 text-destructive border-destructive/25",
              saudeProjeto.label === "Sem cronograma definido" && "bg-muted text-muted-foreground border-transparent"
            )}>
              {saudeProjeto.label}
            </span>
          </div>

          {cronograma && (
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-2">
                <span>Início</span>
                <span>Hoje · {cronograma.percentual}% do tempo</span>
                <span>Fim · {formatDate(contrato.data_fim)}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-brand-hairline overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-strong/25 rounded-full transition-[width] duration-700"
                  style={{ width: `${cronograma.percentual}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-brand-strong rounded-full transition-[width] duration-700"
                  style={{ width: `${progresso.percentual}%` }}
                />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-strong" />
                  <span className="text-muted-foreground">Entregas {progresso.percentual}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-strong/30" />
                  <span className="text-muted-foreground">Cronograma {cronograma.percentual}%</span>
                </div>
                {(() => {
                  const delta = progresso.percentual - cronograma.percentual;
                  return (
                    <span className={cn(
                      "ml-auto text-xs font-medium tabular-nums",
                      delta >= 0 ? "text-brand-strong" : delta >= -15 ? "text-amber-700" : "text-destructive"
                    )}>
                      {delta >= 0 ? "+" : ""}{delta}% vs cronograma
                    </span>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2 border-t border-brand-hairline">
            <StrategicMetric
              label="Prazo restante"
              value={cronograma ? `${cronograma.diasRestantes}` : "—"}
              suffix={cronograma ? "dias" : undefined}
            />
            <StrategicMetric
              label="Entregas concluídas"
              value={`${progresso.modulosConcluidos}`}
              suffix={`de ${(contrato.entregas_esperadas || []).length}`}
            />
            <StrategicMetric
              label="Documentos no projeto"
              value={String(totalItens)}
              suffix={totalItens === 1 ? "item" : "itens"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar report HTML */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewingReport?.titulo}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div
              className="prose prose-sm dark:prose-invert max-w-none p-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewingReport?.html || "") }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
    </PageContainer>
  );
}

function InfoItem({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</p>
    </div>
  );
}

function StrategicMetric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">{label}</p>
      <p className="flex items-baseline gap-1.5">
        <span className="font-serif-display text-2xl md:text-3xl text-foreground tabular-nums leading-none">
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </p>
    </div>
  );
}
