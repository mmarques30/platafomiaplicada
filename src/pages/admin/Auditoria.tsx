import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Auditoria() {
  const [tabelaFiltro, setTabelaFiltro] = useState<string>("todas");
  const [operacaoFiltro, setOperacaoFiltro] = useState<string>("todas");

  const { data: historico, isLoading, refetch } = useQuery({
    queryKey: ["historico-completo", tabelaFiltro, operacaoFiltro],
    queryFn: async () => {
      let query = supabase
        .from("auditoria_conteudo")
        .select(`
          *,
          profiles:user_id(nome_completo)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (tabelaFiltro !== "todas") {
        query = query.eq("tabela", tabelaFiltro);
      }

      if (operacaoFiltro !== "todas") {
        query = query.eq("operacao", operacaoFiltro);
      }

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
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Auditoria do Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Histórico completo de alterações no sistema
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Tabela</label>
              <Select value={tabelaFiltro} onValueChange={setTabelaFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="videos">Vídeos</SelectItem>
                  <SelectItem value="trilhas">Trilhas</SelectItem>
                  <SelectItem value="modulos">Módulos</SelectItem>
                  <SelectItem value="tarefas_mentoria">Tarefas</SelectItem>
                  <SelectItem value="objetivos_mentoria">Objetivos</SelectItem>
                  <SelectItem value="formularios_customizados">Formulários</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Operação</label>
              <Select value={operacaoFiltro} onValueChange={setOperacaoFiltro}>
                <SelectTrigger>
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
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={exportarCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Data/Hora</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Usuário</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tabela</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Operação</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Carregando...
                      </td>
                    </tr>
                  ) : historico && historico.length > 0 ? (
                    historico.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(item.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(item.profiles as any)?.nome_completo || "Sistema"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{item.tabela}</td>
                        <td className="px-4 py-3">
                          <OperacaoBadge operacao={item.operacao} />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-md truncate">
                          {item.campos_alterados && item.campos_alterados.length > 0 ? (
                            <span>Campos: {item.campos_alterados.join(", ")}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
  );
}

interface OperacaoBadgeProps {
  operacao: string;
}

function OperacaoBadge({ operacao }: OperacaoBadgeProps) {
  const styles: Record<string, string> = {
    INSERT: "bg-success/10 text-success",
    UPDATE: "bg-primary/10 text-primary",
    DELETE: "bg-destructive/10 text-destructive",
    PASSWORD_CHANGE: "bg-warning/10 text-warning",
  };

  const labels: Record<string, string> = {
    INSERT: "Criação",
    UPDATE: "Atualização",
    DELETE: "Exclusão",
    PASSWORD_CHANGE: "Senha",
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[operacao] || "bg-muted text-muted-foreground"}`}>
      {labels[operacao] || operacao}
    </span>
  );
}
