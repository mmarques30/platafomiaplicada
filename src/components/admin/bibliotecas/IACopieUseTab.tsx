import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IACopieUseModal } from "./IACopieUseModal";
import { useIACopieUseAdmin, useDeleteIACopieUse } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "../content/FilterBar";

export function IACopieUseTab() {
  const { data: items, isLoading } = useIACopieUseAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteItem = useDeleteIACopieUse();
  
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [iaFilter, setIaFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteItem.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const uniqueCategories = useMemo(() => {
    const categories = items?.map(i => i.categoria) || [];
    return Array.from(new Set(categories));
  }, [items]);

  const uniqueIAs = useMemo(() => {
    const ias = items?.map(i => i.ia_recomendada).filter(Boolean) || [];
    return Array.from(new Set(ias));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items?.filter(i => {
      const matchesCategoria = categoriaFilter === 'todas' || i.categoria === categoriaFilter;
      const matchesIA = iaFilter === 'todas' || i.ia_recomendada === iaFilter;
      const matchesStatus = statusFilter === 'todos' || 
        (statusFilter === 'ativo' && i.ativo) || 
        (statusFilter === 'inativo' && !i.ativo);
      
      return matchesCategoria && matchesIA && matchesStatus;
    }) || [];
  }, [items, categoriaFilter, iaFilter, statusFilter]);

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
              ...uniqueCategories.map(c => ({ value: c, label: c }))
            ],
            value: categoriaFilter,
            onChange: setCategoriaFilter
          },
          {
            id: 'ia',
            label: 'IA Recomendada',
            placeholder: 'Todas as IAs',
            options: [
              { value: 'todas', label: 'Todas as IAs' },
              ...uniqueIAs.map(ia => ({ value: ia, label: ia }))
            ],
            value: iaFilter,
            onChange: setIaFilter
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
        totalItems={items?.length || 0}
        filteredItems={filteredItems.length}
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
            <TableHead className="w-[250px]">Título</TableHead>
            <TableHead className="w-[180px]">Categoria</TableHead>
            <TableHead className="w-[150px]">IA Recomendada</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="w-[250px]">{item.titulo}</TableCell>
              <TableCell className="w-[180px]">{item.categoria}</TableCell>
              <TableCell className="w-[150px]">{item.ia_recomendada || "-"}</TableCell>
              <TableCell className="w-[120px]">
                {item.ativo ? (
                  <Badge variant="default" className="whitespace-nowrap">Ativo</Badge>
                ) : (
                  <Badge variant="destructive" className="whitespace-nowrap">Inativo</Badge>
                )}
              </TableCell>
              <TableCell className="w-[100px]">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <IACopieUseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={editingItem}
      />

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
