import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CursoClassroomModal } from "./CursoClassroomModal";
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

export function CursosClassroomTab() {
  const [showModal, setShowModal] = useState(false);
  const [editingCurso, setEditingCurso] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: cursos, isLoading } = useQuery({
    queryKey: ["admin-classroom-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classroom_courses")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const deleteCurso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("classroom_courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-classroom-courses"] });
      toast.success("Curso excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir curso");
    },
  });

  const handleEdit = (curso: any) => {
    setEditingCurso(curso);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCurso(null);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cursos do Classroom</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Conteúdo gratuito disponível para todos os membros
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
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
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursos?.map((curso) => (
                <TableRow key={curso.id}>
                  <TableCell className="font-medium">{curso.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {curso.tipo === "video" ? "Vídeo" : "Material"}
                    </Badge>
                  </TableCell>
                  <TableCell>{curso.ordem}</TableCell>
                  <TableCell>
                    <Badge variant={curso.ativo ? "default" : "secondary"}>
                      {curso.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(curso)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCurso.mutate(curso.id)}
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

      <CursoClassroomModal
        open={showModal}
        onOpenChange={handleCloseModal}
        curso={editingCurso}
      />
    </Card>
  );
}
