import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useContratosBusiness, EntregaEsperada } from "@/hooks/useContratosBusiness";
import { useContratoBusinessMutations } from "@/hooks/useContratoBusinessMutations";
import { Plus, Trash2, FileText, Calendar, Target, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ContratoBusinessManagerProps {
  userId: string;
  userName?: string;
}

const tiposEntrega = [
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "implementacao", label: "Implementação" },
  { value: "treinamento", label: "Treinamento" },
  { value: "automacao", label: "Automação" },
  { value: "relatorio", label: "Relatório" },
  { value: "workshop", label: "Workshop" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outro", label: "Outro" },
];

const statusEntrega = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "em_andamento", label: "Em Andamento", color: "bg-blue-500/10 text-blue-600" },
  { value: "concluida", label: "Concluída", color: "bg-green-500/10 text-green-600" },
];

export function ContratoBusinessManager({ userId, userName }: ContratoBusinessManagerProps) {
  const { contrato, isLoading } = useContratosBusiness(userId);
  const { createContrato, updateContrato } = useContratoBusinessMutations();

  const [formData, setFormData] = useState({
    modulos_contratados: 6,
    tempo_consultoria_meses: 6,
    reunioes_mensais: 2,
    reports_frequencia: "quinzenal",
    suporte_tipo: "chat",
    data_inicio: "",
    data_fim: "",
    valor_contrato: "",
    roi_projetado: "",
    observacoes: "",
  });

  const [entregas, setEntregas] = useState<EntregaEsperada[]>([]);

  useEffect(() => {
    if (contrato) {
      setFormData({
        modulos_contratados: contrato.modulos_contratados || 6,
        tempo_consultoria_meses: contrato.tempo_consultoria_meses || 6,
        reunioes_mensais: contrato.reunioes_mensais || 2,
        reports_frequencia: contrato.reports_frequencia || "quinzenal",
        suporte_tipo: contrato.suporte_tipo || "chat",
        data_inicio: contrato.data_inicio || "",
        data_fim: contrato.data_fim || "",
        valor_contrato: contrato.valor_contrato?.toString() || "",
        roi_projetado: contrato.roi_projetado?.toString() || "",
        observacoes: contrato.observacoes || "",
      });
      setEntregas(contrato.entregas_esperadas || []);
    }
  }, [contrato]);

  const handleSave = () => {
    const data = {
      user_id: userId,
      modulos_contratados: formData.modulos_contratados,
      tempo_consultoria_meses: formData.tempo_consultoria_meses,
      reunioes_mensais: formData.reunioes_mensais,
      reports_frequencia: formData.reports_frequencia,
      suporte_tipo: formData.suporte_tipo,
      data_inicio: formData.data_inicio || null,
      data_fim: formData.data_fim || null,
      valor_contrato: formData.valor_contrato ? Number(formData.valor_contrato) : null,
      roi_projetado: formData.roi_projetado ? Number(formData.roi_projetado) : null,
      observacoes: formData.observacoes || null,
      entregas_esperadas: entregas,
    };

    if (contrato) {
      updateContrato.mutate({ id: contrato.id, data });
    } else {
      createContrato.mutate(data);
    }
  };

  const addEntrega = () => {
    setEntregas([
      ...entregas,
      {
        titulo: "",
        prazo: format(new Date(), "yyyy-MM-dd"),
        tipo: "implementacao",
        status: "pendente",
      },
    ]);
  };

  const updateEntrega = (index: number, field: keyof EntregaEsperada, value: string) => {
    const updated = [...entregas];
    updated[index] = { ...updated[index], [field]: value };
    setEntregas(updated);
  };

  const removeEntrega = (index: number) => {
    setEntregas(entregas.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {contrato ? "Editar Contrato" : "Criar Contrato"}
          </CardTitle>
          <CardDescription>
            {contrato 
              ? `Editando contrato de ${userName || "mentorado"}`
              : `Definir termos do contrato Business para ${userName || "mentorado"}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modulos">Módulos Contratados</Label>
              <Input
                id="modulos"
                type="number"
                min={1}
                value={formData.modulos_contratados}
                onChange={(e) => setFormData({ ...formData, modulos_contratados: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempo">Tempo (meses)</Label>
              <Input
                id="tempo"
                type="number"
                min={1}
                value={formData.tempo_consultoria_meses}
                onChange={(e) => setFormData({ ...formData, tempo_consultoria_meses: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reunioes">Reuniões Mensais</Label>
              <Input
                id="reunioes"
                type="number"
                min={0}
                value={formData.reunioes_mensais}
                onChange={(e) => setFormData({ ...formData, reunioes_mensais: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reports">Frequência Reports</Label>
              <Select
                value={formData.reports_frequencia}
                onValueChange={(v) => setFormData({ ...formData, reports_frequencia: v })}
              >
                <SelectTrigger id="reports">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="suporte">Tipo de Suporte</Label>
              <Select
                value={formData.suporte_tipo}
                onValueChange={(v) => setFormData({ ...formData, suporte_tipo: v })}
              >
                <SelectTrigger id="suporte">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="prioritario">Prioritário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Contrato (R$)</Label>
              <Input
                id="valor"
                type="number"
                min={0}
                value={formData.valor_contrato}
                onChange={(e) => setFormData({ ...formData, valor_contrato: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roi">ROI Projetado (%)</Label>
              <Input
                id="roi"
                type="number"
                min={0}
                value={formData.roi_projetado}
                onChange={(e) => setFormData({ ...formData, roi_projetado: e.target.value })}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações gerais sobre o contrato..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Entregas Esperadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Entregas Esperadas
              </CardTitle>
              <CardDescription>
                Defina as entregas que aparecerão na timeline do mentorado
              </CardDescription>
            </div>
            <Button onClick={addEntrega} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {entregas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrega definida</p>
              <p className="text-sm">Clique em "Adicionar" para criar entregas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entregas.map((entrega, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr_150px_150px_140px_40px] gap-3 items-end p-4 rounded-lg border bg-muted/30"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Título da Entrega</Label>
                    <Input
                      value={entrega.titulo}
                      onChange={(e) => updateEntrega(index, "titulo", e.target.value)}
                      placeholder="Ex: Diagnóstico Inicial"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={entrega.tipo}
                      onValueChange={(v) => updateEntrega(index, "tipo", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEntrega.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Prazo</Label>
                    <Input
                      type="date"
                      value={entrega.prazo}
                      onChange={(e) => updateEntrega(index, "prazo", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={entrega.status}
                      onValueChange={(v) => updateEntrega(index, "status", v as EntregaEsperada["status"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusEntrega.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <Badge className={s.color} variant="secondary">
                              {s.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntrega(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={createContrato.isPending || updateContrato.isPending}
          size="lg"
        >
          {(createContrato.isPending || updateContrato.isPending) ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {contrato ? "Salvar Alterações" : "Criar Contrato"}
        </Button>
      </div>
    </div>
  );
}
