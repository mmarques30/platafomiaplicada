import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCandidaturas } from "@/hooks/useCandidaturasMentoria";
import { CandidaturaDetalhesDrawer } from "@/components/admin/CandidaturaDetalhesDrawer";
import { Eye, Search, UserCheck, Users, TrendingUp, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { adminTheme } from "@/components/admin/adminTheme";

const statusColors: Record<string, string> = {
  nova: "bg-yellow-500",
  em_analise: "bg-blue-500",
  aprovada: "bg-green-500",
  reprovada: "bg-red-500",
  aguardando_contato: "bg-purple-500",
};

const statusLabels: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em Análise",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  aguardando_contato: "Aguardando Contato",
};

export default function GerenciarCandidaturas() {
  const { data: candidaturas, isLoading } = useCandidaturas();
  const [selectedCandidatura, setSelectedCandidatura] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [busca, setBusca] = useState("");

  const candidaturasFiltradas = candidaturas?.filter((c) => {
    const matchStatus = filtroStatus === "todas" || c.status === filtroStatus;
    const matchBusca =
      busca === "" ||
      c.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
      c.email.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const novas7d = candidaturas?.filter(
    (c) =>
      new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length || 0;

  const taxaAprovacao = candidaturas?.length
    ? ((candidaturas.filter((c) => c.status === "aprovada").length /
        candidaturas.length) *
        100).toFixed(1)
    : 0;

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <ClipboardList className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Candidaturas à Mentoria</h1>
        <Badge variant="secondary" className="text-xs">{candidaturas?.length || 0}</Badge>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={adminTheme.card}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Candidaturas
            </CardTitle>
            <Users className={adminTheme.statsIcon} />
          </CardHeader>
          <CardContent>
            <div className={adminTheme.statsValue}>{candidaturas?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className={adminTheme.card}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novas (7d)</CardTitle>
            <UserCheck className={adminTheme.statsIcon} />
          </CardHeader>
          <CardContent>
            <div className={adminTheme.statsValue}>{novas7d}</div>
          </CardContent>
        </Card>

        <Card className={adminTheme.card}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Aprovação
            </CardTitle>
            <TrendingUp className={adminTheme.statsIcon} />
          </CardHeader>
          <CardContent>
            <div className={adminTheme.statsValue}>{taxaAprovacao}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className={adminTheme.card}>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="nova">Nova</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="reprovada">Reprovada</SelectItem>
                <SelectItem value="aguardando_contato">Aguardando Contato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className={adminTheme.card}>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : candidaturasFiltradas && candidaturasFiltradas.length > 0 ? (
            <div className={adminTheme.tableContainer}>
              <Table>
                <TableHeader className={adminTheme.tableHeader}>
                  <TableRow>
                    <TableHead className={adminTheme.tableHeaderCell}>Nome</TableHead>
                    <TableHead className={adminTheme.tableHeaderCell}>Email</TableHead>
                    <TableHead className={adminTheme.tableHeaderCell}>Cargo</TableHead>
                    <TableHead className={adminTheme.tableHeaderCell}>Origem</TableHead>
                    <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                    <TableHead className={adminTheme.tableHeaderCell}>Data</TableHead>
                    <TableHead className={adminTheme.tableHeaderCell}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidaturasFiltradas?.map((candidatura) => (
                    <TableRow key={candidatura.id} className={adminTheme.tableRow}>
                      <TableCell className="font-medium">
                        {candidatura.nome_completo}
                      </TableCell>
                      <TableCell className="text-sm">{candidatura.email}</TableCell>
                      <TableCell className="capitalize text-sm">
                        {candidatura.cargo_atual || "-"}
                      </TableCell>
                      <TableCell>
                        {candidatura.origem_pagina === 'aplique' && candidatura.is_visitante_origem ? (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            Visitante (Aplique)
                          </Badge>
                        ) : candidatura.origem_pagina === 'avance' && candidatura.plano_origem ? (
                          <Badge className={`text-xs ${
                            candidatura.plano_origem === 'academy' ? 'bg-green-500 text-white' :
                            candidatura.plano_origem === 'lab' ? 'bg-blue-500 text-white' :
                            candidatura.plano_origem === 'club' ? 'bg-purple-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {candidatura.plano_origem === 'academy' ? 'Academy (Avance)' :
                             candidatura.plano_origem === 'lab' ? 'Lab (Avance)' :
                             candidatura.plano_origem === 'club' ? 'Club (Avance)' :
                             candidatura.plano_origem === 'skills' ? 'Skills (Avance)' :
                             'Avance'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Direto</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[candidatura.status]} text-white text-xs`}>
                          {statusLabels[candidatura.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(candidatura.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setSelectedCandidatura(candidatura)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma candidatura encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer de Detalhes */}
      <CandidaturaDetalhesDrawer
        candidatura={selectedCandidatura}
        open={!!selectedCandidatura}
        onClose={() => setSelectedCandidatura(null)}
      />
    </div>
  );
}
