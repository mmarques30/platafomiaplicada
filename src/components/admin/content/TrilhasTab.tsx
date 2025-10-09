import { useState } from "react";
import { useTrilhas, useDeleteTrilha, useTrilhasStats } from "@/hooks/admin/useContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { TrilhaModal } from "./TrilhaModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function TrilhasTab() {
  const { data: trilhas, isLoading } = useTrilhas();
  const { data: stats } = useTrilhasStats();
  const deleteTrilha = useDeleteTrilha();
  const [editingTrilha, setEditingTrilha] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (trilha: any) => {
    setEditingTrilha(trilha);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingTrilha(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTrilha.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Trilhas de Aprendizado</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Trilha
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead>Vídeos</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trilhas?.map((trilha) => {
              const trilhaStat = stats?.find((s: any) => s.trilha_id === trilha.id);
              return (
                <TableRow key={trilha.id}>
                  <TableCell className="font-medium">{trilha.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{trilha.nivel}</Badge>
                  </TableCell>
                  <TableCell>{trilha.ordem}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_modulos || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_videos || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_materiais || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trilha.ativo ? "default" : "secondary"}>
                      {trilha.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(trilha)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(trilha.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TrilhaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        trilha={editingTrilha}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta trilha? Esta ação não pode ser desfeita.
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
