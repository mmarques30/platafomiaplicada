import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useContratosBusiness, EntregaEsperada } from "@/hooks/useContratosBusiness";
import { useContratoBusinessMutations } from "@/hooks/useContratoBusinessMutations";
import { ContratoImportSection } from "./ContratoImportSection";
import { ContratoPreviewPDF } from "./ContratoPreviewPDF";
import { ContratoParseResult } from "@/hooks/useParseContratoTexto";
import { MODULOS_DISPONIVEIS, ContratoData, gerarEntregasContratoPadrao, EntregaContratoPadrao } from "@/lib/contratoBusinessTemplate";
import { Plus, Trash2, FileText, Calendar, Target, Save, Loader2, Building2, DollarSign, ChevronDown, ChevronUp, RefreshCw, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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
  { value: "documento", label: "Documento" },
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

  // Dados da Contratante
  const [dadosContratante, setDadosContratante] = useState({
    razao_social: "",
    cnpj: "",
    endereco: "",
    representante_nome: "",
    representante_cpf: "",
    representante_rg: "",
    representante_email: "",
  });

  // Dados do Contrato
  const [formData, setFormData] = useState({
    modulos_contratados: 6,
    tempo_consultoria_meses: 6,
    reunioes_mensais: 2,
    reports_frequencia: "quinzenal",
    suporte_tipo: "chat",
    data_inicio: "",
    data_fim: "",
    data_assinatura: "",
    observacoes: "",
  });

  // Módulos selecionados
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>([]);
  const [modulosCustom, setModulosCustom] = useState<string[]>([]);
  const [novoModulo, setNovoModulo] = useState("");

  // Valores
  const [valores, setValores] = useState({
    valor_contrato: "",
    valor_entrada: "",
    numero_parcelas: "6",
    valor_parcela: "",
    creditos_iniciais: "300",
    valor_credito_adicional: "1",
    duracao_academy_meses: "12",
    roi_projetado: "",
    multa_rescisao_percentual: "30",
    valor_hora_tecnica: "250",
  });

  const [entregas, setEntregas] = useState<EntregaEsperada[]>([]);

  // Estados para controlar seções colapsáveis
  const [secoesAbertas, setSecoesAbertas] = useState({
    contratante: true,
    contrato: false,
    valores: false,
    entregas: false,
  });

  const toggleSecao = (secao: keyof typeof secoesAbertas) => {
    setSecoesAbertas(prev => ({ ...prev, [secao]: !prev[secao] }));
  };

  const todasAbertas = Object.values(secoesAbertas).every(v => v);

  const toggleTodasSecoes = () => {
    const novoValor = !todasAbertas;
    setSecoesAbertas({
      contratante: novoValor,
      contrato: novoValor,
      valores: novoValor,
      entregas: novoValor,
    });
  };

  // Função para limpar todos os dados do formulário
  const handleLimparTudo = () => {
    setDadosContratante({
      razao_social: "",
      cnpj: "",
      endereco: "",
      representante_nome: "",
      representante_cpf: "",
      representante_rg: "",
      representante_email: "",
    });
    
    setFormData({
      modulos_contratados: 6,
      tempo_consultoria_meses: 6,
      reunioes_mensais: 2,
      reports_frequencia: "quinzenal",
      suporte_tipo: "chat",
      data_inicio: "",
      data_fim: "",
      data_assinatura: "",
      observacoes: "",
    });
    
    setModulosSelecionados([]);
    setModulosCustom([]);
    setNovoModulo("");
    
    setValores({
      valor_contrato: "",
      valor_entrada: "",
      numero_parcelas: "6",
      valor_parcela: "",
      creditos_iniciais: "300",
      valor_credito_adicional: "1",
      duracao_academy_meses: "12",
      roi_projetado: "",
      multa_rescisao_percentual: "30",
      valor_hora_tecnica: "250",
    });
    
    setEntregas([]);
    
    toast.success("Formulário limpo. Você pode importar um novo contrato.");
  };

  // Carregar dados existentes
  useEffect(() => {
    if (contrato) {
      setDadosContratante({
        razao_social: (contrato as any).razao_social || "",
        cnpj: (contrato as any).cnpj || "",
        endereco: (contrato as any).endereco || "",
        representante_nome: (contrato as any).representante_nome || "",
        representante_cpf: (contrato as any).representante_cpf || "",
        representante_rg: (contrato as any).representante_rg || "",
        representante_email: (contrato as any).representante_email || "",
      });

      setFormData({
        modulos_contratados: contrato.modulos_contratados || 6,
        tempo_consultoria_meses: contrato.tempo_consultoria_meses || 6,
        reunioes_mensais: contrato.reunioes_mensais || 2,
        reports_frequencia: contrato.reports_frequencia || "quinzenal",
        suporte_tipo: contrato.suporte_tipo || "chat",
        data_inicio: contrato.data_inicio || "",
        data_fim: contrato.data_fim || "",
        data_assinatura: (contrato as any).data_assinatura || "",
        observacoes: contrato.observacoes || "",
      });

      const modulosSalvos = (contrato as any).modulos_selecionados || [];
      setModulosSelecionados(modulosSalvos);
      
      // Identificar módulos customizados (os que não estão na lista padrão)
      const customModulos = modulosSalvos.filter((m: string) => !MODULOS_DISPONIVEIS.includes(m));
      setModulosCustom(customModulos);

      setValores({
        valor_contrato: contrato.valor_contrato?.toString() || "",
        valor_entrada: (contrato as any).valor_entrada?.toString() || "",
        numero_parcelas: (contrato as any).numero_parcelas?.toString() || "6",
        valor_parcela: (contrato as any).valor_parcela?.toString() || "",
        creditos_iniciais: (contrato as any).creditos_iniciais?.toString() || "300",
        valor_credito_adicional: (contrato as any).valor_credito_adicional?.toString() || "1",
        duracao_academy_meses: (contrato as any).duracao_academy_meses?.toString() || "12",
        roi_projetado: contrato.roi_projetado?.toString() || "",
        multa_rescisao_percentual: (contrato as any).multa_rescisao_percentual?.toString() || "30",
        valor_hora_tecnica: (contrato as any).valor_hora_tecnica?.toString() || "250",
      });

      setEntregas(contrato.entregas_esperadas || []);
    }
  }, [contrato]);

  // Handler para dados parseados pela IA
  const handleDataParsed = (parsed: ContratoParseResult) => {
    if (parsed.contratante) {
      setDadosContratante({
        razao_social: parsed.contratante.razao_social || "",
        cnpj: parsed.contratante.cnpj || "",
        endereco: parsed.contratante.endereco || "",
        representante_nome: parsed.contratante.representante_nome || "",
        representante_cpf: parsed.contratante.representante_cpf || "",
        representante_rg: parsed.contratante.representante_rg || "",
        representante_email: parsed.contratante.representante_email || "",
      });
    }

    if (parsed.contrato) {
      setFormData(prev => ({
        ...prev,
        modulos_contratados: parsed.contrato.modulos_contratados || prev.modulos_contratados,
        tempo_consultoria_meses: parsed.contrato.tempo_consultoria_meses || prev.tempo_consultoria_meses,
        reunioes_mensais: parsed.contrato.reunioes_mensais || prev.reunioes_mensais,
        reports_frequencia: parsed.contrato.reports_frequencia || prev.reports_frequencia,
        suporte_tipo: parsed.contrato.suporte_tipo || prev.suporte_tipo,
        data_inicio: parsed.contrato.data_inicio || prev.data_inicio,
        data_fim: parsed.contrato.data_fim || prev.data_fim,
        data_assinatura: parsed.contrato.data_assinatura || prev.data_assinatura,
      }));
    }

    if (parsed.modulos_selecionados?.length) {
      setModulosSelecionados(parsed.modulos_selecionados);
    }

    if (parsed.valores) {
      setValores(prev => ({
        valor_contrato: parsed.valores.valor_contrato?.toString() || prev.valor_contrato,
        valor_entrada: parsed.valores.valor_entrada?.toString() || prev.valor_entrada,
        numero_parcelas: parsed.valores.numero_parcelas?.toString() || prev.numero_parcelas,
        valor_parcela: parsed.valores.valor_parcela?.toString() || prev.valor_parcela,
        creditos_iniciais: parsed.valores.creditos_iniciais?.toString() || prev.creditos_iniciais,
        valor_credito_adicional: parsed.valores.valor_credito_adicional?.toString() || prev.valor_credito_adicional,
        duracao_academy_meses: parsed.valores.duracao_academy_meses?.toString() || prev.duracao_academy_meses,
        roi_projetado: parsed.valores.roi_projetado?.toString() || prev.roi_projetado,
        multa_rescisao_percentual: parsed.valores.multa_rescisao_percentual?.toString() || prev.multa_rescisao_percentual,
        valor_hora_tecnica: parsed.valores.valor_hora_tecnica?.toString() || prev.valor_hora_tecnica,
      }));
    }

    // NOTA: Etapas/entregas NÃO são mais extraídas do contrato
    // Elas são geradas como padrão a partir da quantidade de módulos
  };

  const handleSave = () => {
    const data = {
      user_id: userId,
      // Contratante
      razao_social: dadosContratante.razao_social || null,
      cnpj: dadosContratante.cnpj || null,
      endereco: dadosContratante.endereco || null,
      representante_nome: dadosContratante.representante_nome || null,
      representante_cpf: dadosContratante.representante_cpf || null,
      representante_rg: dadosContratante.representante_rg || null,
      representante_email: dadosContratante.representante_email || null,
      // Contrato
      modulos_contratados: formData.modulos_contratados,
      tempo_consultoria_meses: formData.tempo_consultoria_meses,
      reunioes_mensais: formData.reunioes_mensais,
      reports_frequencia: formData.reports_frequencia,
      suporte_tipo: formData.suporte_tipo,
      data_inicio: formData.data_inicio || null,
      data_fim: formData.data_fim || null,
      data_assinatura: formData.data_assinatura || null,
      observacoes: formData.observacoes || null,
      modulos_selecionados: modulosSelecionados,
      // Valores
      valor_contrato: valores.valor_contrato ? Number(valores.valor_contrato) : null,
      valor_entrada: valores.valor_entrada ? Number(valores.valor_entrada) : null,
      numero_parcelas: valores.numero_parcelas ? Number(valores.numero_parcelas) : null,
      valor_parcela: valores.valor_parcela ? Number(valores.valor_parcela) : null,
      creditos_iniciais: valores.creditos_iniciais ? Number(valores.creditos_iniciais) : null,
      valor_credito_adicional: valores.valor_credito_adicional ? Number(valores.valor_credito_adicional) : null,
      duracao_academy_meses: valores.duracao_academy_meses ? Number(valores.duracao_academy_meses) : null,
      roi_projetado: valores.roi_projetado ? Number(valores.roi_projetado) : null,
      multa_rescisao_percentual: valores.multa_rescisao_percentual ? Number(valores.multa_rescisao_percentual) : null,
      valor_hora_tecnica: valores.valor_hora_tecnica ? Number(valores.valor_hora_tecnica) : null,
      // Entregas
      entregas_esperadas: entregas,
    };

    if (contrato) {
      updateContrato.mutate({ id: contrato.id, data });
    } else {
      createContrato.mutate(data);
    }
  };

  const toggleModulo = (modulo: string) => {
    setModulosSelecionados(prev => 
      prev.includes(modulo) 
        ? prev.filter(m => m !== modulo)
        : [...prev, modulo]
    );
  };

  const handleAddModulo = () => {
    const moduloTrimmed = novoModulo.trim();
    if (!moduloTrimmed) return;
    
    // Verificar se já existe
    if (MODULOS_DISPONIVEIS.includes(moduloTrimmed) || modulosCustom.includes(moduloTrimmed)) {
      return;
    }
    
    setModulosCustom(prev => [...prev, moduloTrimmed]);
    setModulosSelecionados(prev => [...prev, moduloTrimmed]);
    setNovoModulo("");
  };

  const handleRemoveModuloCustom = (modulo: string) => {
    setModulosCustom(prev => prev.filter(m => m !== modulo));
    setModulosSelecionados(prev => prev.filter(m => m !== modulo));
  };

  // Gerar entregas padrão do contrato baseadas nos módulos e duração
  const gerarEntregasPadrao = () => {
    const entregasGeradas = gerarEntregasContratoPadrao(
      formData.modulos_contratados,
      formData.tempo_consultoria_meses,
      formData.data_inicio
    );
    
    // Converter para o formato de EntregaEsperada com prazos calculados
    const dataBase = formData.data_inicio ? new Date(formData.data_inicio) : new Date();
    
    const novasEntregas: EntregaEsperada[] = entregasGeradas.map((eg) => {
      const prazoDate = new Date(dataBase);
      prazoDate.setMonth(prazoDate.getMonth() + eg.mes - 1);
      prazoDate.setDate(Math.min(prazoDate.getDate(), 28)); // Evitar problemas com meses curtos
      
      return {
        titulo: eg.titulo,
        prazo: format(prazoDate, "yyyy-MM-dd"),
        tipo: eg.tipo,
        status: "pendente" as const,
      };
    });
    
    setEntregas(novasEntregas);
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

  // Preparar dados para o PDF
  const contratoDataForPDF: ContratoData = {
    ...dadosContratante,
    ...formData,
    modulos_selecionados: modulosSelecionados,
    valor_contrato: valores.valor_contrato ? Number(valores.valor_contrato) : null,
    valor_entrada: valores.valor_entrada ? Number(valores.valor_entrada) : null,
    numero_parcelas: valores.numero_parcelas ? Number(valores.numero_parcelas) : null,
    valor_parcela: valores.valor_parcela ? Number(valores.valor_parcela) : null,
    creditos_iniciais: valores.creditos_iniciais ? Number(valores.creditos_iniciais) : null,
    valor_credito_adicional: valores.valor_credito_adicional ? Number(valores.valor_credito_adicional) : null,
    duracao_academy_meses: valores.duracao_academy_meses ? Number(valores.duracao_academy_meses) : null,
    roi_projetado: valores.roi_projetado ? Number(valores.roi_projetado) : null,
    multa_rescisao_percentual: valores.multa_rescisao_percentual ? Number(valores.multa_rescisao_percentual) : null,
    valor_hora_tecnica: valores.valor_hora_tecnica ? Number(valores.valor_hora_tecnica) : null,
    entregas_esperadas: entregas,
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
    <div className="space-y-4">
      {/* Seção de Importação com IA */}
      <ContratoImportSection onDataParsed={handleDataParsed} />

      {/* Botões de ação */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLimparTudo}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Tudo
        </Button>
        
        <Button variant="ghost" size="sm" onClick={toggleTodasSecoes}>
          {todasAbertas ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Recolher Tudo
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expandir Tudo
            </>
          )}
        </Button>
      </div>

      {/* Dados da Contratante */}
      <Collapsible open={secoesAbertas.contratante} onOpenChange={() => toggleSecao('contratante')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Dados da Contratante
                  </CardTitle>
                  <CardDescription>
                    Informações da empresa e representante legal
                  </CardDescription>
                </div>
                {secoesAbertas.contratante ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    value={dadosContratante.razao_social}
                    onChange={(e) => setDadosContratante({ ...dadosContratante, razao_social: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={dadosContratante.cnpj}
                    onChange={(e) => setDadosContratante({ ...dadosContratante, cnpj: e.target.value })}
                    placeholder="XX.XXX.XXX/XXXX-XX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={dadosContratante.endereco}
                  onChange={(e) => setDadosContratante({ ...dadosContratante, endereco: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="representante_nome">Representante Legal</Label>
                  <Input
                    id="representante_nome"
                    value={dadosContratante.representante_nome}
                    onChange={(e) => setDadosContratante({ ...dadosContratante, representante_nome: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representante_email">Email</Label>
                  <Input
                    id="representante_email"
                    type="email"
                    value={dadosContratante.representante_email}
                    onChange={(e) => setDadosContratante({ ...dadosContratante, representante_email: e.target.value })}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representante_cpf">CPF</Label>
                  <Input
                    id="representante_cpf"
                    value={dadosContratante.representante_cpf}
                    onChange={(e) => setDadosContratante({ ...dadosContratante, representante_cpf: e.target.value })}
                    placeholder="XXX.XXX.XXX-XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representante_rg">RG</Label>
                  <Input
                    id="representante_rg"
                    value={dadosContratante.representante_rg}
                    onChange={(e) => setDadosContratante({ ...dadosContratante, representante_rg: e.target.value })}
                    placeholder="Número do RG"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Informações do Contrato */}
      <Collapsible open={secoesAbertas.contrato} onOpenChange={() => toggleSecao('contrato')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações do Contrato
                  </CardTitle>
                  <CardDescription>
                    Datas, módulos e configurações gerais
                  </CardDescription>
                </div>
                {secoesAbertas.contrato ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Label htmlFor="data_assinatura">Data Assinatura</Label>
                  <Input
                    id="data_assinatura"
                    type="date"
                    value={formData.data_assinatura}
                    onChange={(e) => setFormData({ ...formData, data_assinatura: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempo">Duração (meses)</Label>
                  <Input
                    id="tempo"
                    type="number"
                    min={1}
                    value={formData.tempo_consultoria_meses}
                    onChange={(e) => setFormData({ ...formData, tempo_consultoria_meses: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modulos">Nº Módulos</Label>
                  <Input
                    id="modulos"
                    type="number"
                    min={1}
                    value={formData.modulos_contratados}
                    onChange={(e) => setFormData({ ...formData, modulos_contratados: Number(e.target.value) })}
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
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Módulos Disponíveis</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {MODULOS_DISPONIVEIS.map((modulo) => (
                    <div key={modulo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modulo-${modulo}`}
                        checked={modulosSelecionados.includes(modulo)}
                        onCheckedChange={() => toggleModulo(modulo)}
                      />
                      <Label htmlFor={`modulo-${modulo}`} className="text-sm font-normal cursor-pointer">
                        {modulo}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Módulos Customizados */}
                {modulosCustom.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Módulos Personalizados</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {modulosCustom.map((modulo) => (
                        <div key={modulo} className="flex items-center space-x-2 bg-muted/50 px-2 py-1 rounded">
                          <Checkbox
                            id={`modulo-custom-${modulo}`}
                            checked={modulosSelecionados.includes(modulo)}
                            onCheckedChange={() => toggleModulo(modulo)}
                          />
                          <Label htmlFor={`modulo-custom-${modulo}`} className="text-sm font-normal cursor-pointer flex-1">
                            {modulo}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveModuloCustom(modulo)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adicionar Novo Módulo */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Adicionar Módulo Personalizado</Label>
                    <Input
                      value={novoModulo}
                      onChange={(e) => setNovoModulo(e.target.value)}
                      placeholder="Nome do novo módulo"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddModulo()}
                    />
                  </div>
                  <Button variant="outline" onClick={handleAddModulo} disabled={!novoModulo.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {modulosSelecionados.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {modulosSelecionados.length} módulo(s) selecionado(s): {modulosSelecionados.join(", ")}
                  </p>
                )}
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
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Valores e Pagamento */}
      <Collapsible open={secoesAbertas.valores} onOpenChange={() => toggleSecao('valores')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Valores e Pagamento
                  </CardTitle>
                  <CardDescription>
                    Configurações financeiras do contrato
                  </CardDescription>
                </div>
                {secoesAbertas.valores ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_contrato">Valor Total (R$)</Label>
                  <Input
                    id="valor_contrato"
                    type="number"
                    min={0}
                    step="0.01"
                    value={valores.valor_contrato}
                    onChange={(e) => setValores({ ...valores, valor_contrato: e.target.value })}
                    placeholder="50000.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_entrada">Entrada (R$)</Label>
                  <Input
                    id="valor_entrada"
                    type="number"
                    min={0}
                    step="0.01"
                    value={valores.valor_entrada}
                    onChange={(e) => setValores({ ...valores, valor_entrada: e.target.value })}
                    placeholder="10000.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_parcelas">Nº Parcelas</Label>
                  <Input
                    id="numero_parcelas"
                    type="number"
                    min={1}
                    value={valores.numero_parcelas}
                    onChange={(e) => setValores({ ...valores, numero_parcelas: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_parcela">Valor Parcela (R$)</Label>
                  <Input
                    id="valor_parcela"
                    type="number"
                    min={0}
                    step="0.01"
                    value={valores.valor_parcela}
                    onChange={(e) => setValores({ ...valores, valor_parcela: e.target.value })}
                    placeholder="6666.67"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditos_iniciais">Créditos Iniciais</Label>
                  <Input
                    id="creditos_iniciais"
                    type="number"
                    min={0}
                    value={valores.creditos_iniciais}
                    onChange={(e) => setValores({ ...valores, creditos_iniciais: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_credito">Valor/Crédito (R$)</Label>
                  <Input
                    id="valor_credito"
                    type="number"
                    min={0}
                    step="0.01"
                    value={valores.valor_credito_adicional}
                    onChange={(e) => setValores({ ...valores, valor_credito_adicional: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracao_academy">Academy (meses)</Label>
                  <Input
                    id="duracao_academy"
                    type="number"
                    min={1}
                    value={valores.duracao_academy_meses}
                    onChange={(e) => setValores({ ...valores, duracao_academy_meses: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI Projetado (%)</Label>
                  <Input
                    id="roi"
                    type="number"
                    min={0}
                    value={valores.roi_projetado}
                    onChange={(e) => setValores({ ...valores, roi_projetado: e.target.value })}
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="multa">Multa Rescisão (%)</Label>
                  <Input
                    id="multa"
                    type="number"
                    min={0}
                    max={100}
                    value={valores.multa_rescisao_percentual}
                    onChange={(e) => setValores({ ...valores, multa_rescisao_percentual: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_tecnica">Hora Técnica (R$)</Label>
                  <Input
                    id="hora_tecnica"
                    type="number"
                    min={0}
                    step="0.01"
                    value={valores.valor_hora_tecnica}
                    onChange={(e) => setValores({ ...valores, valor_hora_tecnica: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Entregas Esperadas do Contrato */}
      <Collapsible open={secoesAbertas.entregas} onOpenChange={() => toggleSecao('entregas')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Entregas Esperadas (Contrato)
                    {entregas.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {entregas.length} entregas
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Cronograma de entregas que aparecerá no contrato PDF
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); gerarEntregasPadrao(); }} 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    Gerar Padrão
                  </Button>
                  <Button 
                    onClick={(e) => { e.stopPropagation(); addEntrega(); }} 
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  {secoesAbertas.entregas ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {/* Info sobre geração automática */}
              {entregas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma entrega definida</p>
                  <p className="text-sm mb-4">
                    Clique em "Gerar Padrão" para criar entregas baseadas em {formData.modulos_contratados} módulos 
                    em {formData.tempo_consultoria_meses} meses
                  </p>
                  <Button onClick={gerarEntregasPadrao} variant="default" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Entregas Padrão
                  </Button>
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
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Botões de Ação */}
      <div className="flex justify-between items-center">
        <ContratoPreviewPDF contratoData={contratoDataForPDF} nomeCliente={userName} contratoId={contrato?.id} />
        
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
