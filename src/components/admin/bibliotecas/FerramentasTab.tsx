import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FerramentaModal } from "./FerramentaModal";
import { useFerramentasAdmin, useDeleteFerramenta } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/shared/RatingStars";

export function FerramentasTab() {
  const { data: ferramentas, isLoading } = useFerramentasAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFerramenta, setEditingFerramenta] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteFerramenta = useDeleteFerramenta();

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Avaliação</TableHead>
            <TableHead>Gratuito</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ferramentas?.map((ferramenta) => (
            <TableRow key={ferramenta.id}>
              <TableCell>{ferramenta.nome}</TableCell>
              <TableCell>{ferramenta.categoria}</TableCell>
              <TableCell>
                <RatingStars rating={ferramenta.avaliacao || 0} size="sm" />
              </TableCell>
              <TableCell>
                {ferramenta.gratuito ? (
                  <Badge variant="secondary">Gratuito</Badge>
                ) : (
                  <Badge variant="outline">Pago</Badge>
                )}
              </TableCell>
              <TableCell>
                {ferramenta.ativo ? (
                  <Badge variant="default">Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Inativo</Badge>
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
