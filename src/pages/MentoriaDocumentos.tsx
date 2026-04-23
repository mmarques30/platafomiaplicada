import { useState, useMemo, useEffect } from "react";
import { FileText, Download, Eye, Calendar, Shield, DollarSign, Package, ExternalLink, Link2, FolderOpen, HardDrive, Wrench, Video, Table, StickyNote, TrendingUp, Clock, Lightbulb, CheckCircle2, Building2, Loader2, Plus, Edit2, Trash2, AlertCircle, Info, ChevronDown } from "lucide-react";
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
import { PageTitle } from "@/components/shared/PageTitle";
import { ArquivosProjetoSection } from "@/components/admin/business/ArquivosProjetoSection";
import { NotasProjetoSection } from "@/components/admin/business/NotasProjetoSection";
import { ProjetoResumoDashboard } from "@/components/business/ProjetoResumoDashboard";
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
  const businessUserId = useBusinessUserId();
  const { contrato, reports, isLoading, progresso } = useContratosBusiness(businessUserId);
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id, false);
  const { links, isLoading: isLoadingLinks, createLink, updateLink, deleteLink } = useLinksBusiness(contrato?.id);
  const { notas, isLoading: isLoadingNotas } = useNotasProjetoBusiness(contrato?.id);

  const [viewingReport, setViewingReport] = useState<{ titulo: string; html: string } | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkBusiness | null>(null);
  const [linkForm, setLinkForm] = useState({ titulo: "", url: "", descricao: "", icone: "link" });

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

  // Atividade recente
  const atividadeRecente = useMemo(() => {
    const items: { tipo: string; titulo: string; data: string; icon: typeof FileText }[] = [];
    documentos.filter(d => d.arquivo_url).forEach(d => items.push({ tipo: "Arquivo", titulo: d.titulo, data: d.created_at || "", icon: FileText }));
    notas.forEach(n => items.push({ tipo: "Anotação", titulo: n.titulo, data: n.created_at || "", icon: StickyNote }));
    links.forEach(l => items.push({ tipo: "Link", titulo: l.titulo, data: l.created_at || "", icon: Link2 }));
    return items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 4);
  }, [documentos, notas, links]);

  // Cronograma
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

  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  const handleDownloadReport = async (arquivoUrl: string, titulo: string, reportId: string) => {
    try {
      setDownloadingReportId(reportId);
      let urlFinal = arquivoUrl;
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

  // Insights dinâmicos (Painel do Projeto)
  const insights: { label: string; valor: string; tipo: "info" | "warning" | "success" }[] = [];
  if (progresso.percentual === 100) {
    insights.push({ label: "Todas as entregas concluídas", valor: "100%", tipo: "success" });
  } else if (progresso.percentual > 0) {
    insights.push({ label: "Entregas concluídas", valor: `${progresso.percentual}%`, tipo: "info" });
  } else if ((contrato.entregas_esperadas || []).length > 0) {
    insights.push({ label: "Nenhuma entrega concluída", valor: "0%", tipo: "warning" });
  }
  if (cronograma) {
    if (cronograma.diasRestantes <= 30) {
      insights.push({ label: "Prazo se aproximando", valor: `${cronograma.diasRestantes} dias`, tipo: "warning" });
    } else {
      insights.push({ label: "Prazo restante", valor: `${cronograma.diasRestantes} dias`, tipo: "info" });
    }
  }
  insights.push({ label: "Documentos no projeto", valor: String(totalItens), tipo: "info" });
  if (notas.length === 0) {
    insights.push({ label: "Nenhuma anotação registrada", valor: "Registre decisões", tipo: "warning" });
  }
  if (reports && reports.length > 0) {
    insights.push({ label: "Reports gerados", valor: String(reports.length), tipo: "success" });
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageTitle primary="Documentos" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[hsl(var(--chart-4))] border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.count}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                <h2 className="text-sm font-semibold text-foreground">Documentos do Projeto</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {arquivosCount} {arquivosCount === 1 ? "arquivo" : "arquivos"} · {notas.length} {notas.length === 1 ? "anotação" : "anotações"} · {links.length} {links.length === 1 ? "link" : "links"} · {reports.length} {reports.length === 1 ? "report" : "reports"}
                </p>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${documentosExpandido ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 pt-2">
        <Tabs defaultValue="arquivos" className="space-y-4">
          <TabsList className="bg-muted/40 border-0 rounded-lg p-1 flex-wrap h-auto">
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
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="contrato" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
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

      {/* Resumo do Projeto */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Evolução das Entregas */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                Evolução das Entregas
              </div>
              {cronograma && (
                <Badge variant="outline" className="gap-1 text-[10px] font-medium">
                  <Clock className="h-3 w-3" />
                  {cronograma.diasRestantes}d
                </Badge>
              )}
            </div>
            <Badge className={`text-[11px] font-medium ${saudeProjeto.classe}`}>
              {saudeProjeto.label}
            </Badge>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progresso.modulosConcluidos} de {(contrato.entregas_esperadas || []).length} concluídas</span>
                <span className="font-medium text-foreground">{progresso.percentual}%</span>
              </div>
              <ProgressBar value={progresso.percentual} color="hsl(var(--primary))" height={8} />
            </div>
            {cronograma && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Cronograma</span>
                  <span className="font-medium text-foreground">{cronograma.percentual}%</span>
                </div>
                <ProgressBar value={cronograma.percentual} color="hsl(var(--chart-4))" height={6} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Atividade Recente
            </div>
            {atividadeRecente.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
                <Clock className="h-6 w-6 text-muted-foreground/40 mb-1" />
                <p className="text-xs font-medium text-foreground">Nenhuma atividade ainda</p>
                <p className="text-[11px] text-muted-foreground">Adicione um arquivo, anotação ou link para começar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {atividadeRecente.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{item.titulo}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.tipo} · {item.data ? format(new Date(item.data), "dd/MM HH:mm", { locale: ptBR }) : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel do Projeto */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Painel do Projeto
            </div>
            {insights.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Adicione itens ao projeto para gerar insights.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {insights.map((item, i) => {
                  const Icon = item.tipo === "success" ? CheckCircle2 : item.tipo === "warning" ? AlertCircle : Info;
                  const cor = item.tipo === "success" ? "text-emerald-500" : item.tipo === "warning" ? "text-amber-500" : "text-sky-500";
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${cor}`} />
                        <span className="text-xs text-foreground truncate">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground flex-shrink-0">{item.valor}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
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
