import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCategorias, useDeleteCategoria } from "@/hooks/admin/useCategorias";
import { CategoriaModal } from "./CategoriaModal";

export function CategoriasTab() {
  const { data: categorias, isLoading } = useCategorias();
  const deleteCategoria = useDeleteCategoria();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (categoria: any) => {
    setEditingCategoria(categoria);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategoria.mutate(id);
    setDeleteId(null);
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Categorias de Módulos</h2>
          <p className="text-muted-foreground text-sm">Gerencie as categorias disponíveis para classificar módulos</p>
        </div>
        <Button onClick={() => { setEditingCategoria(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias?.map((categoria: any) => (
            <TableRow key={categoria.id}>
              <TableCell className="font-medium">{categoria.nome}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">{categoria.slug}</code>
              </TableCell>
              <TableCell className="max-w-xs truncate">{categoria.descricao || "-"}</TableCell>
              <TableCell>
                <Badge variant="outline" style={{ backgroundColor: categoria.cor + "20", borderColor: categoria.cor }}>
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: categoria.cor }} />
                  {categoria.nome}
                </Badge>
              </TableCell>
              <TableCell>{categoria.ordem}</TableCell>
              <TableCell>
                <Badge variant={categoria.ativo ? "default" : "secondary"}>
                  {categoria.ativo ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(categoria)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(categoria.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CategoriaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categoria={editingCategoria}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
              <br /><br />
              <strong>⚠️ Atenção:</strong> Módulos que usam esta categoria não serão afetados, mas ficarão sem categoria atribuída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
