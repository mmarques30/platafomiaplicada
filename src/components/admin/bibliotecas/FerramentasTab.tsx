import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FerramentaModal } from "./FerramentaModal";
import { useFerramentasAdmin, useDeleteFerramenta } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "../content/FilterBar";
import { RatingStars } from "@/components/shared/RatingStars";

export function FerramentasTab() {
  const { data: ferramentas, isLoading } = useFerramentasAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFerramenta, setEditingFerramenta] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteFerramenta = useDeleteFerramenta();
  
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [gratuitoFilter, setGratuitoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  const handleEdit = (ferramenta: any) => {
    setEditingFerramenta(ferramenta);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingFerramenta(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFerramenta.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const uniqueCategories = useMemo(() => {
    const categories = ferramentas?.map(f => f.categoria) || [];
    return Array.from(new Set(categories));
  }, [ferramentas]);

  const filteredFerramentas = useMemo(() => {
    return ferramentas?.filter(f => {
      const matchesCategoria = categoriaFilter === 'todas' || f.categoria === categoriaFilter;
      const matchesGratuito = gratuitoFilter === 'todos' || 
        (gratuitoFilter === 'gratuito' && f.gratuito) || 
        (gratuitoFilter === 'pago' && !f.gratuito);
      const matchesStatus = statusFilter === 'todos' || 
        (statusFilter === 'ativo' && f.ativo) || 
        (statusFilter === 'inativo' && !f.ativo);
      
      return matchesCategoria && matchesGratuito && matchesStatus;
    }) || [];
  }, [ferramentas, categoriaFilter, gratuitoFilter, statusFilter]);

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ferramentas IA</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ferramenta
        </Button>
      </div>

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
            id: 'gratuito',
            label: 'Tipo',
            placeholder: 'Todos os tipos',
            options: [
              { value: 'todos', label: 'Todos os tipos' },
              { value: 'gratuito', label: 'Gratuito' },
              { value: 'pago', label: 'Pago' }
            ],
            value: gratuitoFilter,
            onChange: setGratuitoFilter
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
        onClear={() => {
          setCategoriaFilter('todas');
          setGratuitoFilter('todos');
          setStatusFilter('todos');
        }}
        totalItems={ferramentas?.length || 0}
        filteredItems={filteredFerramentas.length}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead className="w-[180px]">Categoria</TableHead>
            <TableHead className="w-[100px]">Avaliação</TableHead>
            <TableHead className="w-[100px]">Gratuito</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFerramentas?.map((ferramenta) => (
            <TableRow key={ferramenta.id}>
              <TableCell className="w-[200px]">{ferramenta.nome}</TableCell>
              <TableCell className="w-[180px]">{ferramenta.categoria}</TableCell>
              <TableCell className="w-[100px]">
                <RatingStars rating={ferramenta.avaliacao || 0} size="sm" />
              </TableCell>
              <TableCell className="w-[100px]">
                {ferramenta.gratuito ? (
                  <Badge variant="secondary" className="whitespace-nowrap">Gratuito</Badge>
                ) : (
                  <Badge variant="outline" className="whitespace-nowrap">Pago</Badge>
                )}
              </TableCell>
              <TableCell className="w-[120px]">
                {ferramenta.ativo ? (
                  <Badge variant="default" className="whitespace-nowrap">Ativo</Badge>
                ) : (
                  <Badge variant="destructive" className="whitespace-nowrap">Inativo</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(ferramenta)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(ferramenta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <FerramentaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        ferramenta={editingFerramenta}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta ferramenta? Esta ação não pode ser desfeita.
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
