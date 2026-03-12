import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddProjetoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: {
    titulo: string;
    descricao?: string;
    area_impactada?: string;
    prioridade?: string;
    horas_estimadas_economia?: number;
    tempo_atual_horas?: number;
    cargo_executor?: string;
    custo_hora_executor?: number;
  }) => void;
  isLoading?: boolean;
}

export default function AddProjetoModal({ open, onOpenChange, onAdd, isLoading }: AddProjetoModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [area, setArea] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [horas, setHoras] = useState("");
  const [tempoAtual, setTempoAtual] = useState("");
  const [cargoExecutor, setCargoExecutor] = useState("");
  const [custoHora, setCustoHora] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!titulo.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("personalizar-projeto-skills", {
        body: {
          titulo: titulo.trim(),
          area_impactada: area.trim() || undefined,
          descricao_atual: descricao.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.descricao) setDescricao(data.descricao);
      if (data?.area_impactada) setArea(data.area_impactada);
      if (data?.prioridade) setPrioridade(data.prioridade);
      if (data?.horas_estimadas_economia) setHoras(String(data.horas_estimadas_economia));
      if (data?.tempo_atual_horas) setTempoAtual(String(data.tempo_atual_horas));
      if (data?.cargo_executor) setCargoExecutor(data.cargo_executor);
      if (data?.custo_hora_executor) setCustoHora(String(data.custo_hora_executor));
      toast.success("Projeto preenchido com IA!");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao gerar descrição com IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    onAdd({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      area_impactada: area.trim() || undefined,
      prioridade: prioridade || undefined,
      horas_estimadas_economia: horas ? Number(horas) : undefined,
      tempo_atual_horas: tempoAtual ? Number(tempoAtual) : undefined,
      cargo_executor: cargoExecutor.trim() || undefined,
      custo_hora_executor: custoHora ? Number(custoHora) : undefined,
    });
    setTitulo("");
    setDescricao("");
    setArea("");
    setPrioridade("");
    setHoras("");
    setTempoAtual("");
    setCargoExecutor("");
    setCustoHora("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>Adicione um projeto manualmente ao backlog da equipe.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Automação de relatórios" required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="descricao">Descrição</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                disabled={!titulo.trim() || isGenerating}
                onClick={handleGenerateAI}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isGenerating ? "Gerando..." : "Gerar com IA"}
              </Button>
            </div>
            <Textarea id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva o projeto..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="area">Área Impactada</Label>
              <Input id="area" value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: Financeiro" />
            </div>
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Situação Atual - ROI */}
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Situação Atual (para cálculo de ROI)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tempoAtual">Tempo gasto atual (h/semana)</Label>
                <Input id="tempoAtual" type="number" min={0} step={0.5} value={tempoAtual} onChange={e => setTempoAtual(e.target.value)} placeholder="Ex: 10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="horas">Economia Estimada (h/semana)</Label>
                <Input id="horas" type="number" min={0} step={0.5} value={horas} onChange={e => setHoras(e.target.value)} placeholder="Ex: 5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cargoExecutor">Cargo de quem executa</Label>
                <Input id="cargoExecutor" value={cargoExecutor} onChange={e => setCargoExecutor(e.target.value)} placeholder="Ex: Analista Financeiro" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custoHora">Custo/hora (R$)</Label>
                <Input id="custoHora" type="number" min={0} step={1} value={custoHora} onChange={e => setCustoHora(e.target.value)} placeholder="Ex: 45" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!titulo.trim() || isLoading}>Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
