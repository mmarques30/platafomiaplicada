import { useState } from "react";
import { FileText, Download, Eye, Calendar, Shield, DollarSign, Package, ExternalLink, Link2, FolderOpen, HardDrive, Wrench, Video, Table, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness } from "@/hooks/useDocumentosBusiness";
import { useLinksBusiness } from "@/hooks/useLinksBusiness";
import { useNotasProjetoBusiness } from "@/hooks/useNotasProjetoBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { downloadUrl } from "@/lib/download";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTitle } from "@/components/shared/PageTitle";
import { ArquivosProjetoSection } from "@/components/admin/business/ArquivosProjetoSection";
import { NotasProjetoSection } from "@/components/admin/business/NotasProjetoSection";

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

export default function MeuSistemaDocumentos() {
  const userId = useBusinessUserId();
  const { contrato, reports, isLoading } = useContratosBusiness(userId);
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id, false);
  const { links, isLoading: isLoadingLinks } = useLinksBusiness(contrato?.id);
  const { notas, isLoading: isLoadingNotas } = useNotasProjetoBusiness(contrato?.id);
  const [viewingReport, setViewingReport] = useState<{ titulo: string; html: string } | null>(null);

  const allLoading = isLoading || isLoadingDocs || isLoadingLinks || isLoadingNotas;

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

  const handleDownloadReport = (arquivoUrl: string, titulo: string) => {
    downloadUrl(arquivoUrl, titulo);
  };

  const statCards = [
    { label: "Arquivos", count: arquivosCount, icon: FileText, color: "text-blue-400" },
    { label: "Anotações", count: notas.length, icon: StickyNote, color: "text-amber-400" },
    { label: "Links", count: links.length, icon: Link2, color: "text-emerald-400" },
    { label: "Reports", count: reports.length, icon: FileText, color: "text-purple-400" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageTitle primary="Documentos" />

      {/* Painel 360 — Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[#1a1a2e] border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.count}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
          {links.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum link disponível</h3>
                <p className="text-muted-foreground">Links importantes aparecerão aqui quando forem adicionados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {links.map((link) => {
                const IconComponent = getIconComponent(link.icone);
                return (
                  <Card key={link.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open(link.url, "_blank")}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">{link.titulo}</h3>
                            {link.descricao && <p className="text-sm text-muted-foreground truncate">{link.descricao}</p>}
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
                          onClick={() => handleDownloadReport(report.arquivo_url!, report.titulo)}
                        >
                          <Download className="h-3 w-3 mr-1" /> Baixar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Contrato */}
        <TabsContent value="contrato" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem label="Empresa" value={contrato.nome_empresa || contrato.razao_social} />
                <InfoItem label="CNPJ" value={contrato.cnpj} />
                <InfoItem label="Representante" value={contrato.representante_nome} />
                <InfoItem label="Email" value={contrato.representante_email} />
                <InfoItem label="Setor" value={contrato.setor_atuacao} />
                <InfoItem label="Endereço" value={contrato.endereco} />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Início" value={formatDate(contrato.data_inicio)} icon={<Calendar className="h-3.5 w-3.5" />} />
                <InfoItem label="Fim" value={formatDate(contrato.data_fim)} icon={<Calendar className="h-3.5 w-3.5" />} />
                <InfoItem label="Duração" value={contrato.tempo_consultoria_meses ? `${contrato.tempo_consultoria_meses} meses` : undefined} />
                <InfoItem label="Valor" value={formatCurrency(contrato.valor_contrato)} icon={<DollarSign className="h-3.5 w-3.5" />} />
                <InfoItem label="Entrada" value={formatCurrency(contrato.valor_entrada ?? null)} />
                <InfoItem label="Parcelas" value={contrato.numero_parcelas ? `${contrato.numero_parcelas}x ${formatCurrency(contrato.valor_parcela ?? null)}` : "—"} />
              </div>
              <Separator />
              {contrato.modulos_selecionados && (contrato.modulos_selecionados as any[]).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> Módulos Contratados
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(contrato.modulos_selecionados as any[]).map((m: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{m.nome || m}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {contrato.garantias && (contrato.garantias as string[]).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> Garantias
                  </p>
                  <ul className="text-sm text-foreground space-y-1">
                    {(contrato.garantias as string[]).map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para visualizar report HTML */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewingReport?.titulo}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div
              className="prose prose-sm dark:prose-invert max-w-none p-4"
              dangerouslySetInnerHTML={{ __html: viewingReport?.html || "" }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}
