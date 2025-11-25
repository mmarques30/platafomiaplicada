import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRegrasUpsell, useDeleteRegraUpsell, RegraUpsell } from "@/hooks/admin/useProdutos";
import { UpsellModal } from "./UpsellModal";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export function RenovacoesTab() {
  const { data: regras, isLoading } = useRegrasUpsell();
  const deleteRegra = useDeleteRegraUpsell();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegra, setSelectedRegra] = useState<RegraUpsell | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regraToDelete, setRegraToDelete] = useState<string | null>(null);

  // Filtrar apenas renovações
  const renovacoes = regras?.filter(regra => regra.tipo === 'renovacao') || [];

  const handleEdit = (regra: RegraUpsell) => {
    setSelectedRegra(regra);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setRegraToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (regraToDelete) {
      await deleteRegra.mutateAsync(regraToDelete);
      setDeleteDialogOpen(false);
      setRegraToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Carregando regras...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Regras de Renovação</h2>
        </div>
        <Button onClick={() => { setSelectedRegra(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Renovação
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Valor Renovação</TableHead>
            <TableHead>Economia</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renovacoes.map((regra) => (
            <TableRow key={regra.id}>
              <TableCell className="font-medium">
                {regra.produto_origem?.nome || "N/A"}
              </TableCell>
              <TableCell>R$ {regra.valor_desconto.toFixed(2)}</TableCell>
              <TableCell className="text-green-600">
                - R$ {regra.economia.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant={regra.ativo ? "default" : "secondary"}>
                  {regra.ativo ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(regra)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(regra.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UpsellModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        regra={selectedRegra}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta regra de renovação?
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
