import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Search, Download, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type PasswordResetStatus = "solicitado" | "link_enviado" | "senha_alterada" | "email_nao_encontrado" | "conta_inativa" | "erro_envio";

interface PasswordResetRequest {
  id: string;
  email: string;
  user_id: string | null;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  completed_at: string | null;
  erro_mensagem: string | null;
  profiles?: {
    nome_completo: string;
  } | null;
}

const statusConfig: Record<PasswordResetStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
  solicitado: { label: "Solicitado", variant: "secondary", icon: Clock },
  link_enviado: { label: "Link Enviado", variant: "default", icon: Mail },
  senha_alterada: { label: "Senha Alterada", variant: "default", icon: CheckCircle },
  email_nao_encontrado: { label: "Email não encontrado", variant: "destructive", icon: XCircle },
  conta_inativa: { label: "Conta Inativa", variant: "destructive", icon: AlertCircle },
  erro_envio: { label: "Erro no Envio", variant: "destructive", icon: XCircle },
};

export default function HistoricoSenhas() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroEmail, setFiltroEmail] = useState("");

  const { data: solicitacoes, isLoading, refetch } = useQuery({
    queryKey: ["password-reset-requests", filtroStatus, filtroEmail],
    queryFn: async () => {
      let query = supabase
        .from("password_reset_requests")
        .select(`
          *,
          profiles:user_id(nome_completo)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filtroStatus !== "todos") {
        query = query.eq("status", filtroStatus);
      }

      if (filtroEmail) {
        query = query.ilike("email", `%${filtroEmail}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PasswordResetRequest[];
    },
  });

  const exportarCSV = () => {
    if (!solicitacoes?.length) return;

    const headers = ["Data/Hora", "Email", "Usuário", "Status", "Erro", "Concluído em"];
    const rows = solicitacoes.map((s) => [
      format(new Date(s.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      s.email,
      s.profiles?.nome_completo || "-",
      statusConfig[s.status as PasswordResetStatus]?.label || s.status,
      s.erro_mensagem || "-",
      s.completed_at ? format(new Date(s.completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historico-senhas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Estatísticas
  const stats = {
    total: solicitacoes?.length || 0,
    concluidas: solicitacoes?.filter((s) => s.status === "senha_alterada").length || 0,
    pendentes: solicitacoes?.filter((s) => s.status === "link_enviado").length || 0,
    falhas: solicitacoes?.filter((s) => ["email_nao_encontrado", "conta_inativa", "erro_envio"].includes(s.status)).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Key className="h-6 w-6" />
            Histórico de Recuperação de Senhas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe todas as solicitações de recuperação de senha
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!solicitacoes?.length}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de solicitações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
                <p className="text-xs text-muted-foreground">Senhas alteradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Links enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.falhas}</p>
                <p className="text-xs text-muted-foreground">Falhas/Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={filtroEmail}
                onChange={(e) => setFiltroEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="solicitado">Solicitado</SelectItem>
                <SelectItem value="link_enviado">Link Enviado</SelectItem>
                <SelectItem value="senha_alterada">Senha Alterada</SelectItem>
                <SelectItem value="email_nao_encontrado">Email não encontrado</SelectItem>
                <SelectItem value="conta_inativa">Conta Inativa</SelectItem>
                <SelectItem value="erro_envio">Erro no Envio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Concluído em</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : solicitacoes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                solicitacoes?.map((solicitacao) => {
                  const config = statusConfig[solicitacao.status as PasswordResetStatus] || {
                    label: solicitacao.status,
                    variant: "secondary" as const,
                    icon: Clock,
                  };
                  const StatusIcon = config.icon;

                  return (
                    <TableRow key={solicitacao.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(solicitacao.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{solicitacao.email}</TableCell>
                      <TableCell>{solicitacao.profiles?.nome_completo || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {solicitacao.completed_at
                          ? format(new Date(solicitacao.completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {solicitacao.erro_mensagem || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
