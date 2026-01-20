import { useState } from "react";
import { useFormularios } from "@/hooks/admin/useFormularios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FormularioDetalhesDrawer } from "@/components/admin/FormularioDetalhesDrawer";
import { DiagnosticosTable } from "@/components/admin/mentoria/DiagnosticosTable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, FileText, User, Calendar, Target, RefreshCw, Eye, LayoutGrid, Table as TableIcon } from "lucide-react";
import { adminTheme } from "@/components/admin/adminTheme";

export default function VisualizarFormularios() {
  const { data: formularios, isLoading, refetch } = useFormularios();
  const [selectedFormulario, setSelectedFormulario] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completo" | "incompleto">("all");
  const [planoFilter, setPlanoFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "name">("date-desc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const handleViewDetails = (form: any) => {
    setSelectedFormulario(form);
    setDrawerOpen(true);
  };

  // Filtrar e ordenar formulários
  const filteredFormularios = formularios
    ?.filter((form: any) => {
      const nomeCompleto = form.profiles?.nome_completo || form.nome_completo || "";
      const plano = form.profiles?.plano_mentoria || "";
      const matchesSearch = nomeCompleto
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const isCompleto = !!form.completado;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completo" && isCompleto) ||
        (statusFilter === "incompleto" && !isCompleto);
      const matchesPlano = planoFilter === "all" || plano === planoFilter;
      return matchesSearch && matchesStatus && matchesPlano;
    })
    ?.sort((a: any, b: any) => {
      if (sortBy === "date-desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "date-asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        const nomeA = a.profiles?.nome_completo || a.nome_completo || "";
        const nomeB = b.profiles?.nome_completo || b.nome_completo || "";
        return nomeA.localeCompare(nomeB);
      }
    });

  // Contadores
  const totalAcademy = formularios?.filter((f: any) => f.profiles?.plano_mentoria === "academy").length || 0;
  const totalSkills = formularios?.filter((f: any) => f.profiles?.plano_mentoria === "skills").length || 0;
  const totalBusiness = formularios?.filter((f: any) => f.profiles?.plano_mentoria === "business").length || 0;
  const totalCompletos = formularios?.filter((f: any) => f.completado).length || 0;

  const getPlanoBadgeColor = (plano: string) => {
    switch (plano) {
      case "academy":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "skills":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "business":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className={adminTheme.page}>
      {/* Header compacto com stats inline */}
      <div className={adminTheme.pageHeader}>
        <div className={adminTheme.pageTitleWrapper}>
          <FileText className={adminTheme.pageIcon} />
          <h1 className={adminTheme.pageTitle}>Formulários de Diagnóstico</h1>
          <Badge variant="secondary" className="text-xs">{formularios?.length || 0}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats inline compactos */}
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-blue-500">Academy: <strong>{totalAcademy}</strong></span>
            <span className="text-orange-500">Skills: <strong>{totalSkills}</strong></span>
            <span className="text-purple-500">Business: <strong>{totalBusiness}</strong></span>
            <span className="text-green-600">Completos: <strong>{totalCompletos}</strong></span>
          </div>
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === "cards" ? "secondary" : "ghost"} 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant={viewMode === "table" ? "secondary" : "ghost"} 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <DiagnosticosTable onViewDetails={handleViewDetails} />
      ) : (
        <>
          {/* Filtros e Busca */}
          <div className={adminTheme.filterBar}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 ${adminTheme.input}`}
              />
            </div>
            
            <Select value={planoFilter} onValueChange={setPlanoFilter}>
              <SelectTrigger className={adminTheme.filterSelect}>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="academy">Academy</SelectItem>
                <SelectItem value="skills">Skills</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className={adminTheme.filterSelect}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completo">Completos</SelectItem>
                <SelectItem value="incompleto">Incompletos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className={adminTheme.filterSelect}>
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Mais recentes</SelectItem>
                <SelectItem value="date-asc">Mais antigos</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className={adminTheme.card}>
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredFormularios?.length === 0 && (
            <div className={adminTheme.emptyState}>
              <FileText className={adminTheme.emptyIcon} />
              <p className={adminTheme.emptyTitle}>Nenhum formulário encontrado</p>
              <p className={adminTheme.emptyDescription}>
                {searchTerm || statusFilter !== "all" || planoFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Os formulários preenchidos aparecerão aqui"}
              </p>
            </div>
          )}

          {/* Formulários Grid */}
          {!isLoading && filteredFormularios && filteredFormularios.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredFormularios.map((form: any) => (
                <Card key={form.id} className={`${adminTheme.card} ${adminTheme.tableRow}`}>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {form.profiles?.nome_completo || form.nome_completo || "Nome não disponível"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <Badge variant={!!form.completado ? "default" : "secondary"} className="text-xs">
                          {!!form.completado ? "Completo" : "Incompleto"}
                        </Badge>
                        {form.profiles?.plano_mentoria && (
                          <Badge variant="outline" className={`text-xs ${getPlanoBadgeColor(form.profiles.plano_mentoria)}`}>
                            {form.profiles.plano_mentoria}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(form.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </div>

                    {form.objetivo_principal && (
                      <div className="flex items-start gap-2">
                        <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground line-clamp-2">{form.objetivo_principal}</p>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleViewDetails(form)} 
                      className="w-full h-8 text-xs"
                      variant="outline"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Drawer de Detalhes */}
      <FormularioDetalhesDrawer
        formulario={selectedFormulario}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
