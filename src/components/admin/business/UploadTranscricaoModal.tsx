import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBulkCreateInstrucoes, useUpdateEtapaMarcos, type EtapaBusiness } from "@/hooks/useEtapasBusiness";

interface UploadTranscricaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etapas: EtapaBusiness[];
  onSuccess?: () => void;
}

interface IAResult {
  instrucoes: Array<{
    titulo: string;
    descricao: string | null;
    responsavel: 'voce' | 'mentor' | 'conjunto';
    ferramenta: 'claude' | 'lovable' | 'reuniao' | 'outro' | null;
    ordem: number;
    prompt_sugerido: string | null;
    dicas: string | null;
  }>;
  marcos: string[];
}

export function UploadTranscricaoModal({ 
  open, 
  onOpenChange, 
  etapas,
  onSuccess 
}: UploadTranscricaoModalProps) {
  const [selectedEtapaId, setSelectedEtapaId] = useState<string>("");
  const [texto, setTexto] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IAResult | null>(null);

  const bulkCreateInstrucoes = useBulkCreateInstrucoes();
  const updateMarcos = useUpdateEtapaMarcos();

  const selectedEtapa = etapas.find(e => e.id === selectedEtapaId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast.error("Formato não suportado. Use TXT, MD ou PDF.");
      return;
    }

    try {
      const content = await file.text();
      setTexto(content);
      toast.success(`Arquivo "${file.name}" carregado`);
    } catch (error) {
      toast.error("Erro ao ler arquivo");
    }
  };

  const handleProcess = async () => {
    if (!selectedEtapaId || !texto.trim()) {
      toast.error("Selecione uma etapa e insira o texto");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('gerar-instrucoes-etapa', {
        body: {
          texto: texto.trim(),
          etapaId: selectedEtapaId,
          etapaTitulo: selectedEtapa?.titulo,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.data);
      toast.success("Instruções geradas com sucesso");
    } catch (error) {
      console.error("Erro ao processar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar transcrição");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !selectedEtapaId) return;

    try {
      // Salvar instruções
      await bulkCreateInstrucoes.mutateAsync({
        etapaId: selectedEtapaId,
        instrucoes: result.instrucoes.map((i, index) => ({
          ...i,
          ordem: index + 1,
          status: 'pendente' as const,
          recursos_url: null,
          gerado_por_ia: true,
        })),
      });

      // Salvar marcos
      if (result.marcos && result.marcos.length > 0) {
        await updateMarcos.mutateAsync({
          etapaId: selectedEtapaId,
          marcos: result.marcos,
        });
      }

      toast.success("Instruções salvas com sucesso");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar instruções");
    }
  };

  const handleClose = () => {
    setSelectedEtapaId("");
    setTexto("");
    setResult(null);
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Instruções com IA
          </DialogTitle>
          <DialogDescription>
            Faça upload de uma transcrição ou cole o texto para gerar instruções automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Etapa</Label>
            <Select value={selectedEtapaId} onValueChange={setSelectedEtapaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {etapas.map(etapa => (
                  <SelectItem key={etapa.id} value={etapa.id}>
                    Encontro {etapa.numero_etapa}: {etapa.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Arquivo</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  TXT, MD ou PDF
                </p>
              </label>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cole a transcrição</Label>
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cole aqui o texto da transcrição ou documento..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {!result && (
            <Button 
              onClick={handleProcess} 
              disabled={isProcessing || !selectedEtapaId || !texto.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Processar com IA
                </>
              )}
            </Button>
          )}

          {result && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Resultado da IA</h4>
                <span className="text-sm text-muted-foreground">
                  {result.instrucoes.length} instruções encontradas
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {result.instrucoes.map((inst, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{inst.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {inst.responsavel === 'voce' ? 'Você' : 
                         inst.responsavel === 'mentor' ? 'Mentor' : 'Conjunto'}
                        {inst.ferramenta && ` • ${inst.ferramenta}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {result.marcos.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Marcos identificados:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.marcos.map((marco, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {marco}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setResult(null)} 
                  className="flex-1"
                >
                  Reprocessar
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={bulkCreateInstrucoes.isPending}
                  className="flex-1"
                >
                  {bulkCreateInstrucoes.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Salvar Instruções
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
