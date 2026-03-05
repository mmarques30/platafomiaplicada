import { useState, useMemo } from "react";
import { Download, Eye, ChevronDown, ChevronUp, Calendar, Shield, DollarSign, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness } from "@/hooks/useDocumentosBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { downloadUrl } from "@/lib/download";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { PageTitle } from "@/components/shared/PageTitle";

const tipoLabel: Record<string, string> = {
  proposta: "Proposta",
  transcricao: "Transcrição",
  anexo: "Anexo",
  solucao: "Solução",
  outro: "Outro",
};

const tipoBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  proposta: "default",
  transcricao: "secondary",
  anexo: "outline",
  solucao: "default",
  outro: "secondary",
};

export default function MeuSistemaDocumentos() {
  const userId = useBusinessUserId();
  const { contrato, reports, isLoading } = useContratosBusiness(userId);
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id);
  const [contratoOpen, setContratoOpen] = useState(true);
  const [viewingReport, setViewingReport] = useState<{ titulo: string; html: string } | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const documentosFiltrados = useMemo(() => {
    let filtered = documentos;
    if (filtroTipo !== "todos") {
      filtered = filtered.filter((d) => d.tipo === filtroTipo);
    }
    return filtered.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
  }, [documentos, filtroTipo]);
  const handleDownloadDoc = async (arquivoUrl: string, titulo: string) => {
    try {
      const { data } = await supabase.storage
        .from("contratos-business")
        .createSignedUrl(arquivoUrl, 3600);

      if (data?.signedUrl) {
        downloadUrl(data.signedUrl, titulo);
      } else {
        toast.error("Não foi possível gerar link de download");
      }
    } catch {
      toast.error("Erro ao baixar documento");
    }
  };

  const handleDownloadReport = (arquivoUrl: string, titulo: string) => {
    downloadUrl(arquivoUrl, titulo);
  };

  if (isLoading || isLoadingDocs) {
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageTitle primary="Documentos" />

      {/* Reports */}
      {reports.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Reports</h2>
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
        </section>
      )}

      {/* Documentos do Projeto - Tabela */}
      {documentos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">Documentos do Projeto</h2>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Filtrar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(tipoLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card className="border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium text-sm">{doc.titulo}</TableCell>
                    <TableCell>
                      <Badge variant={tipoBadgeVariant[doc.tipo] || "secondary"} className="text-[10px]">
                        {tipoLabel[doc.tipo] || doc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(doc.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {doc.arquivo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleDownloadDoc(doc.arquivo_url!, doc.titulo)}
                        >
                          <Download className="h-3 w-3 mr-1" /> Baixar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {documentosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      Nenhum documento encontrado para este filtro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {reports.length === 0 && documentos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Nenhum documento ou report disponível ainda.</p>
          </CardContent>
        </Card>
      )}

      {/* Dados do Contrato - Collapsible */}
      <Collapsible open={contratoOpen} onOpenChange={setContratoOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-foreground hover:bg-accent/50 h-auto py-3">
            <span className="text-lg font-semibold">Dados do Contrato</span>
            {contratoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 border-border/50">
            <CardContent className="p-4 md:p-6 space-y-4">
              {/* Empresa */}
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem label="Empresa" value={contrato.nome_empresa || contrato.razao_social} />
                <InfoItem label="CNPJ" value={contrato.cnpj} />
                <InfoItem label="Representante" value={contrato.representante_nome} />
                <InfoItem label="Email" value={contrato.representante_email} />
                <InfoItem label="Setor" value={contrato.setor_atuacao} />
                <InfoItem label="Endereço" value={contrato.endereco} />
              </div>

              <Separator />

              {/* Datas e Valores */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Início" value={formatDate(contrato.data_inicio)} icon={<Calendar className="h-3.5 w-3.5" />} />
                <InfoItem label="Fim" value={formatDate(contrato.data_fim)} icon={<Calendar className="h-3.5 w-3.5" />} />
                <InfoItem label="Duração" value={`${contrato.tempo_consultoria_meses} meses`} />
                <InfoItem label="Valor" value={formatCurrency(contrato.valor_contrato)} icon={<DollarSign className="h-3.5 w-3.5" />} />
                <InfoItem label="Entrada" value={formatCurrency(contrato.valor_entrada ?? null)} />
                <InfoItem label="Parcelas" value={contrato.numero_parcelas ? `${contrato.numero_parcelas}x ${formatCurrency(contrato.valor_parcela ?? null)}` : "—"} />
              </div>

              <Separator />

              {/* Módulos */}
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

              {/* Garantias */}
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
        </CollapsibleContent>
      </Collapsible>

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
