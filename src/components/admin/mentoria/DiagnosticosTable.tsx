import { useState } from "react";
import { useFormularios } from "@/hooks/admin/useFormularios";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Search, Trash2 } from "lucide-react";
import { FormularioDetalhesDrawer } from "@/components/admin/FormularioDetalhesDrawer";

interface DiagnosticosTableProps {
  onViewDetails?: (formulario: any) => void;
}

export function DiagnosticosTable({ onViewDetails }: DiagnosticosTableProps) {
  const { data: formularios, isLoading } = useFormularios();
  const { deletarDiagnostico, isDeleting } = useDiagnosticoAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [planoFilter, setPlanoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFormulario, setSelectedFormulario] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formularioToDelete, setFormularioToDelete] = useState<any>(null);

  const filteredFormularios = formularios?.filter((form: any) => {
    const nomeCompleto = form.profiles?.nome_completo || form.nome_completo || "";
    const plano = form.profiles?.plano_mentoria || "";
    const matchesSearch = nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlano = planoFilter === "all" || plano === planoFilter;
    const isCompleto = !!form.completado;
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "completo" && isCompleto) || 
      (statusFilter === "incompleto" && !isCompleto);
    return matchesSearch && matchesPlano && matchesStatus;
  });

  const handleViewDetails = (form: any) => {
    if (onViewDetails) {
      onViewDetails(form);
    } else {
      setSelectedFormulario(form);
      setDrawerOpen(true);
    }
  };

  const handleDeleteClick = (form: any) => {
    setFormularioToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (formularioToDelete) {
      deletarDiagnostico(formularioToDelete.id);
      setDeleteDialogOpen(false);
      setFormularioToDelete(null);
    }
  };

  const getPlanoBadgeColor = (plano: string) => {
    switch (plano) {
      case "academy":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "business":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Contadores - apenas planos existentes
  const totalAcademy = formularios?.filter((f: any) => f.profiles?.plano_mentoria === "academy").length || 0;
  const totalBusiness = formularios?.filter((f: any) => f.profiles?.plano_mentoria === "business").length || 0;
  const totalCompletos = formularios?.filter((f: any) => !!f.completado).length || 0;
  const totalIncompletos = formularios?.filter((f: any) => !f.completado).length || 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{formularios?.length || 0}</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3">
          <p className="text-sm text-blue-500">Academy</p>
          <p className="text-2xl font-bold">{totalAcademy}</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3">
          <p className="text-sm text-primary">Business</p>
          <p className="text-2xl font-bold">{totalBusiness}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3">
          <p className="text-sm text-green-500">Completos</p>
          <p className="text-2xl font-bold">{totalCompletos}</p>
        </div>
        <div className="bg-amber-500/10 rounded-lg p-3">
          <p className="text-sm text-amber-500">Incompletos</p>
          <p className="text-2xl font-bold">{totalIncompletos}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={planoFilter} onValueChange={setPlanoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            <SelectItem value="academy">Academy</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completo">Completos</SelectItem>
            <SelectItem value="incompleto">Incompletos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nível IA</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredFormularios?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum diagnóstico encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredFormularios?.map((form: any) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">
                    {form.profiles?.nome_completo || form.nome_completo || "—"}
                  </TableCell>
                  <TableCell>
                    {form.profiles?.plano_mentoria ? (
                      <Badge variant="outline" className={getPlanoBadgeColor(form.profiles.plano_mentoria)}>
                        {form.profiles.plano_mentoria}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={form.completado ? "default" : "secondary"}>
                      {form.completado ? "Completo" : "Incompleto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {form.nivel_ia ? (
                      <Badge variant="outline">{form.nivel_ia}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(form.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(form)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(form)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawer */}
      <FormularioDetalhesDrawer
        formulario={selectedFormulario}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir diagnóstico?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o diagnóstico de{" "}
              <strong>{formularioToDelete?.profiles?.nome_completo || formularioToDelete?.nome_completo || "este usuário"}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
