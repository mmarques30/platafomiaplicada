import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDescontos, useDeleteDesconto, type Desconto } from "@/hooks/admin/useProdutos";
import { DescontoModal } from "./DescontoModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DescontosTab() {
  const { data: descontos, isLoading } = useDescontos();
  const deleteDesconto = useDeleteDesconto();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDesconto, setSelectedDesconto] = useState<Desconto | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [descontoToDelete, setDescontoToDelete] = useState<string | null>(null);

  const handleEdit = (desconto: Desconto) => {
    setSelectedDesconto(desconto);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDescontoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (descontoToDelete) {
      await deleteDesconto.mutateAsync(descontoToDelete);
      setDeleteDialogOpen(false);
      setDescontoToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Carregando descontos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Descontos</h2>
          <p className="text-muted-foreground">
            Gerencie descontos e cupons dos produtos
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDesconto(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Desconto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {descontos?.map((desconto) => (
          <Card key={desconto.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{desconto.nome}</CardTitle>
                  {desconto.codigo && (
                    <Badge variant="secondary" className="font-mono">
                      {desconto.codigo}
                    </Badge>
                  )}
                </div>
                <Badge variant={desconto.ativo ? "default" : "secondary"}>
                  {desconto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription>{desconto.motivo}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Desconto</div>
                <div className="text-2xl font-bold">
                  {desconto.tipo_desconto === "percentual"
                    ? `${desconto.valor}%`
                    : `R$ ${desconto.valor.toFixed(2)}`}
                </div>
              </div>

              {desconto.produtos_ids && desconto.produtos_ids.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Produtos</div>
                  <div className="flex flex-wrap gap-1">
                    {desconto.produtos_ids.map((produtoId, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {produtoId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(desconto.data_inicio || desconto.data_fim) && (
                <div>
                  <div className="text-sm font-medium mb-1">Período</div>
                  <div className="text-sm text-muted-foreground">
                    {desconto.data_inicio &&
                      format(new Date(desconto.data_inicio), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    {desconto.data_inicio && desconto.data_fim && " - "}
                    {desconto.data_fim &&
                      format(new Date(desconto.data_fim), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(desconto)}
                  className="flex-1"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(desconto.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {descontos?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum desconto cadastrado ainda
            </p>
            <Button
              onClick={() => {
                setSelectedDesconto(undefined);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Desconto
            </Button>
          </CardContent>
        </Card>
      )}

      <DescontoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        desconto={selectedDesconto}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este desconto? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
