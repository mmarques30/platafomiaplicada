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
import { useEntregasSkillsAdmin, useUpsertEntregaSkills, useDeleteEntregaSkills } from "@/hooks/admin/useSkillsPerformanceAdmin";
import { useMembrosEquipeSkills } from "@/hooks/admin/useSkillsPerformanceAdmin";
import { adminTheme } from "@/components/admin/adminTheme";
import { Plus, Pencil, Trash2, Sparkles, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import SkillsTabActions from "./SkillsTabActions";

interface Props {
  equipeId: string;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "atrasado", label: "Atrasado" },
];

const emptyForm = {
  titulo: "",
  descricao: "",
  responsavel_id: "",
  economia_horas_semana: 0,
  roi: 0,
  avaliacao_nota: 0,
  prazo: "",
  status: "pendente",
};

export default function SkillsEntregasTab({ equipeId }: Props) {
  const { data: entregas, isLoading } = useEntregasSkillsAdmin(equipeId);
  const { data: membros } = useMembrosEquipeSkills(equipeId);
  const upsertMutation = useUpsertEntregaSkills();
  const deleteMutation = useDeleteEntregaSkills();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [generating, setGenerating] = useState(false);
  const [associating, setAssociating] = useState(false);

  // Check if backlog has projects
  const { data: backlogCount } = useQuery({
    queryKey: ["backlog-skills-count", equipeId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("backlog_skills")
        .select("id", { count: "exact", head: true })
        .eq("equipe_id", equipeId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!equipeId,
  });

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (entrega: any) => {
    setEditId(entrega.id);
    setForm({
      titulo: entrega.titulo || "",
      descricao: entrega.descricao || "",
      responsavel_id: entrega.responsavel_id || "",
      economia_horas_semana: entrega.economia_horas_semana ?? 0,
      roi: entrega.roi ?? 0,
      avaliacao_nota: entrega.avaliacao_nota ?? 0,
      prazo: entrega.prazo ? entrega.prazo.split("T")[0] : "",
      status: entrega.status || "pendente",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    await upsertMutation.mutateAsync({
      ...(editId ? { id: editId } : {}),
      equipe_id: equipeId,
      titulo: form.titulo,
      descricao: form.descricao || undefined,
      responsavel_id: form.responsavel_id || null,
      economia_horas_semana: form.economia_horas_semana,
      roi: form.roi,
      avaliacao_nota: form.avaliacao_nota,
      prazo: form.prazo || null,
      status: form.status,
    });
    setOpen(false);
  };

  const handleGerarEntregas = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-entregas-skills", {
        body: { equipe_id: equipeId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${data.total} entregas geradas com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["admin-entregas-skills", equipeId] });
    } catch (err: any) {
      console.error("Erro ao gerar entregas:", err);
      toast.error(err.message || "Erro ao gerar entregas com IA");
    } finally {
      setGenerating(false);
    }
  };

  const handleAssociarMembros = async () => {
    setAssociating(true);
    try {
      const { data, error } = await supabase.functions.invoke("associar-membros-skills", {
        body: { equipe_id: equipeId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${data.associados} itens associados com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["admin-entregas-skills", equipeId] });
      queryClient.invalidateQueries({ queryKey: ["backlog-skills", equipeId] });
    } catch (err: any) {
      console.error("Erro ao associar membros:", err);
      toast.error(err.message || "Erro ao associar membros com IA");
    } finally {
      setAssociating(false);
    }
  };

  const itensSemResponsavel = (entregas || []).filter((e: any) => !e.responsavel_id).length;

  const statusBadge = (status: string) => {
    switch (status) {
      case "concluido": return <Badge className="bg-emerald-100 text-emerald-700 border-transparent">Concluído</Badge>;
      case "em_andamento": return <Badge className="bg-amber-100 text-amber-700 border-transparent">Em andamento</Badge>;
      case "atrasado": return <Badge variant="destructive">Atrasado</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Entregas</h3>
          <SkillsTabActions
            onClear={async () => {
              const { error } = await supabase.from("entregas_skills").delete().eq("equipe_id", equipeId);
              if (error) throw error;
              queryClient.invalidateQueries({ queryKey: ["admin-entregas-skills", equipeId] });
            }}
            hasData={!!entregas?.length}
            clearDescription="Todas as entregas desta equipe serão removidas."
          />
          {(backlogCount ?? 0) > 0 && (
            <Badge variant="secondary" className="text-xs">{backlogCount} projeto(s) no backlog</Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {itensSemResponsavel > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAssociarMembros}
              disabled={associating}
              className="gap-1.5"
            >
              {associating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
              {associating ? "Associando..." : `Associar Membros (${itensSemResponsavel})`}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleGerarEntregas}
            disabled={generating || !backlogCount}
            className="gap-1.5"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {generating ? "Gerando..." : "Gerar Entregas com IA"}
          </Button>
          <Button size="sm" className={adminTheme.buttonSm} onClick={openNew}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Nova Entrega
          </Button>
        </div>
      </div>

      <Card className={adminTheme.card}>
        <CardContent className="p-0">
          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>Título</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Responsável</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Horas</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>ROI</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Nota</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Prazo</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                ) : !entregas?.length ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma entrega cadastrada</TableCell></TableRow>
                ) : (
                  entregas.map((e: any) => (
                    <TableRow key={e.id} className={adminTheme.tableRow}>
                      <TableCell className={adminTheme.tableCell + " font-medium"}>{e.titulo}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{(e.responsavel as any)?.nome_completo || "—"}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{statusBadge(e.status)}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{e.economia_horas_semana ?? 0}h</TableCell>
                      <TableCell className={adminTheme.tableCell}>{e.roi ?? 0}%</TableCell>
                      <TableCell className={adminTheme.tableCell}>{e.avaliacao_nota ?? "—"}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{e.prazo ? format(new Date(e.prazo), "dd/MM/yy") : "—"}</TableCell>
                      <TableCell className={adminTheme.tableCell}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => openEdit(e)}>
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
                                <AlertDialogTitle>Excluir entrega?</AlertDialogTitle>
                                <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(e.id)}>Excluir</AlertDialogAction>
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
            <DialogTitle className={adminTheme.dialogTitle}>{editId ? "Editar Entrega" : "Nova Entrega"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
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
                <Label>Responsável</Label>
                <Select value={form.responsavel_id} onValueChange={(v) => setForm((f) => ({ ...f, responsavel_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {membros?.map((m: any) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {(m.profiles as any)?.nome_completo || m.user_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Horas Economizadas</Label>
                <Input type="number" value={form.economia_horas_semana} onChange={(e) => setForm((f) => ({ ...f, economia_horas_semana: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>ROI (%)</Label>
                <Input type="number" value={form.roi} onChange={(e) => setForm((f) => ({ ...f, roi: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Nota</Label>
                <Input type="number" min={0} max={100} value={form.avaliacao_nota} onChange={(e) => setForm((f) => ({ ...f, avaliacao_nota: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input type="date" value={form.prazo} onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))} />
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
