import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategoriasQA } from "@/hooks/useCategoriasQA";
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
import { useTodasDuvidas } from "@/hooks/useTodasDuvidas";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Search, AlertCircle, CheckCircle2, Clock, Video } from "lucide-react";
import { ResponderDuvidaModal } from "@/components/admin/mentoria/ResponderDuvidaModal";
import type { DuvidaMentoria } from "@/hooks/useDuvidasMentoria";

export default function GerenciarTodasDuvidas() {
  const { duvidas, isLoading } = useTodasDuvidas();
  const { categorias } = useCategoriasQA();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [prioridadeFilter, setPrioridadeFilter] = useState("todas");
  const [qaFilter, setQaFilter] = useState("todas");
  const [categoriaQAFilter, setCategoriaQAFilter] = useState("todas");
  const [selectedDuvida, setSelectedDuvida] = useState<DuvidaMentoria | null>(null);

  const filteredDuvidas = duvidas.filter((duvida) => {
    const matchesSearch =
      duvida.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duvida.profiles.nome_completo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todas" || duvida.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === "todas" || duvida.prioridade === prioridadeFilter;
    const matchesQA = qaFilter === "todas" || 
                      (qaFilter === "publicadas" && duvida.publicar_qa) ||
                      (qaFilter === "nao_publicadas" && !duvida.publicar_qa);
    const matchesCategoriaQA = categoriaQAFilter === "todas" || duvida.categoria_qa_id === categoriaQAFilter;

    return matchesSearch && matchesStatus && matchesPrioridade && matchesQA && matchesCategoriaQA;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "respondida":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "em_analise":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "respondida":
        return "Respondida";
      case "em_analise":
        return "Em Análise";
      default:
        return "Pendente";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "destructive";
      case "alta":
        return "default";
      default:
        return "secondary";
    }
  };

  const getSLAInfo = (prazo_sla: string, status: string, atrasada: boolean | null) => {
    if (status === "respondida") {
      return { text: "Concluída", color: "text-green-600" };
    }

    if (atrasada) {
      return { text: "Atrasada", color: "text-red-600" };
    }

    const horasRestantes = Math.max(
      0,
      Math.floor((new Date(prazo_sla).getTime() - new Date().getTime()) / (1000 * 60 * 60))
    );

    if (horasRestantes <= 6) {
      return { text: `${horasRestantes}h restantes`, color: "text-yellow-600" };
    }

    return { text: `${horasRestantes}h`, color: "text-muted-foreground" };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Carregando dúvidas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          Central de Dúvidas
        </h1>
        <p className="text-muted-foreground">
          Gerencie todas as dúvidas dos mentorados em um só lugar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Dúvidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{duvidas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {duvidas.filter((d) => d.status === "pendente").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {duvidas.filter((d) => d.status === "em_analise").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Respondidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {duvidas.filter((d) => d.status === "respondida").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Q&A Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {duvidas.filter((d) => d.publicar_qa).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou mentorado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="respondida">Respondidas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Prioridades</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={qaFilter} onValueChange={setQaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status Q&A" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os Q&A</SelectItem>
                <SelectItem value="publicadas">Publicadas no Q&A</SelectItem>
                <SelectItem value="nao_publicadas">Não Publicadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoriaQAFilter} onValueChange={setCategoriaQAFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria Q&A" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Categorias</SelectItem>
                {categorias.filter(c => c.ativo).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dúvidas */}
      <Card>
        <CardHeader>
          <CardTitle>Dúvidas ({filteredDuvidas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentorado</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Q&A</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDuvidas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma dúvida encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredDuvidas.map((duvida) => {
                  const slaInfo = getSLAInfo(duvida.prazo_sla, duvida.status, duvida.atrasada);
                  return (
                    <TableRow key={duvida.id}>
                      <TableCell className="font-medium">
                        {duvida.profiles.nome_completo}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{duvida.titulo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(duvida.status)}
                          <span className="text-sm">{getStatusLabel(duvida.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPrioridadeColor(duvida.prioridade)}>
                          {duvida.prioridade.charAt(0).toUpperCase() + duvida.prioridade.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {duvida.publicar_qa ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-primary">
                              {duvida.categorias_qa?.nome || "Q&A"}
                            </Badge>
                            {duvida.video_qa_url && (
                              <Video className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${slaInfo.color}`}>
                          {slaInfo.text}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(duvida.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {duvida.status !== "respondida" && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedDuvida(duvida as any)}
                          >
                            Responder
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedDuvida && (
        <ResponderDuvidaModal
          duvida={selectedDuvida}
          open={!!selectedDuvida}
          onOpenChange={(open) => !open && setSelectedDuvida(null)}
        />
      )}
    </div>
  );
}
