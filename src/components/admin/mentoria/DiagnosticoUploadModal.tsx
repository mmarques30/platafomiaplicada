import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDiagnosticoAdmin } from "@/hooks/useDiagnosticoAdmin";
import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

interface DiagnosticoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function DiagnosticoUploadModal({ open, onOpenChange, userId }: DiagnosticoUploadModalProps) {
  const { uploadArquivo, salvarDiagnostico, isUploading, isSaving } = useDiagnosticoAdmin(userId);
  const [file, setFile] = useState<File | null>(null);
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async () => {
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

        <div className="space-y-4">
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
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Adicione observações sobre este diagnóstico..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
