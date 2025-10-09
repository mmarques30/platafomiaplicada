import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Link as LinkIcon } from "lucide-react";
import { Material } from "@/types/video";

interface MaterialUploadProps {
  onAdd: (material: Material) => void;
  onCancel: () => void;
}

export function MaterialUpload({ onAdd, onCancel }: MaterialUploadProps) {
  const [tipo, setTipo] = useState<Material['tipo']>('link');
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB");
        return;
      }
      setArquivo(file);
      if (!titulo) {
        setTitulo(file.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (tipo === 'link' && !url.trim()) {
      toast.error("URL é obrigatória para links externos");
      return;
    }

    if ((tipo === 'download' || tipo === 'documento') && !arquivo && !url.trim()) {
      toast.error("Selecione um arquivo ou forneça um URL");
      return;
    }

    try {
      setUploading(true);

      let materialUrl = url;
      let arquivoPath = '';
      let arquivoNome = '';
      let arquivoTamanho = 0;

      // Se houver arquivo, fazer upload
      if (arquivo) {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        arquivoPath = fileName;
        arquivoNome = arquivo.name;
        arquivoTamanho = arquivo.size;

        const { error: uploadError, data } = await supabase.storage
          .from('video-materiais')
          .upload(arquivoPath, arquivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('video-materiais')
          .getPublicUrl(arquivoPath);

        materialUrl = urlData.publicUrl;
      }

      const novoMaterial: Material = {
        titulo: titulo.trim(),
        url: materialUrl,
        tipo,
        arquivo_path: arquivoPath || undefined,
        arquivo_nome: arquivoNome || undefined,
        arquivo_tamanho: arquivoTamanho || undefined,
      };

      onAdd(novoMaterial);
      
      // Resetar campos
      setTitulo('');
      setUrl('');
      setArquivo(null);
      toast.success("Material adicionado com sucesso");
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      toast.error("Erro ao adicionar material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <Label className="text-sm">Tipo de Material</Label>
        <Select value={tipo} onValueChange={(value) => setTipo(value as Material['tipo'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="link">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Link Externo
              </div>
            </SelectItem>
            <SelectItem value="download">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Download (Arquivo)
              </div>
            </SelectItem>
            <SelectItem value="documento">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Documento
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Título</Label>
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Planilha de exercícios"
        />
      </div>

      {tipo === 'link' ? (
        <div className="space-y-2">
          <Label className="text-sm">URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Arquivo</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {arquivo && (
              <p className="text-xs text-muted-foreground">
                {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Máximo 10MB. Formatos: PDF, DOC, DOCX, XLS, XLSX, ZIP, etc.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">URL (Opcional)</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... (caso prefira usar link ao invés de arquivo)"
              type="url"
            />
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? "Adicionando..." : "Adicionar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={uploading}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
