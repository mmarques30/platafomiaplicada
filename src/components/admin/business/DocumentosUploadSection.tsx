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
  Plus
} from "lucide-react";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { useProcessarDocumentos, ResultadoProcessamento } from "@/hooks/useProcessarDocumentos";
import { GeracaoEntregasModal } from "./GeracaoEntregasModal";

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
  const { documentos, createDocumento, deleteDocumento, uploadDocumento, isLoading } = useDocumentosBusiness(contratoId);
  const { processarDocumento, isProcessing } = useProcessarDocumentos();
  
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<'proposta' | 'transcricao' | 'anexo' | 'solucao' | 'outro'>("proposta");
  const [resultadoIA, setResultadoIA] = useState<ResultadoProcessamento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [modoImportacao, setModoImportacao] = useState<ModoImportacao>('nova');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadDocumento(file, contratoId, tipo);
      
      let conteudoTexto = "";
      // Para arquivos de texto, extrair conteúdo diretamente
      if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        conteudoTexto = await file.text();
      }
      // Para DOCX, tentar extrair texto (simplificado - lê como texto raw)
      else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        // O conteúdo será processado pela IA mesmo sem texto extraído
        // O arquivo está salvo e disponível para download
        conteudoTexto = `[Documento: ${file.name}] - Conteúdo será processado pela IA`;
      }

      await createDocumento.mutateAsync({
        contrato_id: contratoId,
        titulo: file.name,
        tipo,
        arquivo_url: url,
        conteudo_texto: conteudoTexto || undefined,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  const handleAddTexto = async () => {
    if (!texto.trim()) return;

    await createDocumento.mutateAsync({
      contrato_id: contratoId,
      titulo: `Texto - ${tipo} - ${new Date().toLocaleDateString()}`,
      tipo,
      conteudo_texto: texto,
    });

    setTexto("");
  };

  const handleProcessar = async () => {
    const textosParaProcessar = documentos
      .filter(d => !d.processado && d.conteudo_texto)
      .map(d => d.conteudo_texto)
      .join("\n\n---\n\n");

    const textoFinal = texto.trim() 
      ? `${textosParaProcessar}\n\n---\n\n${texto}` 
      : textosParaProcessar;

    if (!textoFinal.trim()) {
      return;
    }

    const resultado = await processarDocumento(textoFinal, modulosContratados);
    
    if (resultado) {
      setResultadoIA(resultado);
      setModalOpen(true);
    }
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
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={createDocumento.isPending}
                  className="h-8"
                >
                  <FileUp className="h-3.5 w-3.5 mr-1.5" />
                  Upload
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
