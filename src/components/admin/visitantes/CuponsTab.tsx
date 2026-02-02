import { useState, useMemo } from "react";
import { useCuponsVisitantes, CupomVisitante } from "@/hooks/admin/useCuponsVisitantes";
import { useVisitantes } from "@/hooks/useVisitantes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Tag, Users, Percent } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function CuponsTab() {
  const { cupons, isLoading, createCupom, updateCupom, deleteCupom } = useCuponsVisitantes();
  const { visitantes } = useVisitantes();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCupom, setSelectedCupom] = useState<CupomVisitante | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    codigo: "",
    desconto_percentual: 10,
    descricao: "",
    tipo: "manual",
    ativo: true,
  });

  // Contagem de visitantes por cupom
  const visitantesPorCupom = useMemo(() => {
    const counts: Record<string, number> = {};
    visitantes.forEach(v => {
      const cupom = v.cupom_especial || 'Academy12';
      counts[cupom] = (counts[cupom] || 0) + 1;
    });
    return counts;
  }, [visitantes]);

  const handleOpenCreate = () => {
    setSelectedCupom(null);
    setFormData({
      codigo: "",
      desconto_percentual: 10,
      descricao: "",
      tipo: "manual",
      ativo: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cupom: CupomVisitante) => {
    setSelectedCupom(cupom);
    setFormData({
      codigo: cupom.codigo,
      desconto_percentual: cupom.desconto_percentual,
      descricao: cupom.descricao || "",
      tipo: cupom.tipo,
      ativo: cupom.ativo,
    });
    setModalOpen(true);
  };

  const handleOpenDelete = (cupom: CupomVisitante) => {
    setSelectedCupom(cupom);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.codigo.trim()) {
      return;
    }

    if (selectedCupom) {
      updateCupom.mutate({
        id: selectedCupom.id,
        updates: {
          codigo: formData.codigo.trim(),
          desconto_percentual: formData.desconto_percentual,
          descricao: formData.descricao.trim() || null,
          tipo: formData.tipo,
          ativo: formData.ativo,
        },
      });
    } else {
      createCupom.mutate({
        codigo: formData.codigo.trim(),
        desconto_percentual: formData.desconto_percentual,
        descricao: formData.descricao.trim() || undefined,
        tipo: formData.tipo,
        ativo: formData.ativo,
      });
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedCupom) {
      deleteCupom.mutate(selectedCupom.id);
      setDeleteDialogOpen(false);
      setSelectedCupom(null);
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'padrao':
        return <Badge variant="default">Padrão</Badge>;
      case 'engajados':
        return <Badge className="bg-amber-500 text-white">Engajados</Badge>;
      default:
        return <Badge variant="secondary">Manual</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando cupons...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Gerenciar Cupons
              </CardTitle>
              <CardDescription>
                Configure cupons de desconto para visitantes
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cupom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cupom cadastrado
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-center">Desconto</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead className="text-center">Visitantes</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cupons.map((cupom) => (
                    <TableRow key={cupom.id}>
                      <TableCell className="font-mono font-medium">
                        {cupom.codigo}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          <Percent className="h-3 w-3" />
                          {cupom.desconto_percentual}%
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {cupom.descricao || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getTipoBadge(cupom.tipo)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {visitantesPorCupom[cupom.codigo] || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {cupom.ativo ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(cupom.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(cupom)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenDelete(cupom)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCupom ? "Editar Cupom" : "Novo Cupom"}
            </DialogTitle>
            <DialogDescription>
              {selectedCupom
                ? "Atualize as informações do cupom"
                : "Preencha os dados para criar um novo cupom"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Cupom *</Label>
              <Input
                id="codigo"
                placeholder="Ex: PROMO20"
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto (%) *</Label>
              <Input
                id="desconto"
                type="number"
                min={1}
                max={100}
                value={formData.desconto_percentual}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    desconto_percentual: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição opcional do cupom..."
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padrao">Padrão</SelectItem>
                  <SelectItem value="engajados">Engajados</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Cupom Ativo</Label>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, ativo: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.codigo.trim() || createCupom.isPending || updateCupom.isPending}
            >
              {selectedCupom ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cupom</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cupom "{selectedCupom?.codigo}"?
              {(visitantesPorCupom[selectedCupom?.codigo || ''] || 0) > 0 && (
                <span className="block mt-2 text-amber-600">
                  Atenção: {visitantesPorCupom[selectedCupom?.codigo || '']} visitante(s) estão usando este cupom.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
