import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { useState } from "react";
import { Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function DiagnosticoUploadModal({ open, onOpenChange, userId }: DiagnosticoUploadModalProps) {
  const { uploadArquivo, salvarDiagnostico, isUploading, isSaving } = useDiagnosticoAdmin(userId);
  const { toast } = useToast();
  const [tipoInput, setTipoInput] = useState<'arquivo' | 'link'>('arquivo');
  const [file, setFile] = useState<File | null>(null);
  const [linkExterno, setLinkExterno] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async () => {
    if (tipoInput === 'link') {
      // Validar URL
      if (!linkExterno.trim()) {
        toast({
          title: "Link obrigatório",
          description: "Por favor, insira um link válido.",
          variant: "destructive",
        });
        return;
      }
      
      if (!linkExterno.startsWith('http://') && !linkExterno.startsWith('https://')) {
        toast({
          title: "URL inválida",
          description: "O link deve começar com http:// ou https://",
          variant: "destructive",
        });
        return;
      }

      // Salvar link diretamente
      salvarDiagnostico(
        { userId, arquivoUrl: linkExterno, observacoes },
        {
          onSuccess: () => {
            setLinkExterno("");
            setObservacoes("");
            onOpenChange(false);
          },
        }
      );
    } else {
      // Fluxo de upload de arquivo existente
      if (!file) return;

      uploadArquivo({ file, userId }, {
        onSuccess: (url) => {
          salvarDiagnostico(
            { userId, arquivoUrl: url, observacoes },
            {
              onSuccess: () => {
                setFile(null);
                setObservacoes("");
                onOpenChange(false);
              },
            }
          );
        },
      });
    }
  };

  const isLoading = isUploading || isSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload de Diagnóstico</DialogTitle>
          <DialogDescription>
            Faça upload do arquivo do diagnóstico realizado externamente.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tipoInput} onValueChange={(v) => setTipoInput(v as 'arquivo' | 'link')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arquivo">Upload de Arquivo</TabsTrigger>
            <TabsTrigger value="link">Link Externo</TabsTrigger>
          </TabsList>

          <TabsContent value="arquivo" className="space-y-4">
            <div>
              <Label htmlFor="file">Arquivo (PDF, DOCX, etc.)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="observacoes-arquivo">Observações (opcional)</Label>
              <Textarea
                id="observacoes-arquivo"
                placeholder="Adicione observações sobre este diagnóstico..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="link">Link do Documento</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://docs.google.com/... ou https://drive.google.com/..."
                value={linkExterno}
                onChange={(e) => setLinkExterno(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole o link do Google Docs, Notion, Drive ou outro serviço
              </p>
            </div>

            <div>
              <Label htmlFor="observacoes-link">Observações (opcional)</Label>
              <Textarea
                id="observacoes-link"
                placeholder="Adicione observações sobre este diagnóstico..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={(tipoInput === 'arquivo' && !file) || (tipoInput === 'link' && !linkExterno.trim()) || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                {tipoInput === 'arquivo' ? (
                  <Upload className="h-4 w-4 mr-2" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
