import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProdutos, useDeleteProduto, Produto } from "@/hooks/admin/useProdutos";
import { ProdutoModal } from "./ProdutoModal";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
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

export function ProdutosTab() {
  const { data: produtos, isLoading } = useProdutos();
  const deleteProduto = useDeleteProduto();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const handleEdit = (produto: Produto) => {
    setSelectedProduto(produto);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProdutoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (produtoToDelete) {
      await deleteProduto.mutateAsync(produtoToDelete);
      setDeleteDialogOpen(false);
      setProdutoToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Carregando produtos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Produtos</h2>
        <Button onClick={() => { setSelectedProduto(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {produtos?.map((produto) => (
          <Card key={produto.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{produto.nome}</h3>
                  {produto.is_consultoria && (
                    <Badge className="bg-emerald-500 text-white">Consultoria</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{produto.formato}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={produto.ativo ? "default" : "secondary"}>
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="outline">{produto.tipo.toUpperCase()}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {produto.is_consultoria ? (
                  <span className="font-semibold">
                    R$ {produto.valor_minimo?.toFixed(0)} - R$ {produto.valor_maximo?.toFixed(0)}
                  </span>
                ) : (
                  <span className="font-semibold">
                    R$ {produto.valor.toFixed(2)}
                    {produto.periodicidade && ` / ${produto.periodicidade}`}
                  </span>
                )}
              </div>

              {produto.licencas_minimas && (
                <p className="text-xs text-muted-foreground">
                  Mínimo: {produto.licencas_minimas} licenças
                </p>
              )}

              <p className="text-sm text-muted-foreground">{produto.descricao_curta}</p>

              {produto.beneficios.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold mb-1">Benefícios:</p>
                  <ul className="text-xs space-y-1">
                    {produto.beneficios.slice(0, 3).map((beneficio, index) => (
                      <li key={index} className="text-muted-foreground">• {beneficio}</li>
                    ))}
                    {produto.beneficios.length > 3 && (
                      <li className="text-muted-foreground">
                        + {produto.beneficios.length - 3} mais...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(produto)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(produto.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ProdutoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        produto={selectedProduto}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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
