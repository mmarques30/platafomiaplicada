import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRoadmapSkillsAdmin, useUpsertRoadmapSkills, useDeleteRoadmapSkills } from "@/hooks/admin/useSkillsPerformanceAdmin";
import { adminTheme } from "@/components/admin/adminTheme";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Props {
  equipeId: string;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluída" },
];

const emptyForm = {
  numero_fase: 1,
  titulo: "",
  descricao: "",
  semana_inicio: 1,
  semana_fim: 4,
  status: "pendente",
};

export default function SkillsRoadmapTab({ equipeId }: Props) {
  const { data: fases, isLoading } = useRoadmapSkillsAdmin(equipeId);
  const upsertMutation = useUpsertRoadmapSkills();
  const deleteMutation = useDeleteRoadmapSkills();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditId(null);
    const nextFase = fases?.length ? Math.max(...fases.map((f: any) => f.numero_fase)) + 1 : 1;
    setForm({ ...emptyForm, numero_fase: nextFase });
    setOpen(true);
  };

  const openEdit = (fase: any) => {
    setEditId(fase.id);
    setForm({
      numero_fase: fase.numero_fase,
      titulo: fase.titulo || "",
      descricao: fase.descricao || "",
      semana_inicio: fase.semana_inicio ?? 1,
      semana_fim: fase.semana_fim ?? 4,
      status: fase.status || "pendente",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    await upsertMutation.mutateAsync({
      ...(editId ? { id: editId } : {}),
      equipe_id: equipeId,
      ...form,
    });
    setOpen(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "concluido": return <Badge className="bg-emerald-100 text-emerald-700 border-transparent">Concluída</Badge>;
      case "em_andamento": return <Badge className="bg-amber-100 text-amber-700 border-transparent">Em andamento</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Roadmap — Fases</h3>
        <Button size="sm" className={adminTheme.buttonSm} onClick={openNew}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Nova Fase
        </Button>
      </div>

      <Card className={adminTheme.card}>
        <CardContent className="p-0">
          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>#</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Título</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Semanas</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                ) : !fases?.length ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma fase cadastrada</TableCell></TableRow>
                ) : (
                  fases.map((f: any) => (
                    <TableRow key={f.id} className={adminTheme.tableRow}>
                      <TableCell className={adminTheme.tableCell + " font-medium"}>{f.numero_fase}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{f.titulo}</TableCell>
                      <TableCell className={adminTheme.tableCell}>Sem {f.semana_inicio} — {f.semana_fim}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{statusBadge(f.status)}</TableCell>
                      <TableCell className={adminTheme.tableCell}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => openEdit(f)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className={adminTheme.buttonIcon}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir fase?</AlertDialogTitle>
                                <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(f.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={adminTheme.dialogTitle}>{editId ? "Editar Fase" : "Nova Fase"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº da Fase</Label>
                <Input type="number" min={1} value={form.numero_fase} onChange={(e) => setForm((f) => ({ ...f, numero_fase: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semana Início</Label>
                <Input type="number" min={1} max={12} value={form.semana_inicio} onChange={(e) => setForm((f) => ({ ...f, semana_inicio: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Semana Fim</Label>
                <Input type="number" min={1} max={12} value={form.semana_fim} onChange={(e) => setForm((f) => ({ ...f, semana_fim: Number(e.target.value) }))} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={!form.titulo || upsertMutation.isPending}>
              {upsertMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
