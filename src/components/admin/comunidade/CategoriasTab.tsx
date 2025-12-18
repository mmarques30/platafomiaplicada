import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CategoriaModal } from "./CategoriaModal";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Categoria {
  id: string;
  name: string;
  emoji: string | null;
  ordem: number;
  ativo: boolean;
}

export function CategoriasTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const queryClient = useQueryClient();

  const { data: categorias, isLoading } = useQuery({
    queryKey: ["community-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_categories")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as Categoria[];
    },
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("community_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-categories"] });
      toast.success("Categoria excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir categoria");
    },
  });

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categorias de Posts</CardTitle>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Emoji</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-20">Ordem</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="text-right w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias?.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="text-2xl w-16 text-center">
                    {categoria.emoji || <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell className="font-medium">{categoria.name}</TableCell>
                  <TableCell>{categoria.ordem}</TableCell>
                  <TableCell>
                    <Badge variant={categoria.ativo ? "default" : "secondary"}>
                      {categoria.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(categoria)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoria.mutate(categoria.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CategoriaModal
        open={showModal}
        onOpenChange={handleCloseModal}
        categoria={editingCategoria}
      />
    </Card>
  );
}
