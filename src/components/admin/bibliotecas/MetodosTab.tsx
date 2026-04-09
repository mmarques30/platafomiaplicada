import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MetodoModal } from "./MetodoModal";
import { useMetodosAdmin, useDeleteMetodo } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "../content/FilterBar";
import { ARSENAL_TIPOS, ARSENAL_FERRAMENTAS } from "@/lib/metodosCategories";

export function MetodosTab() {
  const { data: metodos, isLoading } = useMetodosAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMetodo = useDeleteMetodo();
  
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [ferramentaFilter, setFerramentaFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  const handleEdit = (metodo: any) => {
    setEditingMetodo(metodo);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingMetodo(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMetodo.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const filteredMetodos = useMemo(() => {
    return metodos?.filter(m => {
      const matchesTipo = tipoFilter === 'todos' || (m.tipo || 'skill') === tipoFilter;
      const matchesFerramenta = ferramentaFilter === 'todas' || m.ferramenta === ferramentaFilter;
      const matchesStatus = statusFilter === 'todos' || 
        (statusFilter === 'ativo' && m.ativo) || 
        (statusFilter === 'inativo' && !m.ativo);
      
      return matchesTipo && matchesFerramenta && matchesStatus;
    }) || [];
  }, [metodos, tipoFilter, ferramentaFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        filters={[
          {
            id: 'tipo',
            label: 'Tipo',
            placeholder: 'Todos os tipos',
            options: [
              { value: 'todos', label: 'Todos os tipos' },
              ...ARSENAL_TIPOS.map(t => ({ value: t.value, label: t.label }))
            ],
            value: tipoFilter,
            onChange: setTipoFilter
          },
          {
            id: 'ferramenta',
            label: 'Ferramenta',
            placeholder: 'Todas',
            options: [
              { value: 'todas', label: 'Todas as ferramentas' },
              ...ARSENAL_FERRAMENTAS.map(f => ({ value: f.value, label: `${f.icon} ${f.label}` }))
            ],
            value: ferramentaFilter,
            onChange: setFerramentaFilter
          },
          {
            id: 'status',
            label: 'Status',
            placeholder: 'Todos os status',
            options: [
              { value: 'todos', label: 'Todos os status' },
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' }
            ],
            value: statusFilter,
            onChange: setStatusFilter
          }
        ]}
        totalItems={metodos?.length || 0}
        filteredItems={filteredMetodos.length}
        actionButton={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Título</TableHead>
            <TableHead className="w-[100px]">Tipo</TableHead>
            <TableHead className="w-[120px]">Ferramenta</TableHead>
            <TableHead className="w-[100px]">Nível</TableHead>
            <TableHead className="w-[80px]">Doc</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMetodos?.map((metodo) => {
            const tipoLabel = ARSENAL_TIPOS.find(t => t.value === (metodo.tipo || 'skill'))?.label || metodo.tipo;
            const ferramentaInfo = ARSENAL_FERRAMENTAS.find(f => f.value === metodo.ferramenta);
            return (
              <TableRow key={metodo.id}>
                <TableCell className="font-medium">{metodo.titulo}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="whitespace-nowrap">{tipoLabel}</Badge>
                </TableCell>
                <TableCell>
                  {ferramentaInfo ? (
                    <Badge variant="outline" className="whitespace-nowrap">
                      {ferramentaInfo.icon} {ferramentaInfo.label}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="whitespace-nowrap capitalize">{metodo.nivel || 'intermediario'}</Badge>
                </TableCell>
                <TableCell>
                  {metodo.link_documento ? (
                    <a href={metodo.link_documento} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      <FileText className="h-4 w-4" />
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {metodo.ativo ? (
                    <Badge variant="default" className="whitespace-nowrap">Ativo</Badge>
                  ) : (
                    <Badge variant="destructive" className="whitespace-nowrap">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(metodo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(metodo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <MetodoModal open={isModalOpen} onOpenChange={setIsModalOpen} metodo={editingMetodo} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
