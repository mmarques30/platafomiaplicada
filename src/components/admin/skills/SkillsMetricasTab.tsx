import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMetricasSkillsAdmin, useUpsertMetricaSkills } from "@/hooks/admin/useSkillsPerformanceAdmin";
import { adminTheme } from "@/components/admin/adminTheme";
import { Plus, Pencil, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import SkillsTabActions from "./SkillsTabActions";

interface Props {
  equipeId: string;
}

const emptyForm = {
  semana: 1,
  horas_economizadas: 0,
  projetos_concluidos: 0,
  entregas_concluidas: 0,
  entregas_planejadas: 0,
  indice_maturidade: 0,
  roi_projetado: 0,
  roi_executado: 0,
  engajamento_trilhas: 0,
};

export default function SkillsMetricasTab({ equipeId }: Props) {
  const { data: metricas, isLoading } = useMetricasSkillsAdmin(equipeId);
  const upsertMutation = useUpsertMetricaSkills();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [gerandoIA, setGerandoIA] = useState(false);

  const gerarMetricasIA = async () => {
    setGerandoIA(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-metricas-skills", {
        body: { equipe_id: equipeId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      queryClient.invalidateQueries({ queryKey: ["admin-metricas-skills", equipeId] });
      toast({ title: "Métricas geradas com IA", description: `${data.total} semanas de métricas criadas com sucesso.` });
    } catch (e: any) {
      console.error("Erro ao gerar métricas:", e);
      toast({ title: "Erro ao gerar métricas", description: e.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setGerandoIA(false);
    }
  };

  const openNew = () => {
    setEditId(null);
    const nextSemana = metricas?.length ? Math.max(...metricas.map((m: any) => m.semana)) + 1 : 1;
    setForm({ ...emptyForm, semana: Math.min(nextSemana, 12) });
    setOpen(true);
  };

  const openEdit = (metrica: any) => {
    setEditId(metrica.id);
    setForm({
      semana: metrica.semana,
      horas_economizadas: metrica.horas_economizadas ?? 0,
      projetos_concluidos: metrica.projetos_concluidos ?? 0,
      entregas_concluidas: metrica.entregas_concluidas ?? 0,
      entregas_planejadas: metrica.entregas_planejadas ?? 0,
      indice_maturidade: metrica.indice_maturidade ?? 0,
      roi_projetado: metrica.roi_projetado ?? 0,
      roi_executado: metrica.roi_executado ?? 0,
      engajamento_trilhas: metrica.engajamento_trilhas ?? 0,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Métricas Semanais</h3>
          <SkillsTabActions
            onClear={async () => {
              const { error } = await supabase.from("metricas_skills").delete().eq("equipe_id", equipeId);
              if (error) throw error;
              queryClient.invalidateQueries({ queryKey: ["admin-metricas-skills", equipeId] });
            }}
            hasData={!!metricas?.length}
            clearDescription="Todas as métricas semanais desta equipe serão removidas."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className={adminTheme.buttonSm} onClick={gerarMetricasIA} disabled={gerandoIA}>
            {gerandoIA ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
            {gerandoIA ? "Gerando..." : "Gerar com IA"}
          </Button>
          <Button size="sm" className={adminTheme.buttonSm} onClick={openNew}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Nova Métrica
          </Button>
        </div>
      </div>

      <Card className={adminTheme.card}>
        <CardContent className="p-0">
          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>Semana</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Horas Econ.</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Projetos</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Entregas</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Maturidade</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>ROI Proj.</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>ROI Exec.</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                ) : !metricas?.length ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma métrica cadastrada</TableCell></TableRow>
                ) : (
                  metricas.map((m: any) => (
                    <TableRow key={m.id} className={adminTheme.tableRow}>
                      <TableCell className={adminTheme.tableCell + " font-medium"}>Semana {m.semana}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{m.horas_economizadas ?? 0}h</TableCell>
                      <TableCell className={adminTheme.tableCell}>{m.projetos_concluidos ?? 0}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{m.entregas_concluidas ?? 0}/{m.entregas_planejadas ?? 0}</TableCell>
                      <TableCell className={adminTheme.tableCell}>{m.indice_maturidade ?? 0}%</TableCell>
                      <TableCell className={adminTheme.tableCell}>{m.roi_projetado ?? 0}%</TableCell>
                      <TableCell className={adminTheme.tableCell}>{m.roi_executado ?? 0}%</TableCell>
                      <TableCell className={adminTheme.tableCell}>
                        <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => openEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
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
            <DialogTitle className={adminTheme.dialogTitle}>{editId ? "Editar Métrica" : "Nova Métrica"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semana</Label>
                <Input type="number" min={1} max={12} value={form.semana} onChange={(e) => setForm((f) => ({ ...f, semana: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Horas Economizadas</Label>
                <Input type="number" value={form.horas_economizadas} onChange={(e) => setForm((f) => ({ ...f, horas_economizadas: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Projetos Concluídos</Label>
                <Input type="number" value={form.projetos_concluidos} onChange={(e) => setForm((f) => ({ ...f, projetos_concluidos: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Entregas Concluídas</Label>
                <Input type="number" value={form.entregas_concluidas} onChange={(e) => setForm((f) => ({ ...f, entregas_concluidas: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entregas Planejadas</Label>
                <Input type="number" value={form.entregas_planejadas} onChange={(e) => setForm((f) => ({ ...f, entregas_planejadas: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Índice Maturidade (%)</Label>
                <Input type="number" value={form.indice_maturidade} onChange={(e) => setForm((f) => ({ ...f, indice_maturidade: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ROI Projetado (%)</Label>
                <Input type="number" value={form.roi_projetado} onChange={(e) => setForm((f) => ({ ...f, roi_projetado: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>ROI Executado (%)</Label>
                <Input type="number" value={form.roi_executado} onChange={(e) => setForm((f) => ({ ...f, roi_executado: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Engajamento Trilhas (%)</Label>
              <Input type="number" value={form.engajamento_trilhas} onChange={(e) => setForm((f) => ({ ...f, engajamento_trilhas: Number(e.target.value) }))} />
            </div>
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
