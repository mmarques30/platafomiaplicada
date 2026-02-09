import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useContratosSkills, ProjetoPorTrilha } from "@/hooks/admin/useContratosSkills";
import { ContratoSkillsImportSection } from "./ContratoSkillsImportSection";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Save, Loader2, Building2, DollarSign, ChevronDown, ChevronUp, RotateCcw, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Props { equipeId: string; equipeName?: string }

export function ContratoSkillsManager({ equipeId, equipeName }: Props) {
  const { contrato, isLoading, createContrato, updateContrato } = useContratosSkills(equipeId);

  // Load trilhas for project-per-trail selector
  const { data: trilhas = [] } = useQuery({
    queryKey: ["trilhas-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trilhas").select("id, titulo").eq("ativo", true).order("ordem");
      if (error) throw error;
      return data;
    },
  });

  const [contratante, setContratante] = useState({ empresa_nome: "", cnpj: "", representante_nome: "", representante_email: "" });
  const [programa, setPrograma] = useState({ duracao_programa_semanas: 12, frequencia_encontros: "semanal", reports_frequencia: "trimestral", data_inicio: "", data_fim: "" });
  const [valores, setValores] = useState({ valor_contrato: "", roi_projetado: "" });
  const [projetosPorTrilha, setProjetosPorTrilha] = useState<ProjetoPorTrilha[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [secoesAbertas, setSecoesAbertas] = useState({ contratante: true, programa: false, projetos: false, valores: false });

  useEffect(() => {
    if (contrato) {
      setContratante({ empresa_nome: contrato.empresa_nome || "", cnpj: contrato.cnpj || "", representante_nome: contrato.representante_nome || "", representante_email: contrato.representante_email || "" });
      setPrograma({ duracao_programa_semanas: contrato.duracao_programa_semanas || 12, frequencia_encontros: contrato.frequencia_encontros || "semanal", reports_frequencia: contrato.reports_frequencia || "trimestral", data_inicio: contrato.data_inicio || "", data_fim: contrato.data_fim || "" });
      setValores({ valor_contrato: contrato.valor_contrato?.toString() || "", roi_projetado: contrato.roi_projetado?.toString() || "" });
      setProjetosPorTrilha(contrato.projetos_por_trilha || []);
      setObservacoes(contrato.observacoes || "");
    }
  }, [contrato]);

  const toggleSecao = (s: keyof typeof secoesAbertas) => setSecoesAbertas(p => ({ ...p, [s]: !p[s] }));
  const todasAbertas = Object.values(secoesAbertas).every(v => v);
  const toggleTodas = () => { const v = !todasAbertas; setSecoesAbertas({ contratante: v, programa: v, projetos: v, valores: v }); };

  const handleLimpar = () => {
    setContratante({ empresa_nome: "", cnpj: "", representante_nome: "", representante_email: "" });
    setPrograma({ duracao_programa_semanas: 12, frequencia_encontros: "semanal", reports_frequencia: "trimestral", data_inicio: "", data_fim: "" });
    setValores({ valor_contrato: "", roi_projetado: "" });
    setProjetosPorTrilha([]);
    setObservacoes("");
    toast.success("Formulário limpo");
  };

  const handleImportParsed = (parsed: any) => {
    if (parsed.contratante) setContratante(p => ({ ...p, ...parsed.contratante }));
    if (parsed.programa) setPrograma(p => ({ ...p, ...parsed.programa }));
    if (parsed.valores) setValores(p => ({ valor_contrato: parsed.valores.valor_contrato?.toString() || p.valor_contrato, roi_projetado: parsed.valores.roi_projetado?.toString() || p.roi_projetado }));
    if (parsed.projetos_por_trilha) setProjetosPorTrilha(parsed.projetos_por_trilha);
    if (parsed.observacoes) setObservacoes(parsed.observacoes);
  };

  const handleSave = () => {
    const data: any = {
      equipe_id: equipeId,
      ...contratante,
      ...programa,
      valor_contrato: valores.valor_contrato ? Number(valores.valor_contrato) : null,
      roi_projetado: valores.roi_projetado ? Number(valores.roi_projetado) : null,
      projetos_por_trilha: projetosPorTrilha,
      observacoes: observacoes || null,
    };
    if (contrato) updateContrato.mutate({ id: contrato.id, data });
    else createContrato.mutate(data);
  };

  // Projetos por Trilha helpers
  const addTrilha = (trilhaId: string) => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha || projetosPorTrilha.some(p => p.trilha_id === trilhaId)) return;
    setProjetosPorTrilha(p => [...p, { trilha_id: trilhaId, trilha_titulo: trilha.titulo, projetos: [] }]);
  };
  const removeTrilha = (idx: number) => setProjetosPorTrilha(p => p.filter((_, i) => i !== idx));
  const addProjeto = (trilhaIdx: number) => {
    setProjetosPorTrilha(p => p.map((t, i) => i === trilhaIdx ? { ...t, projetos: [...t.projetos, { titulo: "", descricao: "" }] } : t));
  };
  const updateProjeto = (tIdx: number, pIdx: number, field: string, value: string) => {
    setProjetosPorTrilha(p => p.map((t, i) => i === tIdx ? { ...t, projetos: t.projetos.map((pr, j) => j === pIdx ? { ...pr, [field]: value } : pr) } : t));
  };
  const removeProjeto = (tIdx: number, pIdx: number) => {
    setProjetosPorTrilha(p => p.map((t, i) => i === tIdx ? { ...t, projetos: t.projetos.filter((_, j) => j !== pIdx) } : t));
  };

  if (isLoading) return <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>;

  return (
    <div className="space-y-4">
      <ContratoSkillsImportSection onDataParsed={handleImportParsed} />

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handleLimpar} className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <RotateCcw className="h-4 w-4 mr-2" /> Limpar Tudo
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleTodas}>
          {todasAbertas ? <><ChevronUp className="h-4 w-4 mr-2" /> Recolher</> : <><ChevronDown className="h-4 w-4 mr-2" /> Expandir</>}
        </Button>
      </div>

      {/* Contratante */}
      <Collapsible open={secoesAbertas.contratante} onOpenChange={() => toggleSecao("contratante")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Contratante</CardTitle>
                {secoesAbertas.contratante ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Empresa</Label><Input value={contratante.empresa_nome} onChange={e => setContratante(p => ({ ...p, empresa_nome: e.target.value }))} /></div>
              <div className="space-y-2"><Label>CNPJ</Label><Input value={contratante.cnpj} onChange={e => setContratante(p => ({ ...p, cnpj: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Representante</Label><Input value={contratante.representante_nome} onChange={e => setContratante(p => ({ ...p, representante_nome: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email Representante</Label><Input value={contratante.representante_email} onChange={e => setContratante(p => ({ ...p, representante_email: e.target.value }))} /></div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Programa */}
      <Collapsible open={secoesAbertas.programa} onOpenChange={() => toggleSecao("programa")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Programa</CardTitle>
                {secoesAbertas.programa ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duração (semanas)</Label><Input type="number" value={programa.duracao_programa_semanas} onChange={e => setPrograma(p => ({ ...p, duracao_programa_semanas: Number(e.target.value) }))} /></div>
              <div className="space-y-2"><Label>Frequência Encontros</Label>
                <Select value={programa.frequencia_encontros} onValueChange={v => setPrograma(p => ({ ...p, frequencia_encontros: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="semanal">Semanal</SelectItem><SelectItem value="quinzenal">Quinzenal</SelectItem><SelectItem value="mensal">Mensal</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={programa.data_inicio} onChange={e => setPrograma(p => ({ ...p, data_inicio: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Data Fim</Label><Input type="date" value={programa.data_fim} onChange={e => setPrograma(p => ({ ...p, data_fim: e.target.value }))} /></div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Projetos por Trilha */}
      <Collapsible open={secoesAbertas.projetos} onOpenChange={() => toggleSecao("projetos")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Projetos por Trilha <Badge variant="secondary" className="text-xs">{projetosPorTrilha.reduce((a, t) => a + t.projetos.length, 0)}</Badge></CardTitle>
                {secoesAbertas.projetos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Adicionar Trilha</Label>
                  <Select onValueChange={addTrilha}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma trilha" /></SelectTrigger>
                    <SelectContent>
                      {trilhas.filter(t => !projetosPorTrilha.some(p => p.trilha_id === t.id)).map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {projetosPorTrilha.map((trilha, tIdx) => (
                <Card key={trilha.trilha_id} className="border-border/50">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{trilha.trilha_titulo} <Badge variant="outline" className="ml-2 text-xs">{trilha.projetos.length} projetos</Badge></CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addProjeto(tIdx)}><Plus className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTrilha(tIdx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  {trilha.projetos.length > 0 && (
                    <CardContent className="pt-0 space-y-2">
                      {trilha.projetos.map((proj, pIdx) => (
                        <div key={pIdx} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <Input placeholder="Título do projeto" value={proj.titulo} onChange={e => updateProjeto(tIdx, pIdx, "titulo", e.target.value)} className="h-8 text-sm" />
                            <Input placeholder="Descrição" value={proj.descricao} onChange={e => updateProjeto(tIdx, pIdx, "descricao", e.target.value)} className="h-8 text-sm" />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProjeto(tIdx, pIdx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Valores */}
      <Collapsible open={secoesAbertas.valores} onOpenChange={() => toggleSecao("valores")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Valores</CardTitle>
                {secoesAbertas.valores ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Valor Contrato (R$)</Label><Input type="number" value={valores.valor_contrato} onChange={e => setValores(p => ({ ...p, valor_contrato: e.target.value }))} /></div>
              <div className="space-y-2"><Label>ROI Projetado (R$)</Label><Input type="number" value={valores.roi_projetado} onChange={e => setValores(p => ({ ...p, roi_projetado: e.target.value }))} /></div>
              <div className="col-span-2 space-y-2"><Label>Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} /></div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={createContrato.isPending || updateContrato.isPending}>
          {(createContrato.isPending || updateContrato.isPending) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {contrato ? "Atualizar Contrato" : "Criar Contrato"}
        </Button>
      </div>
    </div>
  );
}
