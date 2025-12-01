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
import { Eye, Search, UserCheck, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidaturas à Mentoria</h1>
          <p className="text-muted-foreground">
            Gerencie todas as candidaturas recebidas
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Candidaturas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidaturas?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Novas (7d)</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{novas7d}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Aprovação
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxaAprovacao}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="nova">Nova</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="reprovada">Reprovada</SelectItem>
                  <SelectItem value="aguardando_contato">
                    Aguardando Contato
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : candidaturasFiltradas && candidaturasFiltradas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidaturasFiltradas?.map((candidatura) => (
                    <TableRow key={candidatura.id}>
                      <TableCell className="font-medium">
                        {candidatura.nome_completo}
                      </TableCell>
                      <TableCell>{candidatura.email}</TableCell>
                      <TableCell className="capitalize">
                        {candidatura.cargo_atual || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            statusColors[candidatura.status]
                          } text-white`}
                        >
                          {statusLabels[candidatura.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(candidatura.created_at),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCandidatura(candidatura)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
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
