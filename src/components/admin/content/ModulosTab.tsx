import { useState } from "react";
import { useModulos, useDeleteModulo, useModulosStats } from "@/hooks/admin/useContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ModuloModal } from "./ModuloModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ModulosTab() {
  const { data: modulos, isLoading } = useModulos();
  const { data: stats } = useModulosStats();
  const deleteModulo = useDeleteModulo();
  const [editingModulo, setEditingModulo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Módulos</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Módulo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Trilha</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Vídeos</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Exercícios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulos?.map((modulo: any) => {
              const moduloStat = stats?.find((s: any) => s.modulo_id === modulo.id);
              return (
                <TableRow key={modulo.id}>
                  <TableCell className="font-medium">{modulo.titulo}</TableCell>
                  <TableCell>{modulo.trilhas?.titulo}</TableCell>
                  <TableCell>{modulo.ordem}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{moduloStat?.total_videos || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{moduloStat?.total_materiais || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{moduloStat?.total_exercicios || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={modulo.ativo ? "default" : "secondary"}>
                      {modulo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingModulo(modulo); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(modulo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ModuloModal open={isModalOpen} onOpenChange={setIsModalOpen} modulo={editingModulo} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este módulo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteModulo.mutate(deleteId); setDeleteId(null); }}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
