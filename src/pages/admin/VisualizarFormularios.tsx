import { useState, useEffect } from "react";
import { useFormularios } from "@/hooks/admin/useFormularios";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VisualizarFormularios() {
  const { data: formularios, isLoading, refetch } = useFormularios();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formulários de Diagnóstico</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie os formulários preenchidos pelos mentorados
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === "cards" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "table" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formularios?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Academy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAcademy}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSkills}</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-500">Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBusiness}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Completos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formularios?.filter((f: any) => f.completado).length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {viewMode === "table" ? (
        <DiagnosticosTable onViewDetails={handleViewDetails} />
      ) : (
        <>
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do mentorado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={planoFilter} onValueChange={setPlanoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completo">Completos</SelectItem>
                <SelectItem value="incompleto">Incompletos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Ordenar por" />
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
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredFormularios?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum formulário encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || planoFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Os formulários preenchidos aparecerão aqui"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Formulários Grid */}
          {!isLoading && filteredFormularios && filteredFormularios.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFormularios.map((form: any) => (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">
                          {form.profiles?.nome_completo || form.nome_completo || "Nome não disponível"}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={!!form.completado ? "default" : "secondary"}>
                          {!!form.completado ? "Completo" : "Incompleto"}
                        </Badge>
                        {form.profiles?.plano_mentoria && (
                          <Badge variant="outline" className={getPlanoBadgeColor(form.profiles.plano_mentoria)}>
                            {form.profiles.plano_mentoria}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(form.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Preview de informações */}
                    <div className="space-y-2 text-sm">
                      {form.objetivo_principal && (
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground line-clamp-2">{form.objetivo_principal}</p>
                        </div>
                      )}
                      {form.nivel_ia && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{form.nivel_ia}</Badge>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => handleViewDetails(form)} 
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes Completos
                    </Button>
                  </CardContent>
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
