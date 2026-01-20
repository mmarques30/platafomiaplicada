import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Link2 } from 'lucide-react';
import { RecursoItem, useUploadRecurso, getTipoRecurso } from '@/hooks/useInstrucaoRecursos';

interface RecursoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'link' | 'upload';
  onAdd: (recurso: RecursoItem) => void;
  etapaId: string;
  passoNumero: number;
}

export function RecursoUploadModal({
  open,
  onOpenChange,
  mode,
  onAdd,
  etapaId,
  passoNumero,
}: RecursoUploadModalProps) {
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadRecurso, isUploading } = useUploadRecurso();

  const resetForm = () => {
    setUrl('');
    setTitulo('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!titulo) {
        // Usar nome do arquivo sem extensão como título
        setTitulo(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async () => {
    if (mode === 'link') {
      if (!url || !titulo) return;
      
      const recurso: RecursoItem = {
        id: crypto.randomUUID(),
        tipo: getTipoRecurso(url),
        url,
        titulo,
      };
      onAdd(recurso);
      handleClose();
    } else {
      if (!selectedFile || !titulo) return;
      
      const uploadedUrl = await uploadRecurso(selectedFile, etapaId, passoNumero);
      if (uploadedUrl) {
        const recurso: RecursoItem = {
          id: crypto.randomUUID(),
          tipo: getTipoRecurso(uploadedUrl, selectedFile.type),
          url: uploadedUrl,
          titulo,
        };
        onAdd(recurso);
        handleClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'link' ? (
              <>
                <Link2 className="h-5 w-5" />
                Adicionar Link
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload de Arquivo
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'link' ? (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Links do YouTube, Loom, Google Docs ou qualquer URL
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Recurso</Label>
            <Input
              id="titulo"
              placeholder="Ex: Template de diagnóstico"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isUploading ||
                (mode === 'link' && (!url || !titulo)) ||
                (mode === 'upload' && (!selectedFile || !titulo))
              }
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
