import { useState } from "react";
import { useMateriaisComunidadeAdmin } from "@/hooks/useMateriaisComunidade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialCriadoresModal } from "./MaterialCriadoresModal";
import { RatingStars } from "@/components/comunidade/RatingStars";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPO_LABELS: Record<string, string> = {
  prompt: "Prompt",
  imagem: "Imagem",
  documento: "Documento",
  template: "Template",
  outro: "Outro",
};

const CATEGORIA_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  midjourney: "Midjourney",
  canva: "Canva",
  notion: "Notion",
  excel: "Excel",
  outro: "Outro",
};

export function CriadoresTab() {
  const { materiais, isLoading, toggleAtivo, deleteMaterial } = useMateriaisComunidadeAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (id: string) => {
    setEditingMaterial(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMaterial(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Materiais da Comunidade</CardTitle>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Material
          </Button>
        </CardHeader>
        <CardContent>
          {materiais.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum material cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Criador</TableHead>
                  <TableHead>Avaliacao</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiais.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {material.ordem ?? "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {material.titulo}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {TIPO_LABELS[material.tipo] || material.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIA_LABELS[material.categoria] || material.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {material.criador ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={material.criador.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {material.criador.nome_completo?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]">
                            {material.criador.nome_completo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {material.total_avaliacoes > 0 ? (
                        <div className="flex items-center gap-1">
                          <RatingStars rating={Number(material.media_avaliacoes)} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            ({material.total_avaliacoes})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(material.created_at), "dd/MM/yy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={material.ativo}
                        onCheckedChange={(checked) =>
                          toggleAtivo.mutate({ id: material.id, ativo: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir material?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acao nao pode ser desfeita. O material sera permanentemente excluido.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMaterial.mutate(material.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MaterialCriadoresModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        materialId={editingMaterial}
      />
    </>
  );
}
