import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Trash2, 
  CheckCircle2,
  Clock,
  FileUp
} from "lucide-react";
import { useDocumentosBusiness, DocumentoBusiness } from "@/hooks/useDocumentosBusiness";
import { useProcessarDocumentos, ResultadoProcessamento } from "@/hooks/useProcessarDocumentos";
import { GeracaoEntregasModal } from "./GeracaoEntregasModal";

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadDocumento(file, contratoId, tipo);
      
      // Ler conteúdo do arquivo se for texto
      let conteudoTexto = "";
      if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        conteudoTexto = await file.text();
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
    // Juntar todo o conteúdo dos documentos não processados
    const textosParaProcessar = documentos
      .filter(d => !d.processado && d.conteudo_texto)
      .map(d => d.conteudo_texto)
      .join("\n\n---\n\n");

    // Adicionar texto atual se houver
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
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getTipoBadge = (tipo: string) => {
    const tipoMap: Record<string, { label: string; className: string }> = {
      'proposta': { label: 'Proposta', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
      'transcricao': { label: 'Transcrição', className: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
      'anexo': { label: 'Anexo', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
      'solucao': { label: 'Solução', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
      'outro': { label: 'Outro', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const config = tipoMap[tipo] || tipoMap['outro'];
    return <Badge variant="outline" className={`text-xs ${config.className}`}>{config.label}</Badge>;
  };

  const temConteudoParaProcessar = texto.trim() || documentos.some(d => !d.processado && d.conteudo_texto);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos da Solução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de Arquivo */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposta">Proposta Comercial</SelectItem>
                  <SelectItem value="transcricao">Transcrição de Call</SelectItem>
                  <SelectItem value="anexo">Anexo</SelectItem>
                  <SelectItem value="solucao">Documento de Solução</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1">
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
                  onClick={() => fileInputRef.current?.click()}
                  disabled={createDocumento.isPending}
                  className="w-full"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload de Arquivo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou cole o texto</span>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole aqui o texto da proposta, transcrição de call ou outro documento..."
                className="min-h-[120px]"
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTexto}
                  disabled={!texto.trim() || createDocumento.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Salvar Texto
                </Button>
                
                <Button
                  onClick={handleProcessar}
                  disabled={!temConteudoParaProcessar || isProcessing}
                  className="bg-primary"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processando..." : "Processar com IA e Gerar Entregas"}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Documentos */}
          {documentos.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm text-muted-foreground">Documentos Carregados</Label>
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc)}
                      <div>
                        <p className="text-sm font-medium">{doc.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.processado ? "Processado" : "Pendente"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTipoBadge(doc.tipo)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GeracaoEntregasModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        resultado={resultadoIA}
        contratoId={contratoId}
        onSuccess={() => {
          setResultadoIA(null);
          setTexto("");
          onEntregasGeradas?.();
        }}
      />
    </>
  );
}
