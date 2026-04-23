import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Trash2, 
  CheckCircle2,
  Clock,
  FileUp,
  ChevronDown,
  ChevronRight,
  FileText,
  RefreshCw,
  Plus,
  Loader2
} from "lucide-react";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { useProcessarDocumentos, ResultadoProcessamento } from "@/hooks/useProcessarDocumentos";
import { GeracaoEntregasModal } from "./GeracaoEntregasModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export type ModoImportacao = 'nova' | 'atualizar';

interface DocumentosUploadSectionProps {
  contratoId: string;
  modulosContratados: string[];
  onEntregasGeradas?: () => void;
}

export function DocumentosUploadSection({ 
  contratoId, 
  modulosContratados,
  onEntregasGeradas 
}: DocumentosUploadSectionProps) {
  // Buscar apenas documentos para processamento IA
  const { documentos, createDocumento, deleteDocumento, uploadDocumento, isLoading } = useDocumentosBusiness(contratoId, true);
  const { processarDocumento, isProcessing } = useProcessarDocumentos();
  
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<'proposta' | 'transcricao' | 'anexo' | 'solucao' | 'outro'>("proposta");
  const [resultadoIA, setResultadoIA] = useState<ResultadoProcessamento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [modoImportacao, setModoImportacao] = useState<ModoImportacao>('nova');
  const [isExtracting, setIsExtracting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversão segura de ArrayBuffer → base64 (chunks de 32KB, evita stack overflow)
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const CHUNK = 0x8000; // 32KB
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const sub = bytes.subarray(i, i + CHUNK);
      binary += String.fromCharCode.apply(null, sub as unknown as number[]);
    }
    return btoa(binary);
  };

  // Chama edge function de extração via fetch direto (timeout 180s)
  const extrairTextoDocumento = async (file: File): Promise<string | null> => {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    console.log(`[upload] Extraindo texto de ${file.name} (${file.size} bytes, base64=${base64.length})`);

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extrair-texto-documento`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180_000);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          fileType: file.type,
        }),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const msg = data?.error || `HTTP ${resp.status}`;
        throw new Error(msg);
      }

      if (data.fallback) {
        console.warn('[upload] Extração retornou fallback');
        return null;
      }
      return data.texto || null;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Tempo esgotado ao extrair texto (>180s). Tente um arquivo menor ou converta para .md/.txt.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();

    // Validação prévia: formato antigo
    if (lower.endsWith('.doc') || lower.endsWith('.ppt')) {
      toast.error('Formato antigo não suportado. Converta para .docx/.pptx no Word/PowerPoint e tente novamente.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validação prévia: tamanho
    const MAX = 25 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 25MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsExtracting(true);
    let conteudoTexto = '';
    let arquivoUrl: string | null = null;

    try {
      // 1) Extrair texto PRIMEIRO (é o que importa para gerar entregas)
      toast.info('Lendo arquivo...');
      try {
        if (file.type === 'text/plain' || lower.endsWith('.md') || lower.endsWith('.txt')) {
          conteudoTexto = await file.text();
          console.log(`[upload] Texto direto: ${conteudoTexto.length} chars`);
        } else {
          toast.info('Extraindo texto (pode levar até 3 min para PDFs grandes)...');
          const extraido = await extrairTextoDocumento(file);
          if (extraido && extraido.length > 20) {
            conteudoTexto = extraido;
            toast.success(`Texto extraído: ${extraido.length} caracteres`);
          } else {
            toast.warning('Não foi possível extrair texto automaticamente.');
          }
        }
      } catch (extractErr: any) {
        console.error('[upload] Falha na extração:', extractErr);
        toast.error(`Extração falhou: ${extractErr?.message || 'erro desconhecido'}`);
      }

      // 2) Tentar upload do binário (tolera falha)
      try {
        toast.info('Salvando arquivo...');
        arquivoUrl = await uploadDocumento(file, contratoId, tipo);
      } catch (uploadErr: any) {
        console.error('[upload] Falha no upload do binário:', uploadErr);
        toast.warning(`Arquivo binário não armazenado: ${uploadErr?.message || 'erro'}. ${conteudoTexto ? 'Texto extraído será salvo.' : ''}`);
      }

      // 3) Se não temos nem texto nem arquivo, abortar
      if (!conteudoTexto && !arquivoUrl) {
        toast.error('Não foi possível processar o documento (sem texto e sem upload).');
        return;
      }

      // 4) Salvar registro
      await createDocumento.mutateAsync({
        contrato_id: contratoId,
        titulo: file.name,
        tipo,
        arquivo_url: arquivoUrl || undefined,
        conteudo_texto: conteudoTexto || undefined,
        para_processamento_ia: true,
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('[upload] Erro inesperado:', error);
      toast.error(`Erro: ${error?.message || 'falha ao processar arquivo'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddTexto = async () => {
    if (!texto.trim()) return;

    await createDocumento.mutateAsync({
      contrato_id: contratoId,
      titulo: `Texto - ${tipo} - ${new Date().toLocaleDateString()}`,
      tipo,
      conteudo_texto: texto,
      para_processamento_ia: true, // Marcar como documento para IA
    });

    setTexto("");
  };

  const handleProcessar = async () => {
    // Construir fila: 1 documento por vez (preserva hierarquia + evita duplicação)
    const fila: { titulo: string; texto: string }[] = documentos
      .filter(d => !d.processado && d.conteudo_texto)
      .map(d => ({ titulo: d.titulo, texto: d.conteudo_texto as string }));

    if (texto.trim()) {
      fila.push({ titulo: "Texto colado", texto: texto.trim() });
    }

    if (fila.length === 0) return;

    // Acumulador com renumeração global
    const merged: ResultadoProcessamento = {
      etapas: [],
      entregas: [],
      instrucoes: [],
      tasks: [],
      backlog: [],
      entregas_sugeridas: [],
      instrucoes_sugeridas: [],
      backlog_sugerido: [],
    };

    let etapaOffset = 0;
    let entregaOffset = 0;

    for (let i = 0; i < fila.length; i++) {
      const item = fila[i];
      toast.info(`Processando ${i + 1}/${fila.length}: ${item.titulo}`);

      const resultado = await processarDocumento(item.texto, modulosContratados);
      if (!resultado) {
        toast.error(`Falha ao processar: ${item.titulo}`);
        continue;
      }

      const etapas = resultado.etapas || [];
      const entregas = resultado.entregas || [];
      const instrucoes = resultado.instrucoes || [];
      const tasks = resultado.tasks || [];
      const backlog = resultado.backlog || [];

      if (etapas.length > 0 && entregas.length === 0) {
        toast.warning(
          `${item.titulo}: ${etapas.length} fases detectadas, mas 0 entregas. Verifique se o documento usa "ENTREGA N:" em linhas próprias.`
        );
      }

      // Mapas locais → global
      const mapaEtapas = new Map<number, number>();
      etapas.forEach((e) => {
        const novoNumero = etapaOffset + e.numero;
        mapaEtapas.set(e.numero, novoNumero);
        merged.etapas.push({ ...e, numero: novoNumero });
      });

      const mapaEntregas = new Map<number, number>();
      entregas.forEach((en) => {
        const novoNumero = entregaOffset + en.numero_entrega;
        mapaEntregas.set(en.numero_entrega, novoNumero);
        merged.entregas.push({
          ...en,
          numero_entrega: novoNumero,
          etapa_numero: mapaEtapas.get(en.etapa_numero) ?? en.etapa_numero,
        });
      });

      instrucoes.forEach((ins) => {
        merged.instrucoes.push({
          ...ins,
          entrega_numero: mapaEntregas.get(ins.entrega_numero) ?? ins.entrega_numero,
        });
      });

      tasks.forEach((t) => {
        merged.tasks.push({
          ...t,
          entrega_numero: mapaEntregas.get(t.entrega_numero) ?? t.entrega_numero,
        });
      });

      backlog.forEach((b) => merged.backlog.push(b));

      etapaOffset += etapas.length;
      entregaOffset += entregas.length;
    }

    if (merged.entregas.length === 0 && merged.backlog.length === 0) {
      toast.error("Nenhuma entrega foi gerada a partir dos documentos.");
      return;
    }

    toast.success(`${merged.entregas.length} entregas geradas de ${fila.length} documento(s)`);
    setResultadoIA(merged);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDocumento.mutateAsync(id);
  };

  const getStatusIcon = (doc: DocumentoBusiness) => {
    if (doc.processado) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
    }
    return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const getTipoBadge = (tipo: string) => {
    const tipoMap: Record<string, { label: string; className: string }> = {
      'proposta': { label: 'Proposta', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
      'transcricao': { label: 'Transcrição', className: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
      'anexo': { label: 'Anexo', className: 'bg-muted text-muted-foreground' },
      'solucao': { label: 'Solução', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
      'outro': { label: 'Outro', className: 'bg-muted text-muted-foreground' },
    };
    const config = tipoMap[tipo] || tipoMap['outro'];
    return <Badge variant="outline" className={`text-xs ${config.className}`}>{config.label}</Badge>;
  };

  const temConteudoParaProcessar = texto.trim() || documentos.some(d => !d.processado && d.conteudo_texto);

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="border-border/50 border-dashed bg-muted/20">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Geração de Entregas com IA</span>
                {documentos.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{documentos.length} docs</Badge>
                )}
              </div>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 space-y-4">
              {/* Guia de formato ideal */}
              <Alert className="border-blue-500/30 bg-blue-500/5">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-xs font-semibold">Formato recomendado para melhor extração</AlertTitle>
                <AlertDescription className="text-xs space-y-1.5 mt-1.5">
                  <p>Para entregas geradas com hierarquia perfeita, use <strong>Markdown (.md)</strong> ou texto com marcadores:</p>
                  <pre className="bg-muted/50 p-2 rounded text-[10px] overflow-x-auto">{`FASE 1: Nome da Fase
  ENTREGA 1: Nome da Entrega
    PASSO 1: Nome do Passo
      Descrição...
      Prompt: "..." (opcional)
      DICA: ...
  ENTREGA 2: ...
FASE 2: ...`}</pre>
                  <p className="text-muted-foreground">
                    <strong>Aceita:</strong> .md (ideal), .txt, .docx, .pdf, .html, .pptx ·
                    <strong> HTML:</strong> use H1=Fase, H2=Entrega, H3=Passo ·
                    <strong> Múltiplos arquivos:</strong> processados separadamente, sem duplicação.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Upload controls */}
              <div className="flex items-center gap-2">
                <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="transcricao">Transcrição</SelectItem>
                    <SelectItem value="anexo">Anexo</SelectItem>
                    <SelectItem value="solucao">Solução</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.pptx,.ppt,.html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={createDocumento.isPending || isExtracting}
                  className="h-8"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Extraindo...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-3.5 w-3.5 mr-1.5" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou cole o texto</span>
                </div>
              </div>

              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole aqui a proposta, transcrição ou documento..."
                className="min-h-[80px] text-sm bg-background"
              />

              {/* Seletor de Modo de Importação */}
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground">Modo:</span>
                <RadioGroup 
                  value={modoImportacao} 
                  onValueChange={(v) => setModoImportacao(v as ModoImportacao)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nova" id="modo-nova" />
                    <Label htmlFor="modo-nova" className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <Plus className="h-3.5 w-3.5 text-emerald-600" />
                      Nova Importação
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="atualizar" id="modo-atualizar" />
                    <Label htmlFor="modo-atualizar" className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                      Atualizar Existentes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTexto}
                  disabled={!texto.trim() || createDocumento.isPending}
                  className="h-8"
                >
                  Salvar Texto
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleProcessar}
                  disabled={!temConteudoParaProcessar || isProcessing}
                  className="h-8"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {isProcessing ? "Processando..." : "Gerar Entregas"}
                </Button>
              </div>

              {/* Lista de Documentos */}
              {documentos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground font-medium">Documentos Carregados</p>
                  <div className="space-y-1.5">
                    {documentos.map((doc) => (
                      <div 
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getStatusIcon(doc)}
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{doc.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.processado ? "Processado" : "Pendente"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {getTipoBadge(doc.tipo)}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.id)}
                            className="h-7 w-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <GeracaoEntregasModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        resultado={resultadoIA}
        contratoId={contratoId}
        modoImportacao={modoImportacao}
        onSuccess={() => {
          setResultadoIA(null);
          setTexto("");
          onEntregasGeradas?.();
        }}
      />
    </>
  );
}
