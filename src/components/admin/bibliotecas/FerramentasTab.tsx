import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FerramentaModal } from "./FerramentaModal";
import { useFerramentasAdmin, useDeleteFerramenta } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "../content/FilterBar";

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
        actionButton={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Ferramenta
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead className="w-[140px]">Categoria</TableHead>
            <TableHead className="w-[120px]">Mari</TableHead>
            <TableHead className="w-[140px]">Comunidade</TableHead>
            <TableHead className="w-[90px]">Tipo</TableHead>
            <TableHead className="w-[90px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFerramentas?.map((ferramenta) => (
            <TableRow key={ferramenta.id}>
              <TableCell className="font-medium">{ferramenta.nome}</TableCell>
              <TableCell>{ferramenta.categoria}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{ferramenta.avaliacao_mari || ferramenta.avaliacao || 0}</span>
                  <span className="text-xs text-muted-foreground">/5</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">{ferramenta.avaliacao_comunidade?.toFixed(1) || "0.0"}</span>
                  <span className="text-xs text-muted-foreground">({ferramenta.total_avaliacoes_comunidade || 0})</span>
                </div>
              </TableCell>
              <TableCell>
                {ferramenta.gratuito ? (
                  <Badge variant="secondary" className="whitespace-nowrap">Gratuita</Badge>
                ) : (
                  <Badge variant="outline" className="whitespace-nowrap">Paga</Badge>
                )}
              </TableCell>
              <TableCell>
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
