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
import { METODOS_CATEGORIAS } from "@/lib/metodosCategories";

export function MetodosTab() {
  const { data: metodos, isLoading } = useMetodosAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMetodo = useDeleteMetodo();
  
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [documentoFilter, setDocumentoFilter] = useState('todos');
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
      const matchesCategoria = categoriaFilter === 'todas' || m.categoria === categoriaFilter;
      const matchesDocumento = documentoFilter === 'todos' || 
        (documentoFilter === 'com_documento' && m.link_documento) || 
        (documentoFilter === 'sem_documento' && !m.link_documento);
      const matchesStatus = statusFilter === 'todos' || 
        (statusFilter === 'ativo' && m.ativo) || 
        (statusFilter === 'inativo' && !m.ativo);
      
      return matchesCategoria && matchesDocumento && matchesStatus;
    }) || [];
  }, [metodos, categoriaFilter, documentoFilter, statusFilter]);

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
            id: 'categoria',
            label: 'Categoria',
            placeholder: 'Todas as categorias',
            options: [
              { value: 'todas', label: 'Todas as categorias' },
              ...METODOS_CATEGORIAS.map(c => ({ value: c, label: c }))
            ],
            value: categoriaFilter,
            onChange: setCategoriaFilter
          },
          {
            id: 'documento',
            label: 'Documento',
            placeholder: 'Todos',
            options: [
              { value: 'todos', label: 'Todos' },
              { value: 'com_documento', label: 'Com Documento' },
              { value: 'sem_documento', label: 'Sem Documento' }
            ],
            value: documentoFilter,
            onChange: setDocumentoFilter
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
            Novo Método
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">Título</TableHead>
            <TableHead className="w-[150px]">Categoria</TableHead>
            <TableHead className="w-[100px]">Documento</TableHead>
            <TableHead className="w-[100px]">Exemplo</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMetodos?.map((metodo) => (
            <TableRow key={metodo.id}>
              <TableCell className="w-[220px] font-medium">{metodo.titulo}</TableCell>
              <TableCell className="w-[150px]">
                <Badge variant="outline" className="whitespace-nowrap">{metodo.categoria}</Badge>
              </TableCell>
              <TableCell className="w-[100px]">
                {metodo.link_documento ? (
                  <a 
                    href={metodo.link_documento} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="w-[100px]">
                {metodo.exemplo ? (
                  <Badge variant="default" className="whitespace-nowrap">Sim</Badge>
                ) : (
                  <Badge variant="secondary" className="whitespace-nowrap">Não</Badge>
                )}
              </TableCell>
              <TableCell className="w-[100px]">
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(metodo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MetodoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        metodo={editingMetodo}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este método? Esta ação não pode ser desfeita.
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
