import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MetodoModal } from "./MetodoModal";
import { useMetodosAdmin, useDeleteMetodo } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function MetodosTab() {
  const { data: metodos, isLoading } = useMetodosAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMetodo = useDeleteMetodo();

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
        <h2 className="text-2xl font-bold">Métodos para Aplicar</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Método
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tem Exemplo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metodos?.map((metodo) => (
            <TableRow key={metodo.id}>
              <TableCell>{metodo.titulo}</TableCell>
              <TableCell>{metodo.categoria}</TableCell>
              <TableCell>
                {metodo.exemplo ? (
                  <Badge variant="secondary">Sim</Badge>
                ) : (
                  <Badge variant="outline">Não</Badge>
                )}
              </TableCell>
              <TableCell>
                {metodo.ativo ? (
                  <Badge variant="default">Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Inativo</Badge>
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
