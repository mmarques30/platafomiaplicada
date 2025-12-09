import { useState, useMemo } from "react";
import { useTodasAulas } from "@/hooks/useCalendarioAulas";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type StatusFilter = "todas" | "ativas" | "inativas" | "passadas" | "futuras";
type TipoFilter = "todos" | "aula_ao_vivo" | "qa" | "outro";

export function CalendarioVisaoTabela() {
  const { data: aulas, isLoading } = useTodasAulas();
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFilter>("todas");
  const [tipoFiltro, setTipoFiltro] = useState<TipoFilter>("todos");
  const [mesFiltro, setMesFiltro] = useState("todos");
  const [aulaDetalhes, setAulaDetalhes] = useState<any>(null);

  const aulasFiltradas = useMemo(() => {
    if (!aulas) return [];

    return aulas.filter((aula) => {
      // Filtro de busca por tema
      const matchBusca = aula.tema.toLowerCase().includes(busca.toLowerCase());
      if (!matchBusca) return false;

      // Filtro de status
      if (statusFiltro !== "todas") {
        const dataAula = aula.data_aula ? parseISO(aula.data_aula) : null;
        
        switch (statusFiltro) {
          case "ativas":
            if (!aula.ativo) return false;
            break;
          case "inativas":
            if (aula.ativo) return false;
            break;
          case "passadas":
            if (!dataAula || !isPast(dataAula)) return false;
            break;
          case "futuras":
            if (!dataAula || !isFuture(dataAula)) return false;
            break;
        }
      }

      // Filtro de mês
      if (mesFiltro !== "todos" && aula.data_aula) {
        const mesAula = format(parseISO(aula.data_aula), "MM");
        if (mesAula !== mesFiltro) return false;
      }

      // Filtro de tipo de evento
      if (tipoFiltro !== "todos") {
        if (aula.tipo_evento !== tipoFiltro) return false;
      }

      return true;
    });
  }, [aulas, busca, statusFiltro, mesFiltro, tipoFiltro]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const meses = [
    { value: "todos", label: "Todos os meses" },
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const getStatusInfo = (aula: any) => {
    if (!aula.data_aula) {
      return {
        label: aula.ativo ? "Ativa" : "Inativa",
        color: aula.ativo ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
        icon: aula.ativo ? CheckCircle2 : XCircle,
      };
    }

    const dataAula = parseISO(aula.data_aula);
    const isPassada = isPast(dataAula);

    if (isPassada) {
      return {
        label: "Passada",
        color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
        icon: Clock,
      };
    }

    return {
      label: aula.ativo ? "Programada" : "Inativa",
      color: aula.ativo ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
      icon: aula.ativo ? Clock : XCircle,
    };
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tema..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as StatusFilter)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="ativas">Ativas</SelectItem>
              <SelectItem value="inativas">Inativas</SelectItem>
              <SelectItem value="passadas">Passadas</SelectItem>
              <SelectItem value="futuras">Futuras</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as TipoFilter)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="aula_ao_vivo">Aula ao Vivo</SelectItem>
              <SelectItem value="qa">Q&A</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mesFiltro} onValueChange={setMesFiltro}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tema</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aulasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum encontro encontrado com os filtros aplicados
                </TableCell>
              </TableRow>
            ) : (
              aulasFiltradas.map((aula) => {
                const statusInfo = getStatusInfo(aula);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={aula.id}>
                    <TableCell className="font-medium max-w-md">
                      <div>
                        <div className="text-foreground">{aula.tema}</div>
                        {aula.descricao && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {aula.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {aula.data_aula
                        ? format(parseISO(aula.data_aula), "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell>{aula.horario || "-"}</TableCell>
                    <TableCell>
                      {aula.tipo_evento ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap",
                            aula.tipo_evento === "aula_ao_vivo" && "bg-primary/10 text-primary",
                            aula.tipo_evento === "qa" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
                            aula.tipo_evento === "outro" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                          )}
                        >
                          {aula.tipo_evento === "aula_ao_vivo" && "Aula ao Vivo"}
                          {aula.tipo_evento === "qa" && "Q&A"}
                          {aula.tipo_evento === "outro" && "Outro"}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
                          statusInfo.color
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAulaDetalhes(aula)}
                        title="Ver detalhes"
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!aulaDetalhes} onOpenChange={() => setAulaDetalhes(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{aulaDetalhes?.tema}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Data:</span>
                <span className="ml-2 font-medium">
                  {aulaDetalhes?.data_aula
                    ? format(parseISO(aulaDetalhes.data_aula), "dd/MM/yyyy", { locale: ptBR })
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Horário:</span>
                <span className="ml-2 font-medium">{aulaDetalhes?.horario || "-"}</span>
              </div>
            </div>

            {aulaDetalhes?.tipo_evento && (
              <div>
                <span className="text-muted-foreground text-sm">Tipo:</span>
                <span
                  className={cn(
                    "ml-2 px-2.5 py-1 text-xs font-medium rounded-full",
                    aulaDetalhes.tipo_evento === "aula_ao_vivo" && "bg-primary/10 text-primary",
                    aulaDetalhes.tipo_evento === "qa" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
                    aulaDetalhes.tipo_evento === "outro" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {aulaDetalhes.tipo_evento === "aula_ao_vivo" && "Aula ao Vivo"}
                  {aulaDetalhes.tipo_evento === "qa" && "Q&A"}
                  {aulaDetalhes.tipo_evento === "outro" && "Outro"}
                </span>
              </div>
            )}

            {aulaDetalhes?.descricao && (
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Descrição:</span>
                <p className="text-foreground whitespace-pre-line bg-muted/50 p-3 rounded-lg">
                  {aulaDetalhes.descricao}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
