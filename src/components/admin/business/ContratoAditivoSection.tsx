import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useParseContratoTexto } from "@/hooks/useParseContratoTexto";
import { toast } from "sonner";
import { FileUp, Loader2, Sparkles, Check, X, FileText, History } from "lucide-react";

interface AditivoAlteracoes {
  alteracoes: {
    contratante?: Record<string, any>;
    contrato?: Record<string, any>;
    modulos_selecionados?: string[];
    valores?: Record<string, any>;
  };
  resumo_alteracoes: string;
}

interface ContratoAditivoSectionProps {
  contratoId: string;
  contratoAtual: Record<string, any>;
  onAlteracoesAplicadas: (alteracoes: AditivoAlteracoes["alteracoes"]) => void;
}

const FIELD_LABELS: Record<string, string> = {
  nome_empresa: "Nome da Empresa",
  razao_social: "Razão Social",
  cnpj: "CNPJ",
  endereco: "Endereço",
  representante_nome: "Representante",
  representante_cpf: "CPF Representante",
  representante_rg: "RG Representante",
  representante_email: "Email Representante",
  modulos_contratados: "Módulos Contratados",
  tempo_consultoria_meses: "Tempo de Consultoria (meses)",
  reunioes_mensais: "Reuniões Mensais",
  reports_frequencia: "Frequência de Reports",
  suporte_tipo: "Tipo de Suporte",
  data_inicio: "Data Início",
  data_fim: "Data Fim",
  data_assinatura: "Data Assinatura",
  valor_contrato: "Valor do Contrato",
  valor_entrada: "Valor de Entrada",
  numero_parcelas: "Número de Parcelas",
  valor_parcela: "Valor da Parcela",
  creditos_iniciais: "Créditos Iniciais",
  valor_credito_adicional: "Valor Crédito Adicional",
  duracao_academy_meses: "Duração Academy (meses)",
  roi_projetado: "ROI Projetado (%)",
  multa_rescisao_percentual: "Multa Rescisão (%)",
  valor_hora_tecnica: "Valor Hora Técnica",
};

export function ContratoAditivoSection({
  contratoId,
  contratoAtual,
  onAlteracoesAplicadas,
}: ContratoAditivoSectionProps) {
  const [textoAditivo, setTextoAditivo] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [resultado, setResultado] = useState<AditivoAlteracoes | null>(null);
  const [historico, setHistorico] = useState<Array<{ resumo: string; created_at: string }>>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { extractTextFromFile, isExtracting } = useParseContratoTexto();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const texto = await extractTextFromFile(file);
    if (texto) {
      setTextoAditivo(texto);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcessar = async () => {
    if (!textoAditivo || textoAditivo.trim().length < 30) {
      toast.error("Texto do aditivo muito curto para processamento");
      return;
    }

    setIsParsing(true);
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke("parse-aditivo-contrato", {
        body: {
          texto_aditivo: textoAditivo,
          contrato_atual: contratoAtual,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      const dados = data.dados as AditivoAlteracoes;
      setResultado(dados);
      toast.success("Aditivo processado! Revise as alterações antes de aplicar.");
    } catch (error: unknown) {
      console.error("Erro ao processar aditivo:", error);
      const msg = error instanceof Error ? error.message : "Erro ao processar aditivo";
      toast.error(msg);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAplicar = async () => {
    if (!resultado) return;

    // Save to history
    try {
      await supabase.from("aditivos_contrato" as any).insert({
        contrato_id: contratoId,
        texto_original: textoAditivo,
        alteracoes_json: resultado.alteracoes,
        resumo: resultado.resumo_alteracoes,
      });
    } catch (err) {
      console.error("Erro ao salvar histórico do aditivo:", err);
    }

    onAlteracoesAplicadas(resultado.alteracoes);
    toast.success("Alterações do aditivo aplicadas ao formulário! Salve o contrato para confirmar.");
    setResultado(null);
    setTextoAditivo("");
  };

  const handleDescartar = () => {
    setResultado(null);
    toast.info("Alterações descartadas.");
  };

  const loadHistorico = async () => {
    const { data } = await supabase
      .from("aditivos_contrato" as any)
      .select("resumo, created_at")
      .eq("contrato_id", contratoId)
      .order("created_at", { ascending: false });

    setHistorico((data as any[]) || []);
    setShowHistorico(true);
  };

  const renderDiffSection = (section: string, changes: Record<string, any>) => {
    const entries = Object.entries(changes);
    if (!entries.length) return null;

    return (
      <div key={section} className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {section === "contratante" ? "Contratante" : section === "contrato" ? "Contrato" : "Valores"}
        </p>
        {entries.map(([field, newValue]) => {
          const currentValue = contratoAtual[field];
          const label = FIELD_LABELS[field] || field;
          return (
            <div key={field} className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-muted/50">
              <span className="font-medium min-w-[140px]">{label}:</span>
              {currentValue != null && currentValue !== "" && (
                <span className="line-through text-destructive/70">{String(currentValue)}</span>
              )}
              <span className="text-primary font-semibold">→ {String(newValue)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="border-dashed border-amber-500/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Aditivo / Atualização Contratual</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={loadHistorico}>
            <History className="h-4 w-4 mr-1" />
            Histórico
          </Button>
        </div>
        <CardDescription>
          Importe um aditivo ou documento atualizado. A IA detectará as alterações em relação ao contrato atual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload / Textarea */}
        {!resultado && (
          <>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.doc"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting || isParsing}
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileUp className="h-4 w-4 mr-1" />
                )}
                Upload Documento
              </Button>
            </div>

            <Textarea
              value={textoAditivo}
              onChange={(e) => setTextoAditivo(e.target.value)}
              placeholder="Cole aqui o texto do aditivo contratual ou faça upload de um documento..."
              rows={6}
              className="text-sm"
            />

            <Button
              onClick={handleProcessar}
              disabled={isParsing || !textoAditivo.trim()}
              className="w-full"
            >
              {isParsing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Processar Aditivo com IA
            </Button>
          </>
        )}

        {/* Preview das alterações */}
        {resultado && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm font-medium mb-1">📋 Resumo das Alterações:</p>
              <p className="text-sm text-muted-foreground">{resultado.resumo_alteracoes}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-semibold">Campos Alterados:</p>

              {resultado.alteracoes.contratante &&
                renderDiffSection("contratante", resultado.alteracoes.contratante)}
              {resultado.alteracoes.contrato &&
                renderDiffSection("contrato", resultado.alteracoes.contrato)}
              {resultado.alteracoes.valores &&
                renderDiffSection("valores", resultado.alteracoes.valores)}

              {resultado.alteracoes.modulos_selecionados && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Módulos Selecionados
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {resultado.alteracoes.modulos_selecionados.map((m) => (
                      <Badge key={m} variant="secondary" className="text-xs">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleAplicar} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Aplicar Alterações
              </Button>
              <Button variant="outline" onClick={handleDescartar}>
                <X className="h-4 w-4 mr-2" />
                Descartar
              </Button>
            </div>
          </div>
        )}

        {/* Histórico */}
        {showHistorico && historico.length > 0 && (
          <div className="mt-4">
            <Separator className="mb-3" />
            <p className="text-sm font-semibold mb-2">Histórico de Aditivos</p>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {historico.map((h, i) => (
                  <div key={i} className="p-2 rounded bg-muted/50 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1">{h.resumo}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {showHistorico && historico.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhum aditivo processado ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
