import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEquipeSkillsDetail, useUpdateEquipeSkills, useMembrosEquipeSkills } from "@/hooks/admin/useSkillsPerformanceAdmin";
import { adminTheme } from "@/components/admin/adminTheme";
import { Pencil, Building2, Calendar, DollarSign, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface Props {
  equipeId: string;
}

export default function SkillsEquipesTab({ equipeId }: Props) {
  const { data: equipe, isLoading } = useEquipeSkillsDetail(equipeId);
  const { data: membros } = useMembrosEquipeSkills(equipeId);
  const updateMutation = useUpdateEquipeSkills();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    semana_atual: 1,
    investimento: 0,
    custo_hora_padrao: 0,
    data_inicio: "",
    data_fim: "",
  });

  const openEdit = () => {
    if (equipe) {
      setForm({
        semana_atual: (equipe as any).semana_atual ?? 1,
        investimento: (equipe as any).investimento ?? 0,
        custo_hora_padrao: (equipe as any).custo_hora_padrao ?? 0,
        data_inicio: (equipe as any).data_inicio ?? "",
        data_fim: (equipe as any).data_fim ?? "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: equipeId,
      semana_atual: form.semana_atual,
      investimento: form.investimento,
      custo_hora_padrao: form.custo_hora_padrao,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
    });
    setOpen(false);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!equipe) return null;

  const eq = equipe as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{eq.nome}</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className={adminTheme.buttonSm} onClick={openEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={adminTheme.dialogTitle}>Editar Equipe</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Semana Atual</Label>
                  <Input type="number" min={1} max={12} value={form.semana_atual} onChange={(e) => setForm((f) => ({ ...f, semana_atual: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Investimento (R$)</Label>
                  <Input type="number" value={form.investimento} onChange={(e) => setForm((f) => ({ ...f, investimento: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo/Hora (R$)</Label>
                  <Input type="number" value={form.custo_hora_padrao} onChange={(e) => setForm((f) => ({ ...f, custo_hora_padrao: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input type="date" value={form.data_inicio} onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={form.data_fim} onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard icon={<Building2 className="h-4 w-4" />} label="Empresa" value={eq.empresa_nome || "—"} />
        <InfoCard icon={<Calendar className="h-4 w-4" />} label="Período" value={eq.data_inicio && eq.data_fim ? `${format(new Date(eq.data_inicio), "dd/MM/yyyy")} — ${format(new Date(eq.data_fim), "dd/MM/yyyy")}` : "Não definido"} />
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Semana Atual" value={`Semana ${eq.semana_atual ?? 1} de 12`} />
        <InfoCard icon={<DollarSign className="h-4 w-4" />} label="Investimento" value={eq.investimento ? `R$ ${Number(eq.investimento).toLocaleString("pt-BR")}` : "—"} />
        <InfoCard icon={<DollarSign className="h-4 w-4" />} label="Custo/Hora" value={eq.custo_hora_padrao ? `R$ ${Number(eq.custo_hora_padrao).toLocaleString("pt-BR")}` : "—"} />
        <InfoCard icon={<Users className="h-4 w-4" />} label="Membros" value={`${membros?.length ?? 0} ativos`} />
      </div>

      {membros && membros.length > 0 && (
        <Card className={adminTheme.card}>
          <CardHeader className={adminTheme.cardHeader}>
            <CardTitle className={adminTheme.cardTitle}>Membros da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {membros.map((m: any) => (
                <div key={m.user_id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                  <span className="font-medium">{(m.profiles as any)?.nome_completo || "Sem nome"}</span>
                  <span className="text-xs text-muted-foreground capitalize">{m.papel} {m.cargo ? `· ${m.cargo}` : ""}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className={adminTheme.statsCard}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
