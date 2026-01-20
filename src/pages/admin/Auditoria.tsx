import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, RefreshCw, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { adminTheme } from "@/components/admin/adminTheme";

export default function Auditoria() {
  const [tabelaFiltro, setTabelaFiltro] = useState<string>("todas");
  const [operacaoFiltro, setOperacaoFiltro] = useState<string>("todas");

  const { data: historico, isLoading, refetch } = useQuery({
    queryKey: ["historico-completo", tabelaFiltro, operacaoFiltro],
    queryFn: async () => {
      let query = supabase
        .from("auditoria_conteudo")
        .select(`*, profiles:user_id(nome_completo)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (tabelaFiltro !== "todas") query = query.eq("tabela", tabelaFiltro);
      if (operacaoFiltro !== "todas") query = query.eq("operacao", operacaoFiltro);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const exportarCSV = () => {
    if (!historico || historico.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const headers = ["Data/Hora", "Usuário", "Tabela", "Operação", "Campos Alterados"];
    const rows = historico.map(item => [
      format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      (item.profiles as any)?.nome_completo || "Sistema",
      item.tabela,
      item.operacao,
      item.campos_alterados?.join(", ") || "-"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exportado com sucesso!");
  };

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <History className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Auditoria do Sistema</h1>
        <Badge variant="secondary" className="text-xs">{historico?.length || 0} registros</Badge>
      </div>

      <Card className={adminTheme.card}>
        <div className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium mb-2 block text-muted-foreground">Tabela</label>
              <Select value={tabelaFiltro} onValueChange={setTabelaFiltro}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="videos">Vídeos</SelectItem>
                  <SelectItem value="trilhas">Trilhas</SelectItem>
                  <SelectItem value="modulos">Módulos</SelectItem>
                  <SelectItem value="tarefas_mentoria">Tarefas</SelectItem>
                  <SelectItem value="formularios_customizados">Formulários</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium mb-2 block text-muted-foreground">Operação</label>
              <Select value={operacaoFiltro} onValueChange={setOperacaoFiltro}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="INSERT">Criação</SelectItem>
                  <SelectItem value="UPDATE">Atualização</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => refetch()}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" className="h-9" onClick={exportarCSV}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                CSV
              </Button>
            </div>
          </div>

          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>Data/Hora</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Usuário</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Tabela</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Operação</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                  </TableRow>
                ) : historico && historico.length > 0 ? (
                  historico.map((item) => (
                    <TableRow key={item.id} className={adminTheme.tableRow}>
                      <TableCell className="text-xs">
                        {format(new Date(item.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {(item.profiles as any)?.nome_completo || "Sistema"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{item.tabela}</TableCell>
                      <TableCell><OperacaoBadge operacao={item.operacao} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                        {item.campos_alterados?.length ? `Campos: ${item.campos_alterados.join(", ")}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}

function OperacaoBadge({ operacao }: { operacao: string }) {
  const styles: Record<string, string> = {
    INSERT: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = { INSERT: "Criação", UPDATE: "Atualização", DELETE: "Exclusão" };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[operacao] || "bg-muted text-muted-foreground"}`}>
      {labels[operacao] || operacao}
    </span>
  );
}
