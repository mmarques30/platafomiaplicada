import { useState } from "react";
import { useAvisos, useDeleteAviso } from "@/hooks/admin/useAvisos";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AvisoModal } from "@/components/admin/AvisoModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function GerenciarAvisos() {
  const { data: avisos, isLoading } = useAvisos();
  const deleteAviso = useDeleteAviso();
  const [editingAviso, setEditingAviso] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Avisos</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aviso
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Expiração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avisos?.map((aviso) => (
              <TableRow key={aviso.id}>
                <TableCell className="font-medium">{aviso.titulo}</TableCell>
                <TableCell><Badge>{aviso.tipo}</Badge></TableCell>
                <TableCell>{aviso.data_expiracao ? format(new Date(aviso.data_expiracao), "dd/MM/yyyy") : "-"}</TableCell>
                <TableCell>
                  <Badge variant={aviso.ativo ? "default" : "secondary"}>
                    {aviso.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingAviso(aviso); setIsModalOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(aviso.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AvisoModal open={isModalOpen} onOpenChange={setIsModalOpen} aviso={editingAviso} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteAviso.mutate(deleteId); setDeleteId(null); }}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
